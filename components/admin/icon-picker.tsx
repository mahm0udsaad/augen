"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Glasses,
  Sun,
  Sparkles,
  Circle,
  Square,
  Eye,
  Star,
  Heart,
  Zap,
  Crown,
  Shield,
  Award,
  Target,
  Layers,
  Package,
  ShoppingBag,
  Tag,
  Gem,
  Shirt,
  Watch,
  Briefcase,
} from "lucide-react"

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  label?: string
}

const AVAILABLE_ICONS = [
  { name: "glasses", Icon: Glasses, label: "نظارات" },
  { name: "sun", Icon: Sun, label: "شمس" },
  { name: "sparkles", Icon: Sparkles, label: "تألق" },
  { name: "circle", Icon: Circle, label: "دائرة" },
  { name: "square", Icon: Square, label: "مربع" },
  { name: "eye", Icon: Eye, label: "عين" },
  { name: "star", Icon: Star, label: "نجمة" },
  { name: "heart", Icon: Heart, label: "قلب" },
  { name: "zap", Icon: Zap, label: "برق" },
  { name: "crown", Icon: Crown, label: "تاج" },
  { name: "shield", Icon: Shield, label: "درع" },
  { name: "award", Icon: Award, label: "جائزة" },
  { name: "target", Icon: Target, label: "هدف" },
  { name: "layers", Icon: Layers, label: "طبقات" },
  { name: "package", Icon: Package, label: "صندوق" },
  { name: "shopping-bag", Icon: ShoppingBag, label: "حقيبة تسوق" },
  { name: "tag", Icon: Tag, label: "علامة" },
  { name: "gem", Icon: Gem, label: "جوهرة" },
  { name: "shirt", Icon: Shirt, label: "قميص" },
  { name: "watch", Icon: Watch, label: "ساعة" },
  { name: "briefcase", Icon: Briefcase, label: "حقيبة" },
]

export function IconPicker({ value, onChange, label = "الأيقونة" }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  
  const selectedIcon = AVAILABLE_ICONS.find(icon => icon.name === value) || AVAILABLE_ICONS[0]
  const SelectedIconComponent = selectedIcon.Icon

  return (
    <div className="space-y-2">
      <Label className="text-right block">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-right"
            type="button"
          >
            <span className="flex items-center gap-2">
              <span>{selectedIcon.label}</span>
              <SelectedIconComponent className="w-4 h-4" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_ICONS.map((icon) => {
              const IconComponent = icon.Icon
              return (
                <Button
                  key={icon.name}
                  variant={value === icon.name ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    onChange(icon.name)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs">{icon.label}</span>
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

