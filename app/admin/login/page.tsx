"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate auth delay
    setTimeout(() => {
      if (password === "1234") {
        // Store auth token in localStorage
        localStorage.setItem("adminAuth", "true")
        localStorage.setItem("adminLoginTime", new Date().getTime().toString())
        router.push("/admin/products")
      } else {
        setError("كلمة المرور غير صحيحة")
        setIsLoading(false)
      }
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Lock className="w-6 h-6 text-background" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">لوحة تحكم الإدارة</CardTitle>
          <CardDescription className="text-center">أدخل كلمة المرور للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة مرور الإدارة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="text-base"
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">{error}</div>
            )}
            <Button type="submit" disabled={isLoading || !password} className="w-full" size="lg">
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
