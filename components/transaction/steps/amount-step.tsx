"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import type { Platform, UserAppId, Network, UserPhone } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  acceptedTerms?: boolean
  setAcceptedTerms?: (val: boolean) => void
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF0000" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

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
  onNext,
  acceptedTerms = false,
  setAcceptedTerms = () => {}
}: AmountStepProps) {
  const [errors, setErrors] = useState<{ amount?: string; withdriwalCode?: string }>({})
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)

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

  if (!selectedPlatform || !selectedBetId || !selectedNetwork || !selectedPhone) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground font-bold">
        Veuillez compléter les étapes précédentes
      </div>
    )
  }

  const minAmount = type === "deposit" ? selectedPlatform.minimun_deposit : selectedPlatform.minimun_with
  const maxAmount = type === "deposit" ? selectedPlatform.max_deposit : selectedPlatform.max_win

  const withdrawalTutoLink = selectedPlatform.withdrawal_tuto_link?.trim() || null
  const whyWithdrawalFailLink = selectedPlatform.why_withdrawal_fail?.trim() || null
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
              className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card p-3 sm:p-4 hover:bg-muted/40 transition-colors text-left shadow-sm"
            >
              <span className="text-sm font-semibold text-foreground">Comment avoir un code de retrait ?</span>
              <YoutubeIcon className="h-6 w-6 shrink-0" />
            </a>
          )}
          {whyWithdrawalFailLink && (
            <a
              href={whyWithdrawalFailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card p-3 sm:p-4 hover:bg-muted/40 transition-colors text-left shadow-sm"
            >
              <span className="text-sm font-semibold text-foreground">Pourquoi mon retrait a échoué ?</span>
              <YoutubeIcon className="h-6 w-6 shrink-0" />
            </a>
          )}
        </div>

        <button
          onClick={() => setShowWithdrawalForm(true)}
          className="w-full h-12 text-[15px] font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-sm transition-all active:scale-[0.98]"
        >
          J&apos;ai déjà un code de retrait
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-xl mx-auto pb-4">
      {/* 1. Résumé */}
      <div className="bg-white dark:bg-card border border-border/60 dark:border-border/80 rounded-[1.25rem] p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-4 text-foreground">Résumé</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium text-[13px] sm:text-sm">Type</span>
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-wide uppercase", type === "deposit" ? "bg-[#069476] dark:bg-[#069476]/80" : "bg-gold")}>
              {type === "deposit" ? "Dépôt" : "Retrait"}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-3">
            <span className="text-muted-foreground font-medium text-[13px] sm:text-sm">Plateforme</span>
            <span className="font-bold text-foreground uppercase tracking-wide">{selectedPlatform.name}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-3">
            <span className="text-muted-foreground font-medium text-[13px] sm:text-sm">ID de pari</span>
            <span className="font-bold text-foreground tabular-nums">{selectedBetId.user_app_id}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-3">
            <span className="text-muted-foreground font-medium text-[13px] sm:text-sm">Réseau</span>
            <span className="font-bold text-foreground tracking-wide uppercase">{selectedNetwork.public_name}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-3">
            <span className="text-muted-foreground font-medium text-[13px] sm:text-sm">Téléphone</span>
            <span className="font-bold text-foreground tabular-nums">+{selectedPhone.phone}</span>
          </div>
        </div>
      </div>

      {/* 2. Montant */}
      <div className="bg-white dark:bg-card border border-border/60 dark:border-border/80 rounded-[1.25rem] p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="font-bold text-base sm:text-lg text-foreground">Montant</h3>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            min={minAmount}
            max={maxAmount}
            value={amount || ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Entrez le montant"
            className={cn(
              "h-12 w-full text-base sm:text-[17px] font-medium bg-transparent border-gray-200 dark:border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-gold/40 px-4 placeholder:text-muted-foreground/50 placeholder:font-normal",
              errors.amount && "border-destructive/60 focus-visible:ring-destructive/30 text-destructive"
            )}
          />
          {amount > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] sm:text-sm font-bold text-muted-foreground dark:text-muted-foreground/80 pointer-events-none">FCFA</span>}
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive font-medium px-1">{errors.amount}</p>
        )}
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-medium px-1">
          Min. {minAmount.toLocaleString("fr-FR")} – Max. {maxAmount.toLocaleString("fr-FR")} FCFA
        </p>

        {/* Message réseau */}
        {selectedNetwork && (() => {
          const message = type === "deposit" ? selectedNetwork.deposit_message : selectedNetwork.withdrawal_message
          if (!message || message.trim() === "") return null
          return (
            <div className="mt-2 p-3 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/40">
              <p className="text-[11px] sm:text-xs text-muted-foreground italic leading-relaxed">&quot;{message}&quot;</p>
            </div>
          )
        })()}
        
        {/* Consigne dépôt */}
        {type === "deposit" && selectedPhone && (
          <div className="mt-2 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-900/20">
            <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
              <span className="font-semibold">Important :</span> Le numéro <span className="font-semibold text-amber-900 dark:text-white">+{selectedPhone.phone}</span> est celui à utiliser pour valider le paiement (USSD ou lien).
            </p>
          </div>
        )}
      </div>

      {/* Code retrait */}
      {type === "withdrawal" && (
        <div className="bg-white dark:bg-card border border-border/60 dark:border-border/80 rounded-[1.25rem] p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="font-bold text-base sm:text-lg text-foreground">Code de retrait</h3>
          <Input
            id="withdriwalCode"
            type="text"
            value={withdriwalCode}
            onChange={(e) => handleWithdriwalCodeChange(e.target.value)}
            placeholder="Entrez le code reçu"
            className={cn(
              "h-12 w-full text-base sm:text-[17px] font-medium bg-transparent border-gray-200 dark:border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-gold/40 px-4 placeholder:text-muted-foreground/50 placeholder:font-normal",
              errors.withdriwalCode && "border-destructive/60 text-destructive"
            )}
          />
          {errors.withdriwalCode && (
             <p className="text-xs text-destructive font-medium px-1">{errors.withdriwalCode}</p>
          )}
        </div>
      )}

      {/* 3. Checkbox Terms Card */}
      <button 
        type="button" 
        onClick={() => setAcceptedTerms(!acceptedTerms)}
        className={cn("w-full flex items-start sm:items-center gap-3 border rounded-[1.25rem] p-4 sm:p-5 transition-all text-left group", acceptedTerms ? "bg-[#069476]/5 border-[#069476]/20 dark:bg-[#069476]/10 dark:border-[#069476]/30 shadow-sm" : "bg-[#f8fafc]/50 hover:bg-muted/50 dark:bg-muted/5 dark:hover:bg-muted/10 border-border/60")}
      >
        <div className={cn("w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 rounded-full border flex items-center justify-center shrink-0 transition-all", acceptedTerms ? "bg-[#069476] border-[#069476] shadow-sm transform scale-105" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-[#069476]/50")}>
          {acceptedTerms && <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>}
        </div>
        <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          En cliquant sur Continuer, vous acceptez nos <span className="text-[#069476] dark:text-[#069476] font-semibold">conditions d'utilisation</span> et confirmez que vous avez plus de 18 ans.
        </p>
      </button>
    </div>
  )
}
