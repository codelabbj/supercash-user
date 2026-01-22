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
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Dernière étape</h2>
        <p className="text-sm text-muted-foreground">Vérifiez les détails et entrez le montant</p>
      </div>

      {/* Transaction Summary */}
      <Card className="border shadow-sm bg-card overflow-hidden rounded-lg">
        <div className="bg-gold h-1 w-full" />
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-[8px] font-semibold uppercase text-muted-foreground">Plateforme</p>
              <p className="font-bold text-sm">{selectedPlatform.name}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-semibold uppercase text-muted-foreground">ID de Pari</p>
              <p className="font-bold text-sm">{selectedBetId.user_app_id}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-semibold uppercase text-muted-foreground">Réseau</p>
              <p className="font-bold text-sm">{selectedNetwork.public_name}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-semibold uppercase text-muted-foreground">Numéro</p>
              <p className="font-bold text-sm">+{selectedPhone.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input area */}
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase text-muted-foreground mb-2 block text-center">
              Montant à {type === "deposit" ? "Déposer" : "Retirer"} (FCFA)
            </Label>

            {/* Boutons de montants rapides */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1000, 5000, 10000, 25000, 50000, 100000].map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant="outline"
                  onClick={() => handleAmountChange(presetAmount.toString())}
                  className={cn(
                    "h-10 text-sm font-semibold transition-all hover:border-primary hover:bg-primary/5",
                    amount === presetAmount && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {presetAmount.toLocaleString()}
                </Button>
              ))}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg font-black text-muted-foreground">XOF</span>
              <Input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className={cn(
                  "h-16 sm:h-18 text-2xl sm:text-3xl font-bold text-center bg-card border shadow-sm rounded-lg focus-visible:ring-2 focus-visible:ring-gold/30 px-14 transition-all",
                  errors.amount ? "text-red-500" : "text-foreground"
                )}
              />
            </div>
          </div>
        </div>

        {errors.amount && (
          <p className="text-center text-sm font-bold text-red-500 animate-bounce">{errors.amount}</p>
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
          className="w-full h-12 sm:h-14 text-lg sm:text-xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all rounded-[24px] mt-4"
        >
          {type === "deposit" ? "Confirmer le Dépôt" : "Confirmer le Retrait"}
        </Button>
      </div>
    </div>
  )
}
