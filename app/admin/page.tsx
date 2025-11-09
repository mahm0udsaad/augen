"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Tags, 
  Layers, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Loader2,
  ArrowRight,
  BarChart3
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AnalyticsData {
  totalProducts: number
  totalCategories: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  categoryBreakdown: { category: string; count: number }[]
}

export default function AdminDashboardPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthed) {
      loadAnalytics()
    }
  }, [isAuthed])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) throw new Error('فشل في تحميل التحليلات')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل التحليلات:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل التحليلات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthed) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-right">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2 text-right">إدارة المنتجات والتصنيفات</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-right">إجمالي المنتجات</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-right">{analytics?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  المنتجات المتوفرة في المتجر
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-right">التصنيفات</CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-right">{analytics?.totalCategories || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  التصنيفات الرئيسية
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-right">متوسط السعر</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-right">
                  {analytics?.avgPrice ? `${Math.round(analytics.avgPrice)} ج.م` : '0 ج.م'}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  متوسط سعر المنتج
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-right">نطاق الأسعار</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-right">
                  {analytics?.minPrice && analytics?.maxPrice 
                    ? `${Math.round(analytics.minPrice)}-${Math.round(analytics.maxPrice)}`
                    : '0-0'
                  } ج.م
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  من الأقل إلى الأعلى
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <BarChart3 className="h-5 w-5" />
                  توزيع المنتجات حسب التصنيف
                </CardTitle>
                <CardDescription className="text-right">
                  عدد المنتجات في كل تصنيف
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-right w-full">{item.category}</span>
                          <span className="text-sm text-muted-foreground mr-4">{item.count} منتج</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ 
                              width: `${(item.count / (analytics.totalProducts || 1)) * 100}%`,
                              marginRight: 'auto',
                              marginLeft: '0'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Management Actions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-right">الإدارة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Orders Management */}
              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/admin/orders')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <ShoppingBag className="h-6 w-6 text-orange-500" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" style={{ transform: 'scaleX(-1)' }} />
                  </div>
                  <CardTitle className="text-right mt-4">إدارة الطلبات</CardTitle>
                  <CardDescription className="text-right">
                    عرض وإدارة طلبات العملاء
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => router.push('/admin/orders')}>
                    فتح إدارة الطلبات
                  </Button>
                </CardContent>
              </Card>
              
              {/* Products Management */}
              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/admin/products')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" style={{ transform: 'scaleX(-1)' }} />
                  </div>
                  <CardTitle className="text-right mt-4">إدارة المنتجات</CardTitle>
                  <CardDescription className="text-right">
                    إضافة وتعديل وحذف المنتجات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push('/admin/products')}>
                    فتح إدارة المنتجات
                  </Button>
                </CardContent>
              </Card>

              {/* Categories Management */}
              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/admin/categories')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Tags className="h-6 w-6 text-blue-500" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" style={{ transform: 'scaleX(-1)' }} />
                  </div>
                  <CardTitle className="text-right mt-4">إدارة التصنيفات</CardTitle>
                  <CardDescription className="text-right">
                    إدارة التصنيفات الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/categories')}>
                    فتح إدارة التصنيفات
                  </Button>
                </CardContent>
              </Card>

              {/* Subcategories Management */}
              <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/admin/subcategories')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <Layers className="h-6 w-6 text-green-500" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" style={{ transform: 'scaleX(-1)' }} />
                  </div>
                  <CardTitle className="text-right mt-4">إدارة التصنيفات الفرعية</CardTitle>
                  <CardDescription className="text-right">
                    إدارة التصنيفات الفرعية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/admin/subcategories')}>
                    فتح إدارة التصنيفات الفرعية
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
