"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Copy, Check, Loader2, ArrowDownToLine, ArrowUpFromLine, ExternalLink } from "lucide-react"
import { transactionApi, networkApi } from "@/lib/api-client"
import type { Transaction, Network } from "@/lib/types"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/ui/safe-image"
import { useSettings } from "@/lib/hooks/use-settings"

function TransactionDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { settings } = useSettings()
  const idParam = searchParams.get("id")
  const id = idParam ? Number(idParam) : null
  const returnTo = searchParams.get("returnTo") || "/dashboard/v2"
  const backHref = returnTo.startsWith("/") ? returnTo : "/dashboard/v2"

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (id == null || isNaN(id)) {
      setError("Transaction introuvable")
      setIsLoading(false)
      return
    }
    const fetchTransaction = async () => {
      try {
        const data = await transactionApi.getById(id)
        setTransaction(data)
        setError(null)
      } catch {
        // Fallback : récupérer la liste et trouver la transaction par id
        try {
          let page = 1
          const pageSize = 50
          const maxPages = 10
          while (page <= maxPages) {
            const { results } = await transactionApi.getHistory({ page, page_size: pageSize })
            const found = results.find((t) => t.id === id)
            if (found) {
              setTransaction(found)
              setError(null)
              return
            }
            if (results.length < pageSize) break
            page += 1
          }
          setError("Transaction introuvable")
        } catch {
          setError("Transaction introuvable")
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransaction()
  }, [id, user, router])

  // Charger le réseau (nom + image) quand la transaction est disponible
  useEffect(() => {
    if (!transaction?.network) return
    networkApi.getAll().then((networks) => {
      const found = networks.find((n) => n.id === transaction.network)
      setNetwork(found ?? null)
    }).catch(() => setNetwork(null))
  }, [transaction?.id, transaction?.network])

  const copyReference = () => {
    if (!transaction?.reference) return
    navigator.clipboard.writeText(transaction.reference).then(() => {
      setCopiedRef(true)
      toast.success("Référence copiée !")
      setTimeout(() => setCopiedRef(false), 2000)
    }).catch(() => toast.error("Erreur lors de la copie"))
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      accept: { variant: "default", label: "Accepté" },
      init_payment: { variant: "secondary", label: "En attente" },
      error: { variant: "destructive", label: "Erreur" },
      reject: { variant: "destructive", label: "Rejeté" },
      timeout: { variant: "outline", label: "Expiré" },
    }
    const c = config[status] || { variant: "outline" as const, label: status }
    return <Badge variant={c.variant} className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">{c.label}</Badge>
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-6 pb-24 sm:pb-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gold dark:text-turquoise" />
        <p className="text-sm text-muted-foreground mt-4">Chargement de la transaction…</p>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-6 pb-24 sm:pb-8">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground font-medium">{error || "Transaction introuvable"}</p>
            <Button variant="outline" onClick={() => router.push(backHref)} className="rounded-xl">
              Voir l&apos;historique
            </Button>
            <Button variant="ghost" onClick={() => router.push(backHref)} className="block mx-auto rounded-xl">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDeposit = transaction.type_trans === "deposit"

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 pb-24 sm:pb-8">
      <div className="space-y-3 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 pt-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backHref)}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/80 shrink-0 -ml-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
              Détails de la transaction
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              {isDeposit ? "Dépôt" : "Retrait"} • #{transaction.reference}
            </p>
          </div>
        </div>

        {/* Bloc principal */}
        <Card className="rounded-2xl sm:rounded-xl border border-border/60 overflow-hidden">
          {(() => {
            const statusStr = transaction.status as string
            const isErrorStatus = statusStr === "error" || statusStr === "reject"
            const bannerClass = isErrorStatus
              ? "bg-red-500/15 border-b border-red-500/30"
              : isDeposit
                ? "bg-gold/10 border-b border-gold/20"
                : "bg-turquoise/10 border-b border-turquoise/20"
            const iconClass = isErrorStatus
              ? "bg-red-500/25 text-red-600 dark:text-red-400"
              : isDeposit
                ? "bg-gold/20 text-gold"
                : "bg-turquoise/20 text-turquoise"
            const amountClass = isErrorStatus
              ? "text-red-600 dark:text-red-400"
              : isDeposit
                ? "text-gold"
                : "text-turquoise"
            return (
          <div className={bannerClass}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${iconClass}`}>
                    {isDeposit ? (
                      <ArrowDownToLine className="h-5 w-5 sm:h-8 sm:w-8" />
                    ) : (
                      <ArrowUpFromLine className="h-5 w-5 sm:h-8 sm:w-8" />
                    )}
                  </div>
                  <div>
                    <p className={`text-lg sm:text-2xl font-black ${amountClass}`}>
                      {isDeposit ? "+" : "-"}
                      {transaction.amount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XOF",
                        minimumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">
                      {format(new Date(transaction.created_at), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </CardContent>
          </div>
            )
          })()}

          <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {/* Référence */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Référence</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono font-bold text-xs sm:text-base">{transaction.reference}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg"
                  onClick={copyReference}
                  title="Copier"
                >
                  {copiedRef ? <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            </div>

            {/* Plateforme */}
            {transaction.app_details && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plateforme</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <SafeImage
                    src={transaction.app_details.image}
                    alt=""
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg object-cover shrink-0 border border-border/60"
                    fallbackText={transaction.app_details.name?.charAt(0) || ""}
                  />
                  <span className="font-semibold text-xs sm:text-base">{transaction.app_details.name}</span>
                </div>
              </div>
            )}

            {/* Réseau */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Réseau</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {network ? (
                  <>
                    <SafeImage
                      src={network.image}
                      alt=""
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg object-cover shrink-0 border border-border/60"
                      fallbackText={network.public_name?.charAt(0) || network.name?.charAt(0) || ""}
                    />
                    <span className="font-semibold text-xs sm:text-base">{network.public_name || network.name}</span>
                  </>
                ) : (
                  <span className="font-semibold text-xs sm:text-base text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* ID de pari */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID de pari</span>
              <span className="font-semibold text-xs sm:text-base truncate">{transaction.user_app_id}</span>
            </div>

            {/* Numéro */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Numéro</span>
              <span className="font-semibold text-xs sm:text-base">+{transaction.phone_number}</span>
            </div>

            {/* Lien / Code de paiement (transaction_link ou ussd_code) */}
            {(transaction.transaction_link || transaction.ussd_code) && (
              <div className="pt-1.5 sm:pt-2 border-t border-border/60 space-y-3">
                {transaction.transaction_link && (
                  <div className="space-y-2">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lien de paiement</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 min-w-0 text-xs sm:text-sm font-mono bg-muted/50 rounded-lg px-2 py-1.5 break-all select-all">
                        {transaction.transaction_link}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText(transaction.transaction_link!).then(() => toast.success("Copié"))
                        }}
                        title="Copier"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant={isDeposit ? "default" : "secondary"}
                      className="w-full rounded-xl h-9 sm:h-10 text-xs sm:text-sm bg-gold hover:bg-gold/90 dark:bg-turquoise dark:hover:bg-turquoise/90"
                      onClick={() => window.open(transaction.transaction_link!, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Ouvrir le lien de paiement
                    </Button>
                  </div>
                )}
                {transaction.ussd_code && (
                  <div className="space-y-2">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code USSD</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 min-w-0 text-xs sm:text-sm font-mono bg-muted/50 rounded-lg px-2 py-1.5 break-all select-all">
                        {transaction.ussd_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText(transaction.ussd_code!).then(() => toast.success("Copié"))
                        }}
                        title="Copier"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-9 sm:h-10 text-xs sm:text-sm border-2"
                      onClick={() => window.location.assign(`tel:${transaction.ussd_code}`)}
                    >
                      Composer le code USSD
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacter le support */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 pb-5 border-t border-border">
          <p className="text-sm font-semibold text-foreground mb-2 text-center">Un problème avec cette transaction ?</p>
          {(() => {
            const phone = settings?.whatsapp_phone?.replace(/\D/g, "")
            if (!phone) {
              return <p className="text-xs text-muted-foreground text-center">Support non configuré.</p>
            }
            const userName = [transaction.user?.first_name, transaction.user?.last_name].filter(Boolean).join(" ") || "Client"
            const typeLabel = isDeposit ? "dépôt" : "retrait"
            const formatDate = (d: string) => format(new Date(d), "dd/MM/yyyy à HH:mm", { locale: fr })
            const message = [
              `Bonjour moi c'est ${userName}, j'ai besoin d'aide concernant mon ${typeLabel}.`,
              `Date: ${formatDate(transaction.created_at)}`,
              `Référence: ${transaction.reference}`,
              `Montant: XOF ${transaction.amount.toLocaleString("fr-FR")}`,
              `Réseau: ${network?.public_name ?? "—"}`,
              `Téléphone: ${transaction.phone_number}`,
              `*${transaction.app_details?.name ?? "Plateforme"} ID:* ${transaction.user_app_id}`,
            ].join("\n")
            const whatsappSupportUrl = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`
            return (
              <Button
                className="w-full rounded-2xl h-12 font-semibold text-base bg-[#25D366] hover:bg-[#20BD5A] text-white border-0"
                onClick={() => window.open(whatsappSupportUrl, "_blank", "noopener,noreferrer")}
              >
                Contacter le support (WhatsApp)
              </Button>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-3 sm:px-6 pb-24 sm:pb-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gold dark:text-turquoise" />
      </div>
    }>
      <TransactionDetailContent />
    </Suspense>
  )
}
