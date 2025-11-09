"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ContactBottomSheet from "@/components/contact-bottom-sheet"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  const handleBottomSheetSubmit = (data: typeof formData) => {
    setFormData(data)
    setSubmitted(true)
    setIsBottomSheetOpen(false)
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Header />

      <section className="px-4 py-8 sm:py-12 md:py-16 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="animate-slide-up flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 md:mb-4">
                تواصل معنا
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                لديك أسئلة حول نظاراتنا؟ يسعدنا أن نساعدك في اختيار الإطار المناسب وشرح خدمة التجربة الافتراضية متى شئت.
              </p>
            </div>
            <button
              onClick={() => setIsBottomSheetOpen(true)}
              className="md:hidden flex-shrink-0 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-smooth font-semibold text-sm min-h-[44px] whitespace-nowrap"
            >
              رسالة سريعة
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:py-12 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="lg:col-span-2 animate-slide-up hidden md:block">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-base"
                      placeholder="اكتب اسمك هنا"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-base"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-base"
                    placeholder="كيف يمكننا مساعدتك؟"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    رسالتك
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none text-base"
                    placeholder="شاركنا تفاصيل استفسارك..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-smooth font-semibold text-base md:text-lg min-h-[48px] hover:scale-105 active:scale-95"
                >
                  إرسال الرسالة
                </button>

                {submitted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-scale-in">
                    <p className="text-green-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="space-y-4 sm:space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="bg-secondary/50 rounded-lg p-6 sm:p-8 border border-border hover:shadow-md transition-smooth">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">العنوان</h3>
                    <p className="text-sm text-muted-foreground">
                      ٤٤ خاتم المرسلين
                      <br />
                      الجيزة – مصر
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-6 sm:p-8 border border-border hover:shadow-md transition-smooth">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ساعات العمل</h3>
                    <p className="text-sm text-muted-foreground">
                      الإثنين – الجمعة: 10:00 ص - 7:00 م
                      <br />
                      السبت: 11:00 ص - 6:00 م
                      <br />
                      الأحد: مغلق
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-6 sm:p-8 border border-border hover:shadow-md transition-smooth">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.02-1.756 2.117-2.259 3.355-.603 1.692-.757 3.545-.757 5.471 0 .981.119 1.558.141 1.561l.003.002c.142 2.476.645 3.582 1.324 4.104.779.584 2.065.89 3.255.89.529 0 1.01-.044 1.27-.063 4.649-.469 8.386-3.285 10.172-7.213 1.786-3.922 1.786-8.342 0-12.264-1.786-3.928-5.523-6.744-10.172-7.213-.26-.019-.741-.063-1.27-.063z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">واتساب</h3>
                    <a
                      href="https://wa.me/201035212724?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D8%AF%20%D8%B9%D9%86%20%D8%AA%D8%B4%D9%83%D9%8A%D9%84%D8%A9%20%D8%A3%D9%88%D8%BA%D9%86%20%D9%85%D9%86%20%D8%A7%D9%84%D9%86%D8%B8%D8%A7%D8%B1%D8%A7%D8%AA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-smooth font-semibold text-sm min-h-[44px]"
                    >
                      راسلنا الآن
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-12 md:pt-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 md:mb-12 text-center animate-slide-up">
              زر صالة العرض الخاصة بنا
            </h2>
            <div className="rounded-lg overflow-hidden shadow-lg h-80 sm:h-96 md:h-[500px] animate-scale-in">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3455.225910511594!2d31.191454075552013!3d30.001668974945098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzDCsDAwJzA2LjAiTiAzMcKwMTEnMzguNSJF!5e0!3m2!1sen!2seg!4v1762687299497!5m2!1sen!2seg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <ContactBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSubmit={handleBottomSheetSubmit}
      />

      <Footer />
    </main>
  )
}
