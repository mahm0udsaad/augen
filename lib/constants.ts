// Hardcoded category structure for the eyewear store
// These replace the dynamic category/subcategory system

export const PARENT_CATEGORIES = {
  sunglasses: {
    id: 'sunglasses',
    name_ar: 'نظارات شمسية',
    name_en: 'Sunglasses',
    description_ar: 'أفضل التصاميم وأفضل جودة',
    description_en: 'Best designs and best quality',
  },
  optical_glasses: {
    id: 'optical_glasses',
    name_ar: 'نظارات طبية',
    name_en: 'Optical Glasses',
    description_ar: 'أفضل التصاميم وأفضل جودة',
    description_en: 'Best designs and best quality',
  },
} as const;

export const SUBCATEGORIES = {
  man: {
    id: 'man',
    name_ar: 'رجالي',
    name_en: 'Men',
    description_ar: 'ارتدِ النظارات التي تعزز شخصيتك',
    description_en: 'Wear the glasses that enhance your personality',
  },
  woman: {
    id: 'woman',
    name_ar: 'نسائي',
    name_en: 'Women',
    description_ar: 'لأن عينيك تحتاجهن',
    description_en: 'Because your eyes need them',
  },
  child: {
    id: 'child',
    name_ar: 'أطفال',
    name_en: 'Children',
    description_ar: 'في بعض الأحيان، كل ما تحتاجه هو منظور جديد',
    description_en: 'Sometimes, all you need is a new perspective',
  },
} as const;

// Type exports for TypeScript
export type ParentCategory = keyof typeof PARENT_CATEGORIES;
export type Subcategory = keyof typeof SUBCATEGORIES;

export const PARENT_SUBCATEGORY_MAP: Record<ParentCategory, Subcategory[]> = {
  sunglasses: ["man", "woman"],
  optical_glasses: ["man", "woman", "child"],
}

// Helper functions
export function getParentCategoryName(id: ParentCategory, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? PARENT_CATEGORIES[id].name_ar : PARENT_CATEGORIES[id].name_en;
}

export function getSubcategoryName(id: Subcategory, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? SUBCATEGORIES[id].name_ar : SUBCATEGORIES[id].name_en;
}

export function getParentCategoryDescription(id: ParentCategory, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? PARENT_CATEGORIES[id].description_ar : PARENT_CATEGORIES[id].description_en;
}

export function getSubcategoryDescription(id: Subcategory, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? SUBCATEGORIES[id].description_ar : SUBCATEGORIES[id].description_en;
}
