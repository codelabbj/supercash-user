"use client"

import { Button } from "@/components/ui/button"
import { Download, Smartphone } from "lucide-react"

interface MobileAppDownloadProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function MobileAppDownload({
  variant = "default",
  size = "default",
  className = "",
  showText = true
}: MobileAppDownloadProps) {
  // Temporairement désactivé en attendant l'URL SuperCash
  return (
    <Button
      variant="outline"
      size={size}
      disabled
      className={`gap-2 h-10 sm:h-11 opacity-50 cursor-not-allowed ${className}`}
    >
      <Smartphone className="h-4 w-4" />
      {showText && (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Bientôt disponible</span>
          <span className="sm:hidden">Bientôt</span>
        </>
      )}
    </Button>
  )
}
