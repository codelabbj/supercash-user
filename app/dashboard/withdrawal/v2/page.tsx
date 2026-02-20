"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"
import { TransactionProgressBar } from "@/components/transaction/progress-bar"
import { StepNavigation } from "@/components/transaction/step-navigation"
import { ConfirmationDialog } from "@/components/transaction/confirmation-dialog"
import { PlatformStep } from "@/components/transaction/steps/platform-step"
import { BetIdStep } from "@/components/transaction/steps/bet-id-step"
import { NetworkStep } from "@/components/transaction/steps/network-step"
import { PhoneStep } from "@/components/transaction/steps/phone-step"
import { AmountStep } from "@/components/transaction/steps/amount-step"
import { PlatformHelpLinks } from "@/components/transaction/platform-help-links"
import { transactionApi } from "@/lib/api-client"
import type { Platform, UserAppId, Network, UserPhone } from "@/lib/types"
import { toast } from "react-hot-toast"
import { normalizePhoneNumber } from "@/lib/utils"

export default function WithdrawalV2Page() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedBetId, setSelectedBetId] = useState<UserAppId | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [selectedPhone, setSelectedPhone] = useState<UserPhone | null>(null)
  const [amount, setAmount] = useState(0)
  const [withdriwalCode, setWithdriwalCode] = useState("")

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsConfirmationOpen(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirmTransaction = async () => {
    if (!selectedPlatform || !selectedBetId || !selectedNetwork || !selectedPhone) {
      toast.error("Données manquantes pour la transaction")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await transactionApi.createWithdrawal({
        amount,
        phone_number: normalizePhoneNumber(selectedPhone.phone),
        app: selectedPlatform.id,
        user_app_id: selectedBetId.user_app_id,
        network: selectedNetwork.id,
        withdriwal_code: withdriwalCode,
        source: "web",
      })

      toast.success("Retrait initié avec succès!")
      setIsConfirmationOpen(false)
      if (response?.id != null) {
        router.push(`/dashboard/transactions?id=${response.id}`)
      } else {
        router.push("/dashboard/v2")
      }
    } catch {
      // Error handled by API interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedPlatform !== null
      case 2:
        return selectedBetId !== null
      case 3:
        return selectedNetwork !== null
      case 4:
        return selectedPhone !== null
      case 5:
        return (
          amount > 0 &&
          selectedPlatform &&
          withdriwalCode.length >= 4 &&
          amount >= selectedPlatform.minimun_with &&
          amount <= selectedPlatform.max_win
        )
      default:
        return false
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PlatformStep
            selectedPlatform={selectedPlatform}
            onSelect={(platform) => {
              setSelectedPlatform(platform)
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="withdrawal"
            listLayout
          />
        )
      case 2:
        return (
          <BetIdStep
            selectedPlatform={selectedPlatform}
            selectedBetId={selectedBetId}
            onSelect={(betId) => {
              setSelectedBetId(betId)
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="withdrawal"
            listLayout
          />
        )
      case 3:
        return (
          <NetworkStep
            selectedNetwork={selectedNetwork}
            onSelect={(network) => {
              setSelectedNetwork(network)
              setTimeout(handleNext, 300)
            }}
            type="withdrawal"
            listLayout
          />
        )
      case 4:
        return (
          <PhoneStep
            selectedNetwork={selectedNetwork}
            selectedPhone={selectedPhone}
            onSelect={(phone) => {
              setSelectedPhone(phone)
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="withdrawal"
            listLayout
          />
        )
      case 5:
        return (
          <AmountStep
            amount={amount}
            setAmount={setAmount}
            withdriwalCode={withdriwalCode}
            setWithdriwalCode={setWithdriwalCode}
            selectedPlatform={selectedPlatform}
            selectedBetId={selectedBetId}
            selectedNetwork={selectedNetwork}
            selectedPhone={selectedPhone}
            type="withdrawal"
            onNext={handleNext}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="-mt-4 sm:-mt-8 min-h-screen pb-20 md:pb-2">
      {/* ── En-tête ── */}
      <section className="border-b border-border/60 bg-card/50 px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/v2"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Retrait</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Effectuer un retrait
            </p>
          </div>
        </div>
      </section>

      {/* ── Contenu ── */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 space-y-4 pb-20 md:pb-4">
        <TransactionProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          type="withdrawal"
          className="py-2 sm:py-3"
        />

        <div className="min-h-[260px] sm:min-h-[320px]">
          {currentStep > 1 && (
            <PlatformHelpLinks platform={selectedPlatform} type="withdrawal" />
          )}
          {renderCurrentStep()}
        </div>
      </div>

      {/* Suivant / Précédent en bas (fixe sur mobile) */}
      {currentStep <= 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:z-0 bg-background/95 dark:bg-background/95 backdrop-blur-md border-t border-border/60 md:border-t-0 md:px-4 md:pb-0 md:pt-2 pb-safe-nav">
          <div className="px-4 py-3 md:max-w-2xl md:mx-auto">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isNextDisabled={!isStepValid()}
            />
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmTransaction}
        transactionData={{
          amount,
          phone_number: selectedPhone?.phone || "",
          app: selectedPlatform?.id || "",
          user_app_id: selectedBetId?.user_app_id || "",
          network: selectedNetwork?.id || 0,
          withdriwal_code: withdriwalCode,
        }}
        type="withdrawal"
        platformName={selectedPlatform?.name || ""}
        networkName={selectedNetwork?.public_name || ""}
        isLoading={isSubmitting}
      />
    </div>
  )
}
