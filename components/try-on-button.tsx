"use client"

import { useState } from "react"
import TryOnModal from "./try-on-modal"

interface TryOnButtonProps {
  productName: string
  productImage: string
}

export default function TryOnButton({ productName, productImage }: TryOnButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-6 py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-colors font-semibold text-base md:text-lg min-h-[44px] md:min-h-[48px] flex items-center justify-center"
      >
        جرّبها بالذكاء الاصطناعي
      </button>

      <TryOnModal
        productName={productName}
        productImage={productImage}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
