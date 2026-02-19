"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF0000" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
import type { Platform, UserAppId, Network, UserPhone } from "@/lib/types"

interface AmountStepProps {
  amount: number
  setAmount: (amount: number) => void
  withdriwalCode: string
  setWithdriwalCode: (code: string) => void
  selectedPlatform: Platform | null
  selectedBetId: UserAppId | null
  selectedNetwork: Network | null
  selectedPhone: UserPhone | null
  type: "deposit" | "withdrawal"
  onNext: () => void
}

import { cn } from "@/lib/utils"

export function AmountStep({
  amount,
  setAmount,
  withdriwalCode,
  setWithdriwalCode,
  selectedPlatform,
  selectedBetId,
  selectedNetwork,
  selectedPhone,
  type,
  onNext
}: AmountStepProps) {
  const [errors, setErrors] = useState<{ amount?: string; withdriwalCode?: string }>({})
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)

  // ... (keeping validation logic)
  const validateAmount = (value: number) => {
    if (!selectedPlatform) return "Plateforme non sélectionnée"
    if (value <= 0) return "Le montant doit être supérieur à 0"
    const minAmount = type === "deposit" ? selectedPlatform.minimun_deposit : selectedPlatform.minimun_with
    const maxAmount = type === "deposit" ? selectedPlatform.max_deposit : selectedPlatform.max_win
    if (value < minAmount) return `Le montant minimum est ${minAmount.toLocaleString()} FCFA`
    if (value > maxAmount) return `Le montant maximum est ${maxAmount.toLocaleString()} FCFA`
    return null
  }

  const validateWithdriwalCode = (code: string) => {
    if (type === "withdrawal" && code.length < 4) {
      return "Le code de retrait doit contenir au moins 4 caractères"
    }
    return null
  }

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setAmount(numValue)
    const error = validateAmount(numValue)
    setErrors(prev => ({ ...prev, amount: error || undefined }))
  }

  const handleWithdriwalCodeChange = (value: string) => {
    setWithdriwalCode(value)
    const error = validateWithdriwalCode(value)
    setErrors(prev => ({ ...prev, withdriwalCode: error || undefined }))
  }

  const isFormValid = () => {
    const amountError = validateAmount(amount)
    const withdriwalCodeError = type === "withdrawal" ? validateWithdriwalCode(withdriwalCode) : null
    return !amountError && !withdriwalCodeError &&
      selectedPlatform && selectedBetId && selectedNetwork && selectedPhone
  }

  if (!selectedPlatform || !selectedBetId || !selectedNetwork || !selectedPhone) {
    return (
      <Card className="border-none bg-muted/5">
        <CardContent className="flex items-center justify-center py-20 text-muted-foreground font-bold">
          Veuillez compléter les étapes précédentes
        </CardContent>
      </Card>
    )
  }

  const minAmount = type === "deposit" ? selectedPlatform.minimun_deposit : selectedPlatform.minimun_with
  const maxAmount = type === "deposit" ? selectedPlatform.max_deposit : selectedPlatform.max_win

  const withdrawalTutoLink = selectedPlatform.withdrawal_tuto_link?.trim() || null
  const whyWithdrawalFailLink = selectedPlatform.why_withdrawal_fail?.trim() || null

  // Retrait : écran d’intro avec liens d’aide puis bouton pour afficher le formulaire
  const hasTutoLinks = !!(withdrawalTutoLink || whyWithdrawalFailLink)
  if (type === "withdrawal" && !showWithdrawalForm && hasTutoLinks) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <div className="text-center space-y-0.5 mb-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Code de retrait</h2>
          <p className="text-xs text-muted-foreground">Consultez les informations ci-dessous si besoin</p>
        </div>

        <div className="space-y-2">
          {withdrawalTutoLink && (
            <a
              href={withdrawalTutoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-sm font-medium text-foreground">Comment avoir un code de retrait ?</span>
              <YoutubeIcon className="h-6 w-6 shrink-0" />
            </a>
          )}
          {whyWithdrawalFailLink && (
            <a
              href={whyWithdrawalFailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-sm font-medium text-foreground">Pourquoi mon retrait a échoué ?</span>
              <YoutubeIcon className="h-6 w-6 shrink-0" />
            </a>
          )}
        </div>

        <Button
          onClick={() => setShowWithdrawalForm(true)}
          className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          J&apos;ai déjà un code de retrait
        </Button>

        <div className="rounded-xl border border-border/60 bg-card p-3 pt-4 mt-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Récapitulatif</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Plateforme</span> {selectedPlatform.name}</p>
            <p><span className="text-foreground font-medium">ID</span> {selectedBetId.user_app_id}</p>
            <p><span className="text-foreground font-medium">Réseau</span> {selectedNetwork.public_name}</p>
            <p><span className="text-foreground font-medium">Numéro</span> +{selectedPhone.phone}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Titre (style v2) */}
      <div className="text-center space-y-0.5 mb-2">
        <h2 className="text-base sm:text-lg font-bold text-foreground">Montant</h2>
        <p className="text-xs text-muted-foreground">Entrez le montant en FCFA</p>
      </div>

      {/* Champ montant */}
      <div className="space-y-2">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
          <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
            Montant
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="amount"
              type="number"
              min={minAmount}
              max={maxAmount}
              value={amount || ""}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className={cn(
                "h-12 text-base font-semibold bg-background border border-border/60 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 flex-1",
                errors.amount && "border-destructive/50"
              )}
            />
            <span className="text-sm font-medium text-muted-foreground shrink-0">FCFA</span>
          </div>
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Min. {minAmount.toLocaleString("fr-FR")} – Max. {maxAmount.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>

      {/* Consigne dépôt */}
      {type === "deposit" && selectedPhone && (
        <div className="rounded-xl border border-border/60 bg-muted/30 dark:bg-muted/20 p-3 flex items-start gap-2">
          <svg className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Important :</span> Le numéro <span className="font-medium text-foreground">+{selectedPhone.phone}</span> est celui à utiliser pour le paiement (USSD ou lien).
          </p>
        </div>
      )}

      {/* Message réseau */}
      {selectedNetwork && (() => {
        const message = type === "deposit" ? selectedNetwork.deposit_message : selectedNetwork.withdrawal_message
        if (!message || message.trim() === "") return null
        return (
          <p className="text-xs text-center text-muted-foreground italic">&quot;{message}&quot;</p>
        )
      })()}

      {/* Code retrait */}
      {type === "withdrawal" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
            <Label htmlFor="withdriwalCode" className="text-xs font-medium text-muted-foreground">
              Code de retrait
            </Label>
            <Input
              id="withdriwalCode"
              type="text"
              value={withdriwalCode}
              onChange={(e) => handleWithdriwalCodeChange(e.target.value)}
              placeholder="Saisissez le code reçu sur la plateforme"
              className={cn(
                "h-12 text-base font-medium bg-background border border-border/60 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20",
                errors.withdriwalCode && "border-destructive/50"
              )}
            />
            {errors.withdriwalCode && (
              <p className="text-xs text-destructive">{errors.withdriwalCode}</p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!isFormValid()}
        className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-opacity"
      >
        {type === "deposit" ? "Confirmer le dépôt" : "Confirmer le retrait"}
      </Button>

      {/* Récapitulatif en bas (style v2) */}
      <div className="rounded-xl border border-border/60 bg-card p-3 pt-4 mt-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Récapitulatif</p>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p><span className="text-foreground font-medium">Plateforme</span> {selectedPlatform.name}</p>
          <p><span className="text-foreground font-medium">ID</span> {selectedBetId.user_app_id}</p>
          <p><span className="text-foreground font-medium">Réseau</span> {selectedNetwork.public_name}</p>
          <p><span className="text-foreground font-medium">Numéro</span> +{selectedPhone.phone}</p>
        </div>
      </div>
    </div>
  )
}
