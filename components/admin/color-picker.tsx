"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  { name: "أزرق", value: "#3b82f6" },
  { name: "أحمر", value: "#ef4444" },
  { name: "أخضر", value: "#10b981" },
  { name: "أصفر", value: "#f59e0b" },
  { name: "بنفسجي", value: "#8b5cf6" },
  { name: "وردي", value: "#ec4899" },
  { name: "سماوي", value: "#06b6d4" },
  { name: "برتقالي", value: "#f97316" },
  { name: "أخضر فاتح", value: "#10b981" },
  { name: "أزرق غامق", value: "#1e40af" },
  { name: "بنفسجي فاتح", value: "#a78bfa" },
  { name: "أحمر داكن", value: "#dc2626" },
]

export function ColorPicker({ value, onChange, label = "اللون" }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-right block">{label}</Label>
      <div className="space-y-3">
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
                value === color.value ? "border-primary ring-2 ring-primary" : "border-gray-300"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onChange(color.value)}
              title={color.name}
            />
          ))}
        </div>
        
        {/* Custom color input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-right"
            placeholder="#3b82f6"
          />
        </div>
      </div>
    </div>
  )
}

