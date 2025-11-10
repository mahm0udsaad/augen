import { PARENT_CATEGORIES, SUBCATEGORIES } from "./constants"
import type { ParentCategory, Subcategory } from "./constants"

export interface CategoryShowcaseCard {
  id: ParentCategory
  title: string
  description: string
  tagline: string
  spotlight: string
  badge: string
  accent: string
  backgroundImage: string
  overlayGradient: string
  texture: string
  stats: { label: string; value: string }[]
  features: { title: string; detail: string }[]
}

export interface CategoryVisualOverride {
  title?: string | null
  description?: string | null
  backgroundImage?: string | null
  mobileBackgroundImage?: string | null
}

export interface SubcategoryShowcaseCard {
  id: Subcategory
  title: string
  description: string
  tagline: string
  accent: string
  backgroundImage: string
  overlayGradient: string
  pattern: string
}

export interface SubcategoryVisualOverride {
  backgroundImage?: string | null
  mobileBackgroundImage?: string | null
}

const categoryVisualConfig: Record<ParentCategory, Omit<CategoryShowcaseCard, "id" | "title" | "description" >> = {
  sunglasses: {
    badge: "حماية كاملة من الشمس",
    tagline: "توازن فخم بين الضوء والظل",
    spotlight: "عدسات مستقطبة تحجب الوهج وتبرز التفاصيل بدقة عالية.",
    accent: "#f5f5f5",
    backgroundImage: "/images/hero-glasses.jpg",
    overlayGradient: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(15,15,15,0.65))",
    texture: "bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.2)_100%)]",
    stats: [
      { label: "تصاميم حصرية", value: "24" },
      { label: "خيارات عدسات", value: "15" },
      { label: "تقييم العملاء", value: "4.9/5" },
    ],
    features: [
      { title: "عدسات مستقطبة", detail: "تقنية PolarMax تقلل الانعكاسات في القيادة والشواطئ." },
      { title: "مواد خفيفة", detail: "إطارات من التيتانيوم والألياف الكربونية تمنح راحة يومية." },
      { title: "تشطيبات نهائية", detail: "طلاءات مقاومة للخدوش بلون أسود غير لامع." },
    ],
  },
  optical_glasses: {
    badge: "دقة طبية استثنائية",
    tagline: "وضوح مطلق لكل لحظة",
    spotlight: "عدسات رقمية مضادة للانعكاس تمنحك تركيزاً مريحاً طوال اليوم.",
    accent: "#e5e5e5",
    backgroundImage: "/images/hero.png",
    overlayGradient: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(40,40,40,0.7))",
    texture: "bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_55%)]",
    stats: [
      { label: "وصفات منفذة", value: "1200+" },
      { label: "تقنيات عدسات", value: "6" },
      { label: "ضمان الجودة", value: "24 شهر" },
    ],
    features: [
      { title: "عدسات رقمية", detail: "تصحيح بصري دقيق مع حماية من الضوء الأزرق." },
      { title: "قياسات مخصصة", detail: "ملاءمة مثالية بفضل الضبط الميكروي للأذرع." },
      { title: "أناقة يومية", detail: "ألوان حيادية وتفاصيل معدنية تعكس الهدوء." },
    ],
  },
}

const subcategoryVisualConfig: Record<Subcategory, Omit<SubcategoryShowcaseCard, "id" | "title" | "description" >> = {
  man: {
    tagline: "حدود دقيقة وخطوط قوية",
    accent: "#d4d4d4",
    backgroundImage: "/images/hero-glasses.jpg",
    overlayGradient: "linear-gradient(160deg, rgba(0,0,0,0.85), rgba(30,30,30,0.7))",
    pattern: "bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_55%)]",
  },
  woman: {
    tagline: "لمسات أنيقة بنبرة هادئة",
    accent: "#e5e5e5",
    backgroundImage: "/images/hero.png",
    overlayGradient: "linear-gradient(150deg, rgba(0,0,0,0.8), rgba(60,60,60,0.6))",
    pattern: "bg-[radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.18),transparent_60%)]",
  },
  child: {
    tagline: "خفيفة، آمنة، وعملية",
    accent: "#f0f0f0",
    backgroundImage: "/images/hero-glasses.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(0,0,0,0.78), rgba(45,45,45,0.6))",
    pattern: "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_55%)]",
  },
}

export function createCategoryShowcase(
  overrides: Partial<Record<ParentCategory, CategoryVisualOverride>> = {}
): CategoryShowcaseCard[] {
  return (Object.entries(PARENT_CATEGORIES) as [ParentCategory, typeof PARENT_CATEGORIES[ParentCategory]][]).map(
    ([id, category]) => {
      const override = overrides[id]
      const baseConfig = categoryVisualConfig[id]

      return {
        id,
        title: override?.title || category.name_ar,
        description: override?.description || category.description_ar,
        badge: baseConfig.badge,
        tagline: baseConfig.tagline,
        spotlight: baseConfig.spotlight,
        accent: baseConfig.accent,
        backgroundImage: override?.backgroundImage || baseConfig.backgroundImage,
        overlayGradient: baseConfig.overlayGradient,
        texture: baseConfig.texture,
        stats: baseConfig.stats,
        features: baseConfig.features,
      }
    },
  )
}

export function createSubcategoryShowcase(
  overrides: Partial<Record<Subcategory, SubcategoryVisualOverride>> = {}
): SubcategoryShowcaseCard[] {
  return (Object.entries(SUBCATEGORIES) as [Subcategory, typeof SUBCATEGORIES[Subcategory]][]).map(
    ([id, category]) => {
      const override = overrides[id]
      const baseConfig = subcategoryVisualConfig[id]

      return {
        id,
        title: category.name_ar,
        description: category.description_ar,
        tagline: baseConfig.tagline,
        accent: baseConfig.accent,
        backgroundImage: override?.backgroundImage || baseConfig.backgroundImage,
        overlayGradient: baseConfig.overlayGradient,
        pattern: baseConfig.pattern,
      }
    }
  )
}

export const CATEGORY_SHOWCASE: CategoryShowcaseCard[] = createCategoryShowcase()
export const SUBCATEGORY_SHOWCASE: SubcategoryShowcaseCard[] = createSubcategoryShowcase()
