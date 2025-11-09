'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const TRY_ON_BUCKET = 'product-images'
const PROMPT_BASE = `Combine these two images so the person is naturally and realistically wearing the eyeglasses. Keep the person's facial features, hairstyle, and background unchanged. Ensure the glasses align correctly with the face, preserve scale, add appropriate lighting consistency, and include subtle shadows and lens reflections.`

interface TryOnSuccess {
  ok: true
  outputUrl: string
  selfiePath: string
  resultPath: string
}

interface TryOnFailure {
  ok: false
  message: string
}

type TryOnResponse = TryOnSuccess | TryOnFailure

export async function tryOnAction(formData: FormData): Promise<TryOnResponse> {
  const selfie = formData.get('selfie')
  const frameUrl = formData.get('frameUrl')
  const frameLabel = formData.get('frameLabel')
  const requestId = randomUUID()

  console.info('[tryOnAction] Start request', {
    requestId,
    hasSelfie: selfie instanceof File,
    frameUrl,
    frameLabel,
  })

  if (!(selfie instanceof File)) {
    console.warn('[tryOnAction] Invalid selfie provided', { requestId })
    return { ok: false, message: 'الصورة الشخصية مفقودة أو غير صالحة' }
  }

  if (typeof frameUrl !== 'string' || !frameUrl) {
    console.warn('[tryOnAction] Missing frame URL', { requestId })
    return { ok: false, message: 'رابط صورة الإطار مطلوب' }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (supabaseKey && supabaseKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[tryOnAction] Service key matches anon key; storage writes will fail with RLS', {
      requestId,
    })
    return { ok: false, message: 'خدمة التخزين غير مهيأة بشكل صحيح. يرجى التواصل مع الدعم.' }
  }

  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, message: 'بيانات Supabase غير مهيأة' }
  }

  if (!geminiKey) {
    return { ok: false, message: 'مفتاح Gemini غير مفعّل' }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const selfieBuffer = Buffer.from(await selfie.arrayBuffer())
    const selfieMime = selfie.type || 'image/jpeg'
    const selfiePath = `selfies/${randomUUID()}.jpg`

    console.info('[tryOnAction] Uploading selfie', {
      requestId,
      selfiePath,
      selfieMime,
      selfieSize: selfieBuffer.byteLength,
    })

    const { error: selfieUploadError } = await supabase.storage.from(TRY_ON_BUCKET).upload(selfiePath, selfieBuffer, {
      contentType: selfieMime,
      cacheControl: '86400',
      upsert: false,
      metadata: {
        deleteAfterISO: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      },
    })

    if (selfieUploadError) {
      console.error('[tryOnAction] Failed to upload selfie', selfieUploadError)
      return { ok: false, message: 'تعذّر رفع الصورة، يرجى المحاولة مرة أخرى' }
    }

    console.info('[tryOnAction] Selfie upload complete', { requestId, selfiePath })

    const frameResponse = await fetch(frameUrl)
    if (!frameResponse.ok) {
      console.error('[tryOnAction] Failed to fetch frame image', frameResponse.status, frameResponse.statusText)
      return { ok: false, message: 'تعذّر تحميل صورة النظارة المختارة' }
    }

    console.info('[tryOnAction] Frame image fetched', {
      requestId,
      frameUrl,
      frameStatus: frameResponse.status,
    })

    const frameArrayBuffer = await frameResponse.arrayBuffer()
    const frameMime = frameResponse.headers.get('content-type') || 'image/png'
    const frameBase64 = Buffer.from(frameArrayBuffer).toString('base64')

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })

    const promptParts = [PROMPT_BASE]
    if (typeof frameLabel === 'string' && frameLabel.trim().length > 0) {
      promptParts.push(`The eyeglasses are ${frameLabel.trim()}. Render them accurately.`)
    }

    const prompt = promptParts.join('\n\n')

    const generation = await model.generateContent([
      {
        inlineData: {
          data: selfieBuffer.toString('base64'),
          mimeType: selfieMime,
        },
      },
      {
        inlineData: {
          data: frameBase64,
          mimeType: frameMime,
        },
      },
      { text: prompt },
    ])

    console.info('[tryOnAction] Gemini response received', {
      requestId,
      candidateCount: generation.response.candidates?.length ?? 0,
    })

    const candidate = generation.response.candidates?.[0]
    const imagePart = candidate?.content?.parts?.find((part) => 'inlineData' in part && part.inlineData?.data)

    if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData?.data) {
      console.error('[tryOnAction] Gemini response missing image data', generation.response)
      return { ok: false, message: 'لم نستطع إنشاء الصورة، يرجى المحاولة مرة أخرى' }
    }

    const outputBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const resultPath = `results/${randomUUID()}.jpg`

    const { error: resultUploadError } = await supabase.storage.from(TRY_ON_BUCKET).upload(resultPath, outputBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '604800',
      upsert: false,
      metadata: {
        deleteAfterISO: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      },
    })

    if (resultUploadError) {
      console.error('[tryOnAction] Failed to upload generated result', resultUploadError)
      return { ok: false, message: 'تم إنشاء الصورة لكن تعذّر حفظها، يرجى المحاولة لاحقاً' }
    }

    console.info('[tryOnAction] Result upload complete', { requestId, resultPath })

    const { data: publicUrlData } = supabase.storage.from(TRY_ON_BUCKET).getPublicUrl(resultPath)
    console.info('[tryOnAction] Success', {
      requestId,
      resultPath,
      selfiePath,
      publicUrl: publicUrlData.publicUrl,
    })

    return {
      ok: true,
      outputUrl: publicUrlData.publicUrl,
      selfiePath,
      resultPath,
    }
  } catch (error) {
    console.error('[tryOnAction] Unexpected failure', error)
    if (typeof error === 'object' && error !== null) {
      const status = 'status' in error ? (error as { status?: number }).status : undefined
      const statusText = 'statusText' in error ? (error as { statusText?: string }).statusText : undefined
      if (status === 429 || statusText === 'Too Many Requests') {
        return {
          ok: false,
          message: 'خدمة Gemini بلغت الحد المسموح به حالياً. يرجى الانتظار قليلاً ثم المحاولة من جديد.',
        }
      }
      if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
        const errorMessage = (error as { message: string }).message
        if (errorMessage.includes('quota') || errorMessage.includes('Quota exceeded')) {
          return {
            ok: false,
            message: 'تم تجاوز حصة Gemini. تحقق من إعدادات الفوترة أو استخدم مفتاحاً بصلاحيات أعلى.',
          }
        }
      }
    }
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return { ok: false, message: `حدث خطأ غير متوقع: ${message}` }
  }
}
