export type SocialPlatform = "facebook" | "instagram" | "whatsapp"

interface SocialLink {
  id: SocialPlatform
  href: string
  label: {
    en: string
    ar: string
  }
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "facebook",
    href: "https://www.facebook.com/share/1BhyF7vKBm/?mibextid=wwXIfr",
    label: {
      en: "Facebook",
      ar: "فيسبوك",
    },
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/augenstore?igsh=MW1icTBrY2Z1cjY1Ng==",
    label: {
      en: "Instagram",
      ar: "إنستغرام",
    },
  },
  {
    id: "whatsapp",
    href: "https://wa.me/201035212724?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D8%AF%20%D8%B9%D9%86%20%D8%AA%D8%B4%D9%83%D9%8A%D9%84%D8%A9%20%D8%A3%D9%88%D8%BA%D9%86%20%D9%85%D9%86%20%D8%A7%D9%84%D9%86%D8%B8%D8%A7%D8%B1%D8%A7%D8%AA",
    label: {
      en: "WhatsApp",
      ar: "واتساب",
    },
  },
]
