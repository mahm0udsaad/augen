export interface ShippingCity {
  id: string
  name_en: string
  name_ar?: string | null
  shipping_fee: number
  sort_order: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}
