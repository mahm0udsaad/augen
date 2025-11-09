import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
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

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading video:', error)
      return NextResponse.json({ error: 'فشل في رفع الفيديو' }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('products').getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error in upload video API:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء رفع الفيديو' }, { status: 500 })
  }
}

