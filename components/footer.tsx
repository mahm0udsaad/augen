import type { ComponentType } from "react"

import Link from "next/link"

import { Facebook, Instagram } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { SOCIAL_LINKS, type SocialPlatform } from "@/lib/social-links"

type Language = "en" | "ar"

interface FooterProps {
  language?: Language
}

export default function Footer({ language = "ar" }: FooterProps = {}) {
  const isEnglish = language === "en"

  const copy = {
    brandTitle: isEnglish ? "Augen" : "أوغن",
    brandDescription: isEnglish
      ? "Luxury eyewear crafted with precision for the modern aesthetic."
      : "نظارات فاخرة بتصاميم دقيقة تعكس ذوقك الرفيع.",
    shop: isEnglish ? "Shop" : "تسوق",
    support: isEnglish ? "Support" : "الدعم",
    policies: isEnglish ? "Policies" : "سياساتنا",
    allFrames: isEnglish ? "All Frames" : "جميع الإطارات",
    newArrivals: isEnglish ? "New Arrivals" : "أحدث الإصدارات",
    bespoke: isEnglish ? "Bespoke Services" : "عروض مخصصة",
    contact: isEnglish ? "Contact" : "تواصل معنا",
    faq: isEnglish ? "FAQ" : "الأسئلة الشائعة",
    shipping: isEnglish ? "Shipping & Delivery" : "الشحن والتسليم",
    privacy: isEnglish ? "Privacy" : "الخصوصية",
    terms: isEnglish ? "Terms & Conditions" : "الشروط والأحكام",
    returns: isEnglish ? "Return Policy" : "سياسة الاستبدال",
    rights: isEnglish ? "All rights reserved." : "جميع الحقوق محفوظة.",
    stayConnected: isEnglish ? "Stay connected" : "تابعنا",
  }

  const socialIconMap: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
    facebook: Facebook,
    instagram: Instagram,
    whatsapp: WhatsAppIcon,
  }


  return (
    <footer className="bg-primary text-primary-foreground py-12 md:py-16 px-4" dir={isEnglish ? "ltr" : "rtl"}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8" dir={isEnglish ? "ltr" : "rtl"}>
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">{copy.brandTitle}</h3>
            <p className="text-xs md:text-sm text-primary-foreground/80">{copy.brandDescription}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">{copy.shop}</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="/categories" className="hover:text-primary-foreground transition-colors">
                  {copy.allFrames}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-primary-foreground transition-colors">
                  {copy.newArrivals}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  {copy.bespoke}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">{copy.support}</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  {copy.contact}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  {copy.faq}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  {copy.shipping}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">{copy.policies}</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  {copy.privacy}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  {copy.terms}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  {copy.returns}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-primary-foreground/80 text-xs md:text-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" dir={isEnglish ? "ltr" : "rtl"}>
            <p className="text-center md:text-start">&copy; 2025 Augen. {copy.rights}</p>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
              <span className="font-semibold text-primary-foreground">{copy.stayConnected}</span>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = socialIconMap[link.id]
                  const label = isEnglish ? link.label.en : link.label.ar
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
                    >
                      <span className="sr-only">{label}</span>
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
