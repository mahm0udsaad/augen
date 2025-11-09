import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json()
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'لم يتم تحديد اسم الملف' },
        { status: 400 }
      )
    }

    // Delete from Supabase Storage using admin client (bypasses RLS)
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove([fileName])

    if (error) {
      console.error('Error deleting from Supabase:', error)
      return NextResponse.json(
        { error: 'تعذر حذف الصورة', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in delete handler:', error)
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    )
  }
}
