import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const bucketName = 'product-videos'

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'لم يتم تحميل أي ملف' }, { status: 400 })
    }

    // Check file size (limit to 50MB for videos)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الفيديو كبير جداً. الحد الأقصى هو 50 ميجابايت' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'يجب أن يكون الملف فيديو' }, { status: 400 })
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `product-videos/${fileName}`

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Helper to attempt upload to Supabase storage (videos bucket)
    const attemptUpload = async () =>
      await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    // First upload attempt
    let { data, error } = await attemptUpload()

    // If bucket not found, create it and retry once
    const isBucketNotFound =
      !!error &&
      (error.message?.toLowerCase().includes('bucket not found') ||
        (error as any).statusCode === '404' ||
        (error as any).status === 404 ||
        ((error as any).status === 400 && (error as any).statusCode === '404'))

    if (isBucketNotFound) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['video/*'],
        fileSizeLimit: '50MB',
      })
      // Ignore conflict if already exists
      const isAlreadyExists =
        !!createError &&
        (createError.message?.toLowerCase().includes('exists') ||
          (createError as any).statusCode === '409' ||
          (createError as any).status === 409)
      if (createError && !isAlreadyExists) {
        console.error('Failed to create videos bucket:', createError)
        return NextResponse.json({ error: 'تعذر إنشاء سعة تخزين للفيديوهات', details: createError.message }, { status: 500 })
      }
      // Retry upload once
      const retry = await attemptUpload()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Error uploading video:', error)
      return NextResponse.json({ error: 'فشل في رفع الفيديو', details: error.message, statusCode: (error as any).statusCode ?? (error as any).status }, { status: 500 })
    }

    // Get public URL
    if (!data?.path) {
      return NextResponse.json({ error: 'فشل في إنشاء مسار الملف بعد الرفع' }, { status: 500 })
    }
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path)
    const publicUrl = urlData.publicUrl

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error in upload video API:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء رفع الفيديو' }, { status: 500 })
  }
}

