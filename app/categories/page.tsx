import { Suspense } from "react"
import CategoriesPageClient from "./categories-client"

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-dashed border-muted-foreground rounded-full animate-spin" />
        </div>
      }
    >
      <CategoriesPageClient />
    </Suspense>
  )
}
