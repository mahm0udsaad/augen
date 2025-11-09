import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 md:py-16 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8" dir="rtl">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">أوغن</h3>
            <p className="text-xs md:text-sm text-primary-foreground/80">نظارات فاخرة بتصاميم دقيقة تعكس ذوقك الرفيع.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">تسوق</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="/categories" className="hover:text-primary-foreground transition-colors">
                  جميع الإطارات
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-primary-foreground transition-colors">
                  أحدث الإصدارات
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  عروض مخصصة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">الدعم</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  الشحن والتسليم
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">سياساتنا</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-xs md:text-sm">
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  الخصوصية
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors">
                  سياسة الاستبدال
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80 text-xs md:text-sm">
          <p>&copy; 2025 Augen. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
