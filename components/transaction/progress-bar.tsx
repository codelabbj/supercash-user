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
    <div className={cn("w-full py-3 sm:py-5", className)}>
      <div className="flex items-center justify-between gap-1 sm:gap-2 max-w-sm mx-auto">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i + 1 < currentStep
          const isActive = i + 1 === currentStep
          return (
            <div key={i} className="flex-1 flex items-center min-w-0">
              <div
                className={cn(
                  "h-2 sm:h-2.5 w-full rounded-full transition-all duration-300",
                  isCompleted ? "bg-gold" :
                    isActive ? "bg-gold ring-2 ring-gold/30 ring-offset-2 ring-offset-background shadow-sm" :
                      "bg-muted/80"
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2.5 sm:mt-3 text-center">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Étape {currentStep} sur {totalSteps}
        </span>
      </div>
    </div>
  )
}
