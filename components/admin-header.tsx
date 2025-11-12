"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, Package, Tags, Layers, ShoppingBag, Truck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminHeader() {
  const { logout } = useAdminAuth()
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
    { href: "/admin/products", label: "المنتجات", icon: Package },
    { href: "/admin/slider", label: "إدارة الشرائح", icon: Layers },
    { href: "/admin/category-displays", label: "عرض التصنيفات", icon: Tags },
    { href: "/admin/shipping", label: "تكاليف الشحن", icon: Truck },
  ]

  return (
    <header className="border-b bg-background sticky top-0 z-40" dir="rtl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin" className="text-2xl font-bold text-primary">
            لوحة التحكم
          </Link>
          <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 bg-transparent">
            <span>تسجيل الخروج</span>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{item.label}</span>
                  <Icon className="w-4 h-4" />
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
