"use client"

import * as React from "react"
import { UploadCloud, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface UploadFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  uploading?: boolean
  buttonText?: string
  placeholder?: string
  icon?: React.ReactNode
  status?: React.ReactNode
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFileSelect?: (file: File | null, event: React.ChangeEvent<HTMLInputElement>) => void
  onFilesSelect?: (files: File[], event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export function UploadField({
  label,
  helperText,
  uploading = false,
  buttonText = "رفع ملف",
  placeholder = "لم يتم اختيار ملف بعد",
  icon,
  status,
  disabled,
  accept,
  id,
  onChange,
  onFileSelect,
  onFilesSelect,
  className,
  ...rest
}: UploadFieldProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = React.useState<string | undefined>(undefined)

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files
    const isMultiple = event.target.multiple === true

    if (filesList && (isMultiple || filesList.length > 1)) {
      const files = Array.from(filesList)
      // For multiple selection, prefer the plural callback if provided; otherwise call single callback for each
      if (onFilesSelect) {
        onFilesSelect(files, event)
      } else if (onFileSelect) {
        for (const f of files) {
          onFileSelect(f, event)
        }
      }
      // Optionally show first file name; helper/status can show counts elsewhere
      setFileName(files[0]?.name)
    } else {
      const file = filesList?.[0] ?? null
      setFileName(file?.name)
      onFileSelect?.(file, event)
    }
    onChange?.(event)

    // reset value so the same file can be re-selected
    event.target.value = ""
  }

  const renderIcon = () => {
    if (uploading) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }

    if (icon) {
      return icon
    }

    return <UploadCloud className="w-4 h-4" />
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled || uploading}
        onChange={handleSelect}
        {...rest}
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {renderIcon()}
          <span>{buttonText}</span>
        </Button>
        <div className="text-sm text-muted-foreground truncate">
          {status ?? fileName ?? placeholder}
        </div>
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
