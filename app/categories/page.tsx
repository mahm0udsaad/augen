import { Suspense } from "react"

import CategoriesPageClient from "./categories-client"
import { getCategoryVisualOverrides } from "@/lib/category-display-service"

export const revalidate = 0

export default async function CategoriesPage() {
  const { categoryOverrides, subcategoryOverrides } = await getCategoryVisualOverrides()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-muted-foreground" />
        </div>
      }
    >
      <CategoriesPageClient
        categoryOverrides={categoryOverrides}
        subcategoryOverrides={subcategoryOverrides}
      />
    </Suspense>
  )
}
