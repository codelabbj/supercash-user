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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, CircleCheck, Copy } from "lucide-react"

export default function DepositV2Page() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedBetId, setSelectedBetId] = useState<UserAppId | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [selectedPhone, setSelectedPhone] = useState<UserPhone | null>(null)
  const [amount, setAmount] = useState(0)

  const [isUSSDDialogOpen, setIsUSSDDialogOpen] = useState(false)
  const [ussdCode, setUssdCode] = useState("")
  const [copiedUSSD, setCopiedUSSD] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [transactionLink, setTransactionLink] = useState<string | null>(null)
  const [isTransactionLinkModalOpen, setIsTransactionLinkModalOpen] = useState(false)
  const [createdTransactionId, setCreatedTransactionId] = useState<number | null>(null)

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
      const response = await transactionApi.createDeposit({
        amount,
        phone_number: normalizePhoneNumber(selectedPhone.phone),
        app: selectedPlatform.id,
        user_app_id: selectedBetId.user_app_id,
        network: selectedNetwork.id,
        source: "web",
      })

      toast.success("Dépôt initié avec succès!")
      setCreatedTransactionId(response.id)
      setIsConfirmationOpen(false)

      const code = response.ussd_code?.trim?.()
      if (code) {
        setUssdCode(code)
        setIsUSSDDialogOpen(true)
        setTimeout(() => {
          window.location.href = `tel:${code}`
        }, 300)
      } else if (response.transaction_link) {
        setTransactionLink(response.transaction_link)
        setIsTransactionLinkModalOpen(true)
      } else {
        router.push(`/dashboard/transactions?id=${response.id}`)
      }
    } catch {
      // Error handled by API interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueTransaction = () => {
    if (transactionLink) {
      window.open(transactionLink, "_blank", "noopener,noreferrer")
      setIsTransactionLinkModalOpen(false)
      if (createdTransactionId != null) {
        router.push(`/dashboard/transactions?id=${createdTransactionId}`)
      } else {
        router.push("/dashboard/v2")
      }
    }
  }

  const goToDetailOrHome = () => {
    setIsUSSDDialogOpen(false)
    if (createdTransactionId != null) {
      router.push(`/dashboard/transactions?id=${createdTransactionId}`)
    } else {
      router.push("/dashboard/v2")
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
          amount >= selectedPlatform.minimun_deposit &&
          amount <= selectedPlatform.max_deposit
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
            type="deposit"
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
            type="deposit"
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
            type="deposit"
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
            type="deposit"
            listLayout
          />
        )
      case 5:
        return (
          <AmountStep
            amount={amount}
            setAmount={setAmount}
            withdriwalCode=""
            setWithdriwalCode={() => {}}
            selectedPlatform={selectedPlatform}
            selectedBetId={selectedBetId}
            selectedNetwork={selectedNetwork}
            selectedPhone={selectedPhone}
            type="deposit"
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
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Dépôt</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Effectuer un dépôt
            </p>
          </div>
        </div>
      </section>

      {/* ── Contenu ── */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 space-y-4 pb-20 md:pb-4">
        <TransactionProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          type="deposit"
          className="py-2 sm:py-3"
        />

        <div className="min-h-[260px] sm:min-h-[320px]">
          {currentStep > 1 && (
            <PlatformHelpLinks platform={selectedPlatform} type="deposit" />
          )}
          {renderCurrentStep()}
        </div>
      </div>

      {/* Suivant / Précédent en bas (fixe sur mobile) */}
      {currentStep <= 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:z-0 bg-background/95 dark:bg-background/95 backdrop-blur-md border-t border-border/60 md:border-t-0 md:px-4 md:pb-0 md:pt-2">
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
        }}
        type="deposit"
        platformName={selectedPlatform?.name || ""}
        networkName={selectedNetwork?.public_name || ""}
        isLoading={isSubmitting}
      />

      {/* Modal lien de transaction */}
      <Dialog open={isTransactionLinkModalOpen} onOpenChange={setIsTransactionLinkModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md bg-card border border-border/60 rounded-xl shadow-lg mx-auto p-4 sm:p-5">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto">
              <CircleCheck className="h-6 w-6 sm:h-7 sm:w-7 text-turquoise" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold">Transaction approuvée</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Cliquez pour accéder au paiement sécurisé.
              </DialogDescription>
            </div>
            <Button
              onClick={handleContinueTransaction}
              className="w-full h-10 sm:h-11 text-sm font-semibold bg-turquoise hover:bg-turquoise/90 text-white rounded-lg"
            >
              Continuer au paiement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal code USSD */}
      <Dialog open={isUSSDDialogOpen} onOpenChange={setIsUSSDDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg bg-card border border-border/60 rounded-xl shadow-lg p-0 mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-gold to-gold/80 h-1 w-full" />
          <div className="p-4 sm:p-6 space-y-4">
            <div className="text-center space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold">Code USSD</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Composez ce code sur votre téléphone, ou copiez-le ci-dessous.
              </DialogDescription>
            </div>
            <div className="bg-muted/40 dark:bg-muted/20 p-3 sm:p-4 rounded-lg border border-border/60 flex items-center justify-center">
              <code className="text-base sm:text-xl font-bold text-gold break-all select-all tracking-tight">
                {ussdCode}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs font-medium rounded-lg border-border/60"
                onClick={() => {
                  navigator.clipboard.writeText(ussdCode)
                  setCopiedUSSD(true)
                  setTimeout(() => setCopiedUSSD(false), 2000)
                  toast.success("Copié!")
                }}
              >
                {copiedUSSD ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copiedUSSD ? "Copié" : "Copier"}
              </Button>
              <Button
                size="sm"
                onClick={goToDetailOrHome}
                className="h-9 text-xs font-semibold bg-gold hover:bg-gold/90 text-white rounded-lg"
              >
                Terminé
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center bg-muted/30 py-2 px-3 rounded-lg">
              Attendez la fin du processus sur votre mobile avant de revenir.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
