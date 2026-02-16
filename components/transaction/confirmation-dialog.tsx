"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "react-hot-toast"

interface TransactionData {
  amount: number
  phone_number: string
  app: string
  user_app_id: string
  network: number
  withdriwal_code?: string
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  transactionData: TransactionData
  type: "deposit" | "withdrawal"
  platformName: string
  networkName: string
  isLoading?: boolean
}

import { cn } from "@/lib/utils"

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
  type,
  platformName,
  networkName,
  isLoading = false
}: ConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      // Success toast is handled in the parent usually, but we keep it for safety if needed
      // Actually parent handles it in the current implementation.
    } catch (error) {
      toast.error("Une erreur est survenue lors de la transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg bg-white dark:bg-[#2D3436] border border-border/60 shadow-2xl rounded-2xl overflow-hidden p-0 mx-auto">
        <div className={cn(
          "h-1.5 sm:h-2 w-full bg-gradient-to-r",
          type === "deposit" ? "from-gold to-turquoise" : "from-turquoise to-gold"
        )} />

        <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4",
              type === "deposit" ? "bg-gold/10 text-gold" : "bg-turquoise/10 text-turquoise"
            )}>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <DialogTitle className="text-xl sm:text-3xl font-black tracking-tight">
              Confirmer {type === "deposit" ? "le dépôt" : "le retrait"}
            </DialogTitle>
            <DialogDescription className="font-medium text-sm sm:text-base">
              Vérifiez les informations ci-dessous
            </DialogDescription>
          </div>

          <div className="bg-muted/30 dark:bg-[#1E272E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-inner border border-muted/20">
            <div className="text-center pb-3 sm:pb-4 border-b border-muted">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">Montant Total</p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter">
                {transactionData.amount.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  minimumFractionDigits: 0,
                })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-3 sm:gap-x-4">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">Plateforme</p>
                <p className="font-bold text-sm sm:text-base truncate">{platformName}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">Réseau</p>
                <p className="font-bold text-sm sm:text-base truncate">{networkName}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1 text-left">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">ID de Pari</p>
                <p className="font-bold text-sm sm:text-base truncate">{transactionData.user_app_id}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1 text-left">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">Numéro</p>
                <p className="font-bold text-sm sm:text-base truncate">+{transactionData.phone_number}</p>
              </div>
            </div>

            {type === "withdrawal" && transactionData.withdriwal_code && (
              <div className="pt-3 sm:pt-4 border-t border-muted">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">Code de retrait</p>
                <p className="font-mono font-bold text-sm bg-turquoise/5 p-2 rounded-lg text-turquoise text-center">{transactionData.withdriwal_code}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="h-11 sm:h-14 font-bold sm:font-black rounded-xl sm:rounded-2xl border-2"
            >
              Modifier
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              className={cn(
                "h-11 sm:h-14 font-bold sm:font-black rounded-xl sm:rounded-2xl shadow-lg transition-all active:scale-95",
                type === "deposit" ? "bg-gold hover:bg-gold/90 text-white shadow-gold/20" : "bg-turquoise hover:bg-turquoise/90 text-white shadow-turquoise/20"
              )}
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
              ) : (
                "Confirmer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
