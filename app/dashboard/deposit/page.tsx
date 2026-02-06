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
import { useSettings } from "@/lib/hooks/use-settings";
import { cn } from "@/lib/utils"

export default function DepositPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { settings } = useSettings()

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Form data
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedBetId, setSelectedBetId] = useState<UserAppId | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [selectedPhone, setSelectedPhone] = useState<UserPhone | null>(null)
  const [amount, setAmount] = useState(0)

  const [isMoovUSSDDialogOpen, setIsMoovUSSDDialogOpen] = useState(false)
  const [moovUSSDCode, setMoovUSSDCode] = useState<string>("")
  const [isOrangeUSSDDialogOpen, setIsOrangeUSSDDialogOpen] = useState(false)
  const [orangeUSSDCode, setOrangeUSSDCode] = useState<string>("")
  const [copiedUSSD, setCopiedUSSD] = useState(false)
  // Confirmation dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transaction link modal
  const [transactionLink, setTransactionLink] = useState<string | null>(null)
  const [isTransactionLinkModalOpen, setIsTransactionLinkModalOpen] = useState(false)

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

      // Check if transaction_link exists in the response
      if (response.transaction_link) {
        setTransactionLink(response.transaction_link)
        setIsTransactionLinkModalOpen(true)
        setIsConfirmationOpen(false)
      } else {
        // Check if Moov network and API is connected
        const isMoov = selectedNetwork?.name?.toLowerCase() === "moov"
        const isMoovConnected = selectedNetwork?.deposit_api === "connect" && isMoov

        // Check if Orange network and API is connected
        const isOrange = selectedNetwork?.name?.toLowerCase() === "orange"
        const isOrangeConnected = selectedNetwork?.deposit_api === "connect" && isOrange

        if (isMoovConnected && settings) {
          // Determine phone number based on country code
          const isBfCountry = selectedNetwork?.country_code?.toLowerCase() === "bf"
          const marchandPhone = isBfCountry && settings.bf_moov_marchand_phone
            ? settings.bf_moov_marchand_phone
            : settings.moov_marchand_phone

          // Generate USSD code: *155*2*1*marchand_phone*net_amount# (with 1% fee removed)
          const fee = Math.ceil(amount * 0.01) // 1% fee
          const netAmount = amount - fee
          const ussdCode = `*155*2*1*${marchandPhone}*${netAmount}#`

          // Always show the USSD dialog
          setIsMoovUSSDDialogOpen(true)
          setMoovUSSDCode(ussdCode)
          setIsConfirmationOpen(false)

          setTimeout(() => {
            window.location.href = `tel:${ussdCode}`
          }, 500)

        } else if (isOrangeConnected && settings) {
          // For Orange, check payment_by_link - if false, use USSD
          if (selectedNetwork?.payment_by_link === false) {
            // Determine phone number based on country code
            const isBfCountry = selectedNetwork?.country_code?.toLowerCase() === "bf"
            const marchandPhone = isBfCountry && settings.bf_orange_marchand_phone
              ? settings.bf_orange_marchand_phone
              : settings.orange_marchand_phone

            // Generate USSD code: *144*2*1*settings.orange_marchand_phone*montant#
            const ussdCode = `*144*2*1*${marchandPhone}*${amount}#`

            // Show the Orange USSD dialog
            setIsOrangeUSSDDialogOpen(true)
            setOrangeUSSDCode(ussdCode)
            setIsConfirmationOpen(false)

            setTimeout(() => {
              window.location.href = `tel:${ussdCode}`
            }, 500)
          } else {
            // If payment_by_link is true, show success (transaction link should have been handled above)
            toast.success("Dépôt initié avec succès!")
            router.push("/dashboard")
          }
        } else {
          toast.success("Dépôt initié avec succès!")
          router.push("/dashboard")
        }
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
      router.push("/dashboard")
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-lg hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Effectuer un dépôt</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <TransactionProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          type="deposit"
        />

        {/* Navigation - Moved above content */}
        {currentStep < 5 && (
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isNextDisabled={!isStepValid()}
          />
        )}

        {/* Current Step */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {currentStep > 1 && (
            <PlatformHelpLinks
              platform={selectedPlatform}
              type="deposit"
            />
          )}
          {renderCurrentStep()}
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
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)] overflow-hidden">
            <div className="p-6 text-center space-y-6">
              <div className="w-20 h-20 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto">
                <CircleCheck className="h-10 w-10 text-turquoise" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-black">Transaction Approuvée</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Votre demande est prête. Cliquez sur "Continuer" pour accéder à l'interface de paiement sécurisée.
                </DialogDescription>
              </div>
              <Button
                onClick={handleContinueTransaction}
                variant="deposit"
                className="w-full h-14 text-lg font-black shadow-lg shadow-turquoise/20"
              >
                Continuer au Paiement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Moov USSD Code Dialog */}
        <Dialog open={isMoovUSSDDialogOpen} onOpenChange={setIsMoovUSSDDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-gold to-turquoise h-2 w-full" />
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl sm:text-3xl font-black">Paiement USSD Moov</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Composez ce code sur votre téléphone pour valider l'opération
                </DialogDescription>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gold/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-[#F9FAFB] dark:bg-[#1E272E] p-8 rounded-2xl border-2 border-dashed border-gold/30 flex items-center justify-center">
                  <code className="text-2xl sm:text-3xl font-black text-center break-all tracking-tighter text-gold">
                    {moovUSSDCode}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-14 font-black uppercase tracking-widest border-2 rounded-2xl"
                  onClick={() => {
                    navigator.clipboard.writeText(moovUSSDCode)
                    setCopiedUSSD(true)
                    setTimeout(() => setCopiedUSSD(false), 2000)
                    toast.success("Code copié!")
                  }}
                >
                  {copiedUSSD ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                  {copiedUSSD ? "Copié" : "Copier"}
                </Button>
                <Button
                  onClick={() => {
                    setIsMoovUSSDDialogOpen(false)
                    router.push("/dashboard")
                  }}
                  variant="deposit"
                  className="h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-gold/20"
                >
                  Terminé
                </Button>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60 text-center">Important</p>
                <p className="text-sm text-center font-medium italic">
                  Attendez la fin du processus sur votre mobile avant de revenir sur Super Cash.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Orange USSD Code Dialog */}
        <Dialog open={isOrangeUSSDDialogOpen} onOpenChange={setIsOrangeUSSDDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-turquoise to-gold h-2 w-full" />
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl sm:text-3xl font-black">Paiement USSD Orange</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Utilisez ce code pour finaliser votre recharge
                </DialogDescription>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-turquoise/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-[#F9FAFB] dark:bg-[#1E272E] p-8 rounded-2xl border-2 border-dashed border-turquoise/30 flex items-center justify-center">
                  <code className="text-2xl sm:text-3xl font-black text-center break-all tracking-tighter text-turquoise">
                    {orangeUSSDCode}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-14 font-black uppercase tracking-widest border-2 rounded-2xl"
                  onClick={() => {
                    navigator.clipboard.writeText(orangeUSSDCode)
                    setCopiedUSSD(true)
                    setTimeout(() => setCopiedUSSD(false), 2000)
                    toast.success("Code copié!")
                  }}
                >
                  {copiedUSSD ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                  {copiedUSSD ? "Copié" : "Copier"}
                </Button>
                <Button
                  onClick={() => {
                    setIsOrangeUSSDDialogOpen(false)
                    router.push("/dashboard")
                  }}
                  variant="deposit"
                  className="h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-turquoise/20"
                >
                  Terminé
                </Button>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-center">
                <p className="text-sm font-medium">
                  Votre solde sera mis à jour dès confirmation du réseau.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}