"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useAdminAuth() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("adminAuth")
    if (authToken === "true") {
      setIsAuthed(true)
    } else {
      router.push("/admin/login")
    }
    setIsLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminLoginTime")
    router.push("/admin/login")
  }

  return { isAuthed, isLoading, logout }
}
