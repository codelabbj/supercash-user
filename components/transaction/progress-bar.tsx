"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  type?: "deposit" | "withdrawal"
  className?: string
}

export function TransactionProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full py-4 sm:py-6", className)}>
      <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i + 1 < currentStep
          const isActive = i + 1 === currentStep
          return (
            <div key={i} className="flex-1 flex items-center group">
              <div
                className={cn(
                  "h-3 sm:h-4 w-full rounded-full transition-all duration-300",
                  isCompleted ? "bg-gold/40" :
                    isActive ? "bg-gold ring-2 ring-gold/20 shadow-sm scale-105" :
                      "bg-muted"
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm font-semibold text-foreground opacity-60">
          Étape {currentStep} <span className="mx-1">/</span> {totalSteps}
        </span>
      </div>
    </div>
  )
}
