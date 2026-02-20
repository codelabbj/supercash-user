"use client"

import { Button } from "@/components/ui/button"
import { Download, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileAppDownloadProps {
  className?: string
  showText?: boolean
  variant?: "header" | "default"
}

export function MobileAppDownload({
  className = "",
  showText = true,
  variant = "default"
}: MobileAppDownloadProps) {
  const downloadUrl = "https://github.com/codelabbj/supercash-mobile-app/raw/refs/heads/main/public/release/SuperCash.apk"

  if (variant === "header") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 px-1 sm:px-1.5 rounded-xl relative hover:bg-slate-100 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-gold/20 flex items-center gap-0.5",
          className
        )}
        asChild
      >
        <a href={downloadUrl} download="SuperCash.apk" title="Télécharger l'app">
          <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-gold transition-colors" />
          <Download className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-gold transition-colors" />
        </a>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "group h-11 px-5 rounded-2xl transition-all hover:bg-primary/10 dark:hover:bg-primary/10",
        "border-2 border-primary/40 dark:border-primary/50 bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white",
        "flex items-center gap-3 font-semibold",
        className
      )}
      asChild
    >
      <a href={downloadUrl} download="SuperCash.apk" className="flex items-center gap-2 w-full justify-center sm:justify-center">
        <Smartphone className="h-5 w-5 text-primary shrink-0" />
        <Download className="h-4 w-4 text-primary shrink-0" />
        {showText && (
          <span className="text-sm tracking-tight">
            Télécharger l&apos;application
          </span>
        )}
      </a>
    </Button>
  )
}
