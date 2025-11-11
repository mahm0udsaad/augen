"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface ContactBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: { name: string; email: string; subject: string; message: string }) => void
}

export default function ContactBottomSheet({ isOpen, onClose, onSubmit }: ContactBottomSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dragDistance = e.clientY - dragStart
    if (dragDistance > 100) {
      onClose()
    }
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sheetRef.current) return
    const dragDistance = e.clientY - dragStart
    if (dragDistance > 0) {
      sheetRef.current.style.transform = `translateY(${dragDistance}px)`
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Handle Bar */}
        <div className="sticky top-0 bg-background rounded-t-2xl px-4 py-3 flex justify-center border-b border-border">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-6" dir="ltr">
          <div className="mb-6 text-left">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Send Us a Message</h2>
            <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="bs-name" className="block text-xs font-semibold text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="bs-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-sm"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="bs-email" className="block text-xs font-semibold text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="bs-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-sm"
                placeholder="example@domain.com"
              />
            </div>

            <div>
              <label htmlFor="bs-subject" className="block text-xs font-semibold text-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                id="bs-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth text-sm"
                placeholder="How can we help you?"
              />
            </div>

            <div>
              <label htmlFor="bs-message" className="block text-xs font-semibold text-foreground mb-2">
                Your Message
              </label>
              <textarea
                id="bs-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none text-sm"
                placeholder="Share the details..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-secondary/50 active:bg-secondary transition-smooth font-semibold text-sm min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-smooth font-semibold text-sm min-h-[44px]"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
