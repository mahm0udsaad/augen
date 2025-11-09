"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { tryOnAction } from "@/app/actions/try-on"

interface TryOnModalProps {
  productName: string
  productImage: string
  onClose: () => void
  open: boolean
}

export default function TryOnModal({ productName, productImage, onClose, open }: TryOnModalProps) {
  const [step, setStep] = useState<"camera" | "preview" | "result">("camera")
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (step === "camera" && open) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [step, open])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("تعذّر الوصول إلى الكاميرا. يرجى التحقق من الأذونات والمحاولة مجددًا.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.95)
        setSelfieImage(imageData)
        setStep("preview")
      }
    }
  }

  const generateTryOn = async () => {
    if (!selfieImage) return

    setLoading(true)
    setError(null)

    try {
      const selfieFile = dataUrlToFile(selfieImage, "selfie.jpg")
      const formData = new FormData()
      formData.append("selfie", selfieFile)
      formData.append("frameUrl", productImage)
      formData.append("frameLabel", productName)

      const response = await tryOnAction(formData)

      if (!response.ok) {
        setError(response.message || "فشل إنشاء التجربة. حاول مرة أخرى.")
        return
      }

      setResultImage(response.outputUrl)
      setStep("result")
    } catch (error) {
      console.error("Error generating try-on:", error)
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف"
      setError(`فشل إنشاء تجربة القياس: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const retakeSelfie = () => {
    setSelfieImage(null)
    setResultImage(null)
    setError(null)
    setStep("camera")
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-background border-b border-border px-4 md:px-6 py-4">
          <SheetTitle className="text-lg md:text-2xl font-serif font-bold text-foreground text-right">
            جرّب {productName}
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 md:p-6 space-y-4" dir="rtl">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm md:text-base text-right">
              {error}
            </div>
          )}

          {step === "camera" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm md:text-base text-right">
                  ضع وجهك في المنتصف والتقط صورة شخصية
                </p>
                <p className="text-xs text-muted-foreground text-right">
                  برفع الصورة فإنك توافق على معالجتها مؤقتاً لغرض المعاينة فقط، وسيتم حذفها تلقائياً خلال ٧٢ ساعة.
                </p>
              </div>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ WebkitTransform: "scaleX(-1)", transform: "scaleX(-1)" }}
                />
              </div>
              <button
                onClick={takeSelfie}
                className="w-full px-6 py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-colors font-semibold text-base md:text-lg min-h-[44px]"
              >
                التقط صورة
              </button>
            </div>
          )}

          {step === "preview" && selfieImage && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm md:text-base text-right">راجع صورتك</p>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video w-full">
                <Image src={selfieImage || "/placeholder.svg"} alt="صورتك الشخصية" fill className="object-cover" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retakeSelfie}
                  className="flex-1 px-6 py-3 md:py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors font-semibold text-base min-h-[44px]"
                >
                  إعادة التقاط
                </button>
                <button
                  onClick={generateTryOn}
                  disabled={loading}
                  className="flex-1 px-6 py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-base min-h-[44px]"
                >
                  {loading ? "جاري المعالجة..." : "جرّب النظارة"}
                </button>
              </div>
            </div>
          )}

          {step === "result" && resultImage && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm md:text-base text-right">هكذا تبدو مع {productName}</p>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video w-full">
                <Image src={resultImage || "/placeholder.svg"} alt="نتيجة التجربة" fill className="object-cover" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retakeSelfie}
                  className="flex-1 px-6 py-3 md:py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors font-semibold text-base min-h-[44px]"
                >
                  جرّب مرة أخرى
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 md:py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-semibold text-base min-h-[44px]"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      <canvas ref={canvasRef} className="hidden" />
    </Sheet>
  )
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",")
  if (!header || !data) {
    throw new Error("Invalid selfie data URL")
  }
  const mimeMatch = header?.match(/data:(.*?);base64/)
  const mimeType = mimeMatch?.[1] || "image/jpeg"
  const binary = atob(data)
  const array = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }

  return new File([array], filename, { type: mimeType })
}
