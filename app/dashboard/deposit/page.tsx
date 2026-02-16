"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, CircleCheck, Copy } from "lucide-react"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function DepositPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Form data
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedBetId, setSelectedBetId] = useState<UserAppId | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [selectedPhone, setSelectedPhone] = useState<UserPhone | null>(null)
  const [amount, setAmount] = useState(0)

  const [isUSSDDialogOpen, setIsUSSDDialogOpen] = useState(false)
  const [ussdCode, setUssdCode] = useState<string>("")
  const [copiedUSSD, setCopiedUSSD] = useState(false)
  // Confirmation dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transaction link modal + id pour redirection vers détail
  const [transactionLink, setTransactionLink] = useState<string | null>(null)
  const [isTransactionLinkModalOpen, setIsTransactionLinkModalOpen] = useState(false)
  const [createdTransactionId, setCreatedTransactionId] = useState<number | null>(null)

  // Redirect if not authenticated
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
        source: "web"
      })

      toast.success("Dépôt initié avec succès!")
      setCreatedTransactionId(response.id)
      setIsConfirmationOpen(false)

      // Priorité : ussd_code puis transaction_link puis redirection
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
    } catch (error: any) {
      // Error message is already handled by API interceptor
      // Only show additional toast if it's not the rate limiting error
      if (!error?.response?.data?.error_time_message) {
        // Generic error toast is already shown by interceptor, but we can add context if needed
      }
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
        router.push("/dashboard")
      }
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
        return amount > 0 && selectedPlatform &&
          amount >= selectedPlatform.minimun_deposit &&
          amount <= selectedPlatform.max_deposit
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
              // Auto-advance after selection
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="deposit"
          />
        )
      case 2:
        return (
          <BetIdStep
            selectedPlatform={selectedPlatform}
            selectedBetId={selectedBetId}
            onSelect={(betId) => {
              setSelectedBetId(betId)
              // Auto-advance after selection
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="deposit"
          />
        )
      case 3:
        return (
          <NetworkStep
            selectedNetwork={selectedNetwork}
            onSelect={(network) => {
              setSelectedNetwork(network)
              // Auto-advance after selection
              setTimeout(handleNext, 300)
            }}
            type="deposit"
          />
        )
      case 4:
        return (
          <PhoneStep
            selectedNetwork={selectedNetwork}
            selectedPhone={selectedPhone}
            onSelect={(phone) => {
              setSelectedPhone(phone)
              // Auto-advance after selection
              setTimeout(handleNext, 300)
            }}
            onNext={handleNext}
            type="deposit"
          />
        )
      case 5:
        return (
          <AmountStep
            amount={amount}
            setAmount={setAmount}
            withdriwalCode=""
            setWithdriwalCode={() => { }}
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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-24 sm:pb-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header - compact et clair sur mobile */}
        <div className="flex items-center gap-3 sm:gap-4 pt-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/80 shrink-0 -ml-1"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">Effectuer un dépôt</h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Remplissez les étapes pour continuer</p>
          </div>
        </div>

        {/* Progress Bar */}
        <TransactionProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          type="deposit"
        />

        {/* Navigation */}
        {currentStep < 5 && (
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isNextDisabled={!isStepValid()}
          />
        )}

        {/* Zone de contenu - carte légère sur mobile pour un rendu pro */}
        <div className="rounded-2xl sm:rounded-xl border border-border/60 bg-card/50 sm:bg-transparent sm:border-0 shadow-sm sm:shadow-none overflow-hidden">
          <div className="p-4 sm:p-0 min-h-[280px] sm:min-h-[360px]">
            {currentStep > 1 && (
              <PlatformHelpLinks
                platform={selectedPlatform}
                type="deposit"
              />
            )}
            {renderCurrentStep()}
          </div>
        </div>

        {/* Confirmation Dialog */}
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

        {/* Transaction Link Modal */}
        <Dialog open={isTransactionLinkModalOpen} onOpenChange={setIsTransactionLinkModalOpen}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md bg-white dark:bg-[#2D3436] border border-border/60 shadow-2xl rounded-2xl overflow-hidden mx-auto">
            <div className="p-5 sm:p-6 text-center space-y-4 sm:space-y-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto">
                <CircleCheck className="h-7 w-7 sm:h-10 sm:w-10 text-turquoise" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <DialogTitle className="text-xl sm:text-2xl font-black">Transaction Approuvée</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-sm sm:text-base">
                  Cliquez sur &quot;Continuer&quot; pour accéder au paiement sécurisé.
                </DialogDescription>
              </div>
              <Button
                onClick={handleContinueTransaction}
                variant="deposit"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-black shadow-lg shadow-turquoise/20 rounded-xl"
              >
                Continuer au Paiement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Code USSD (réponse backend) */}
        <Dialog open={isUSSDDialogOpen} onOpenChange={setIsUSSDDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg bg-white dark:bg-[#2D3436] border border-border/60 shadow-2xl rounded-2xl overflow-hidden p-0 mx-auto">
            <div className="bg-gradient-to-r from-gold to-turquoise h-1.5 sm:h-2 w-full" />
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
              <div className="text-center space-y-1.5 sm:space-y-2">
                <DialogTitle className="text-xl sm:text-3xl font-black">Code USSD</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-sm sm:text-base">
                  Composez ce code sur votre téléphone. Si le composeur ne s&apos;est pas ouvert, copiez le code ci-dessous.
                </DialogDescription>
              </div>

              <div className="relative">
                <div className="relative bg-muted/50 dark:bg-[#1E272E] p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed border-gold/30 flex items-center justify-center">
                  <code className="text-lg sm:text-3xl font-black text-center break-all tracking-tighter text-gold select-all">
                    {ussdCode}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  className="h-11 sm:h-14 font-bold sm:font-black text-xs sm:uppercase sm:tracking-widest border-2 rounded-xl sm:rounded-2xl"
                  onClick={() => {
                    navigator.clipboard.writeText(ussdCode)
                    setCopiedUSSD(true)
                    setTimeout(() => setCopiedUSSD(false), 2000)
                    toast.success("Copié!")
                  }}
                >
                  {copiedUSSD ? <Check className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />}
                  {copiedUSSD ? "Copié" : "Copier"}
                </Button>
                <Button
                  onClick={() => {
                    setIsUSSDDialogOpen(false)
                    if (createdTransactionId != null) {
                      router.push(`/dashboard/transactions?id=${createdTransactionId}`)
                    } else {
                      router.push("/dashboard")
                    }
                  }}
                  variant="deposit"
                  className="h-11 sm:h-14 font-bold sm:font-black rounded-xl sm:rounded-2xl shadow-lg shadow-gold/20"
                >
                  Terminé
                </Button>
              </div>

              <div className="bg-muted/30 p-3 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground opacity-60 text-center">Important</p>
                <p className="text-xs sm:text-sm text-center font-medium italic">
                  Attendez la fin du processus sur votre mobile avant de revenir.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}