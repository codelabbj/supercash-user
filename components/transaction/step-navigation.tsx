"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isNextDisabled?: boolean
  nextLabel?: string
  previousLabel?: string
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  nextLabel = "Suivant",
  previousLabel = "Précédent"
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-2 sm:pt-4 gap-2 sm:gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm font-semibold flex-1 sm:flex-initial min-w-0 rounded-xl border-border/80 hover:bg-muted/80"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        <span className="hidden xs:inline">{previousLabel}</span>
        <span className="xs:hidden">Préc.</span>
      </Button>

      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm font-semibold flex-1 sm:flex-initial min-w-0 rounded-xl bg-gold hover:bg-gold/90 text-white shadow-sm"
      >
        <span className="hidden xs:inline">{nextLabel}</span>
        <span className="xs:hidden">Suiv.</span>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </Button>
    </div>
  )
}
