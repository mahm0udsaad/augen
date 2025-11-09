"use client"

export function useHapticFeedback() {
  const light = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10)
    }
  }

  const medium = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(20)
    }
  }

  const heavy = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(40)
    }
  }

  const pattern = (pattern: number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return { light, medium, heavy, pattern }
}
