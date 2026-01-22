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
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)] overflow-hidden p-0">
        <div className={cn(
          "h-2 w-full bg-gradient-to-r",
          type === "deposit" ? "from-gold to-turquoise" : "from-turquoise to-gold"
        )} />

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              type === "deposit" ? "bg-gold/10 text-gold" : "bg-turquoise/10 text-turquoise"
            )}>
              <CheckCircle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight">
              Confirmer {type === "deposit" ? "le dépôt" : "le retrait"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Veuillez vérifier les informations de paiement
            </DialogDescription>
          </div>

          <div className="bg-[#F9FAFB] dark:bg-[#1E272E] rounded-3xl p-6 space-y-6 shadow-inner border border-muted/20">
            <div className="text-center pb-4 border-b border-muted">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Montant Total</p>
              <h2 className="text-4xl font-black tracking-tighter">
                {transactionData.amount.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  minimumFractionDigits: 0,
                })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plateforme</p>
                <p className="font-bold">{platformName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Réseau</p>
                <p className="font-bold">{networkName}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID de Pari</p>
                <p className="font-bold truncate">{transactionData.user_app_id}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Numéro</p>
                <p className="font-bold">+{transactionData.phone_number}</p>
              </div>
            </div>

            {type === "withdrawal" && transactionData.withdriwal_code && (
              <div className="pt-4 border-t border-muted">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Code de retrait</p>
                <p className="font-mono font-bold bg-turquoise/5 p-2 rounded-lg text-turquoise text-center">{transactionData.withdriwal_code}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="h-14 font-black uppercase tracking-widest rounded-2xl border-2"
            >
              Modifier
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              className={cn(
                "h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95",
                type === "deposit" ? "bg-gold hover:bg-gold/90 text-white shadow-gold/20" : "bg-turquoise hover:bg-turquoise/90 text-white shadow-turquoise/20"
              )}
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
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
