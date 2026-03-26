"use client"

import { Button } from "@/components/ui/button"

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
    <div className="flex justify-between pt-2 sm:pt-4 gap-3 sm:gap-4 w-full px-1">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex-1 h-12 sm:h-14 text-[15px] sm:text-[16px] font-semibold rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
      >
        {previousLabel}
      </Button>

      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex-1 h-12 sm:h-14 text-[15px] sm:text-[16px] font-semibold rounded-2xl bg-gold hover:bg-gold/90 text-white shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {nextLabel}
      </Button>
    </div>
  )
}
