import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const normalizeCity = (city: any) => ({
  ...city,
  shipping_fee: Number(city.shipping_fee),
})

const isValidUuid = (value: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await context.params
    const rawId = paramId?.trim()
    
    console.log("PATCH Request - ID:", rawId)
    
    if (!rawId || !isValidUuid(rawId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 })
    }

    const body = await request.json()
    const { nameEn, nameAr, shippingFee, sortOrder, isActive } = body
    
    console.log("PATCH Request - Body:", body)

    // Build update object
    const updateData: Record<string, any> = { 
      updated_at: new Date().toISOString() 
    }

    if (nameEn !== undefined) updateData.name_en = nameEn
    if (nameAr !== undefined) updateData.name_ar = nameAr
    if (shippingFee !== undefined) {
      if (typeof shippingFee !== "number" || Number.isNaN(shippingFee)) {
        return NextResponse.json({ error: "قيمة الشحن غير صالحة" }, { status: 400 })
      }
      updateData.shipping_fee = shippingFee
    }
    if (sortOrder !== undefined) updateData.sort_order = sortOrder
    if (isActive !== undefined) updateData.is_active = isActive

    console.log("Update Data:", updateData)

    // First, verify the record exists
    const { data: existingCity, error: fetchError } = await supabaseAdmin
      .from("shipping_cities")
      .select("*")
      .eq("id", rawId)
      .single()

    if (fetchError || !existingCity) {
      console.error("City not found:", fetchError)
      return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 })
    }

    console.log("Existing city before update:", existingCity)

    // Perform the update
    const { data: updatedCity, error: updateError } = await supabaseAdmin
      .from("shipping_cities")
      .update(updateData)
      .eq("id", rawId)
      .select("*")
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      throw updateError
    }

    console.log("Updated city:", updatedCity)

    if (!updatedCity) {
      return NextResponse.json({ error: "فشل في تحديث المدينة" }, { status: 500 })
    }

    return NextResponse.json({ 
      city: normalizeCity(updatedCity),
      success: true 
    })
    
  } catch (error) {
    console.error("Error updating shipping city:", error)
    return NextResponse.json({ 
      error: "فشل في تحديث مدينة الشحن",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await context.params
    const rawId = paramId?.trim()

    console.log("DELETE Request - ID:", rawId)

    if (!rawId || !isValidUuid(rawId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("shipping_cities")
      .delete()
      .eq("id", rawId)
      .select("id")

    if (error) {
      console.error("Delete error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 })
    }

    console.log("Deleted city ID:", data[0].id)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Error deleting shipping city:", error)
    return NextResponse.json({ 
      error: "فشل في حذف مدينة الشحن",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}