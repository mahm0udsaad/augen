import Link from "next/link"
import { Grid3x3, Layers, Sparkles } from "lucide-react"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { createCategoryShowcase, createSubcategoryShowcase } from "@/lib/category-visuals"
import type { SubcategoryShowcaseCard } from "@/lib/category-visuals"
import { getCategoryVisualOverrides } from "@/lib/category-display-service"
import { PARENT_SUBCATEGORY_MAP } from "@/lib/constants"
import type { LucideIcon } from "lucide-react"

const buildHeroStats = (categoryCount: number, subcategoryCount: number) => [
  {
    label: "Main Categories",
    value: categoryCount.toString(),
    description: "Collections inspired by sun and optics",
    icon: Grid3x3,
  },
  {
    label: "Subcategories",
    value: subcategoryCount.toString(),
    description: "Men's, women's, and children's options",
    icon: Layers,
  },
  {
    label: "Design Details",
    value: "+30",
    description: "Carefully considered materials and colors",
    icon: Sparkles,
  },
]

const heroHighlights = [
  {
    title: "Smart Lenses",
    description: "UV400 protection with anti-reflective layers that reflect city light.",
  },
  {
    title: "Luxury Materials",
    description: "Titanium, carbon fiber, and plant-based acetate provide superior comfort.",
  },
  {
    title: "Personalized Service",
    description: "Virtual consultations to choose the right frame for your face shape.",
  },
]

export const revalidate = 0

export default async function CollectionsPage() {
  const { categoryOverrides, subcategoryOverrides } = await getCategoryVisualOverrides()
  const categoryShowcase = createCategoryShowcase(categoryOverrides)
  const subcategoryShowcase = createSubcategoryShowcase(subcategoryOverrides)
  const heroStats = buildHeroStats(categoryShowcase.length, subcategoryShowcase.length)

  return (
    <div className="min-h-screen bg-black text-white" dir="ltr">
      <Header language="en" />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-zinc-900 to-black p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-200">
                <span className="block h-[1px] w-8 bg-gray-300" />
                Signature Augen Collections
              </p>
              <h1 className="text-4xl leading-tight font-black text-white md:text-6xl">
                Exclusive collections that make you feel like every frame was made for you
              </h1>
              <p className="text-lg text-gray-200 md:text-xl">
                We designed each collection to balance fashion and comfort. Explore our range of sunglasses and prescription glasses that give you a distinctive visual identity, with luxury materials and precise artisanal touches.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map(({ label, value, description, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="rounded-2xl bg-gradient-to-br from-gray-200/10 via-white/5 to-transparent p-5 text-gray-100">
                <p className="text-sm font-semibold text-gray-200">Design Journey</p>
                <p className="mt-2 text-2xl font-bold text-white">From Concept to Frame</p>
                <p className="mt-2 text-sm text-gray-300">
                  Each collection goes through three stages: material selection, lens testing, and finishing details.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-200">
                  {heroHighlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70" />
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 p-5">
                <div>
                  <p className="text-sm text-gray-300">Ready to choose a collection?</p>
                  <p className="text-lg font-semibold text-white">Start with the right category for you</p>
                </div>
                <Link
                  href="/categories"
                  className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-12">
          {categoryShowcase.map((category) => {
            const allowedSubcategories = PARENT_SUBCATEGORY_MAP[category.id] || []
            const subcategoryCards = allowedSubcategories
              .map((subId) => subcategoryShowcase.find((entry) => entry.id === subId))
              .filter((entry): entry is SubcategoryShowcaseCard => Boolean(entry))

            return (
            <article key={category.id} className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <div className="absolute inset-0">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.backgroundImage})` }}
                  />
                </div>
                <div className="absolute inset-0" style={{ background: category.overlayGradient }} />
                <div className={`relative space-y-6 p-8 md:p-12 text-white ${category.texture}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="rounded-full border border-white/30 px-4 py-1 text-sm font-semibold text-white/90">
                      {category.badge}
                    </span>
                    <Link
                      href={`/categories?parent=${category.id}`}
                      className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                    >
                      Discover Category
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/80">{category.tagline}</p>
                    <h2 className="text-3xl font-black md:text-4xl">{category.title}</h2>
                    <p className="text-lg text-white/90">{category.description}</p>
                  </div>
                  <p className="text-base text-white/80">{category.spotlight}</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    {category.features.map((feature) => (
                      <div key={feature.title} className="rounded-2xl border border-white/20 bg-black/30 p-5">
                        <p className="text-sm text-white/70">{feature.title}</p>
                        <p className="text-base text-white">{feature.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {category.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-white/20 bg-black/30 p-4 text-center">
                        <p className="text-3xl font-semibold text-white">{stat.value}</p>
                        <p className="text-sm text-white/70">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {subcategoryCards.map((subcategory) => (
                  <Link
                    key={`${category.id}-${subcategory.id}`}
                    href={`/categories?parent=${category.id}&sub=${subcategory.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10"
                  >
                    <div className="absolute inset-0">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${subcategory.backgroundImage})` }}
                      />
                    </div>
                    <div className="absolute inset-0" style={{ background: subcategory.overlayGradient }} />
                    <div className={`relative flex h-full flex-col gap-3 p-5 text-white ${subcategory.pattern}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {category.title}
                      </p>
                      <h3 className="text-lg font-semibold">{subcategory.title}</h3>
                      <p className="text-sm text-white/80">{subcategory.description}</p>
                      <span className="text-xs font-semibold text-white/70">{subcategory.tagline}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          )})}
        </section>
      </main>
      <Footer language="en" />
    </div>
  )
}
