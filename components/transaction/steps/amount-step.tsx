"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-0.5 sm:space-y-1 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-bold text-foreground">Dernière étape</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Détails et montant</p>
      </div>

      {/* Transaction Summary */}
      <Card className="border border-border/80 shadow-sm bg-card overflow-hidden rounded-xl sm:rounded-lg">
        <div className="bg-gold h-0.5 sm:h-1 w-full" />
        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-0.5">
              <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Plateforme</p>
              <p className="font-bold text-xs sm:text-sm truncate">{selectedPlatform.name}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">ID de Pari</p>
              <p className="font-bold text-xs sm:text-sm truncate">{selectedBetId.user_app_id}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Réseau</p>
              <p className="font-bold text-xs sm:text-sm truncate">{selectedNetwork.public_name}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Numéro</p>
              <p className="font-bold text-xs sm:text-sm truncate">+{selectedPhone.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input area */}
      <div className="space-y-4 sm:space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative">
            <Label htmlFor="amount" className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground mb-1.5 sm:mb-2 block text-center">
              Montant (FCFA)
            </Label>

            {/* Boutons de montants rapides */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {[1000, 5000, 10000, 25000, 50000, 100000].map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant="outline"
                  onClick={() => handleAmountChange(presetAmount.toString())}
                  className={cn(
                    "h-8 sm:h-10 text-[10px] sm:text-sm font-semibold transition-all rounded-lg hover:border-primary hover:bg-primary/5",
                    amount === presetAmount && "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                  )}
                >
                  {presetAmount >= 1000 ? `${presetAmount / 1000}k` : presetAmount}
                </Button>
              ))}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3 sm:left-4 text-sm sm:text-lg font-black text-muted-foreground">XOF</span>
              <Input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className={cn(
                  "h-12 sm:h-16 text-xl sm:text-2xl font-bold text-center bg-card border border-border/80 shadow-sm rounded-xl focus-visible:ring-2 focus-visible:ring-gold/30 px-12 sm:px-14 transition-all",
                  errors.amount ? "text-red-500" : "text-foreground"
                )}
              />
            </div>
          </div>
        </div>

        {errors.amount && (
          <p className="text-center text-sm font-bold text-red-500 animate-bounce">{errors.amount}</p>
        )}

        {/* Consigne dépôt : numéro à utiliser pour le paiement */}
        {type === "deposit" && selectedPhone && (
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Important :</strong> Le numéro <strong>{selectedPhone.phone}</strong> est celui que vous avez choisi. C&apos;est avec ce même numéro que vous devez effectuer le paiement (USSD ou lien de paiement).
            </p>
          </div>
        )}

        {/* Network Message */}
        {selectedNetwork && (() => {
          const message = type === "deposit" ? selectedNetwork.deposit_message : selectedNetwork.withdrawal_message
          if (!message || message.trim() === "") return null
          return (
            <div className="bg-gold/5 border border-dashed border-gold/20 rounded-lg p-4 text-sm text-gold font-medium text-center">
              "{message}"
            </div>
          )
        })()}

        {/* Withdrawal Code area */}
        {type === "withdrawal" && (
          <div className="space-y-3 pb-4">
            <Label htmlFor="withdriwalCode" className="text-sm font-black uppercase tracking-widest text-muted-foreground block text-center">
              Code de Retrait Obligatoire
            </Label>
            <Input
              id="withdriwalCode"
              type="text"
              value={withdriwalCode}
              onChange={(e) => handleWithdriwalCodeChange(e.target.value)}
              placeholder="Entrez votre code"
              className={cn(
                "h-16 text-2xl font-black text-center bg-white dark:bg-[#121212] border-none shadow-xl rounded-[var(--radius)] focus-visible:ring-4 focus-visible:ring-gold/20 dark:focus-visible:ring-turquoise/20",
                errors.withdriwalCode ? "text-red-500" : ""
              )}
            />
            {errors.withdriwalCode && (
              <p className="text-center text-xs font-bold text-red-500">{errors.withdriwalCode}</p>
            )}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          variant="deposit"
          className="w-full h-11 sm:h-12 text-base sm:text-lg font-black shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl sm:rounded-2xl mt-3 sm:mt-4"
        >
          {type === "deposit" ? "Confirmer le Dépôt" : "Confirmer le Retrait"}
        </Button>
      </div>
    </div>
  )
}
