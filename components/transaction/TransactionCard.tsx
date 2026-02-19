import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface Props {
    transaction: Transaction
    /** Mode compact pour le dashboard (liste sans bordure individuelle) */
    compact?: boolean
}

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-amber-50   text-amber-600   dark:bg-amber-500/10  dark:text-amber-400" },
    init_payment: { label: "En attente", className: "bg-amber-50   text-amber-600   dark:bg-amber-500/10  dark:text-amber-400" },
    accept: { label: "Accepté", className: "bg-emerald-50  text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    error: { label: "Erreur", className: "bg-red-50     text-red-500     dark:bg-red-500/10    dark:text-red-400" },
    reject: { label: "Rejeté", className: "bg-red-50     text-red-500     dark:bg-red-500/10    dark:text-red-400" },
    timeout: { label: "Expiré", className: "bg-slate-100  text-slate-500   dark:bg-white/10      dark:text-slate-400" },
}

export const TransactionCard = ({ transaction, compact = false }: Props) => {
    const isDeposit = transaction.type_trans === "deposit"
    const status = statusConfig[transaction.status] ?? { label: transaction.status, className: "bg-slate-100 text-slate-500" }

    const platformName = transaction.app_details?.name ?? "—"
    const platformImage = transaction.app_details?.image ?? null
    const initial = platformName.charAt(0).toUpperCase()

    const formattedDate = (() => {
        try {
            return format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm", { locale: fr })
        } catch {
            return transaction.created_at
        }
    })()

    const formattedAmount = transaction.amount.toLocaleString("fr-FR") + " FCFA"

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-default">

            {/* Avatar : logo plateforme ou initiale */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-[#1A2E5A] dark:bg-white/10">
                {platformImage ? (
                    <img
                        src={platformImage}
                        alt={platformName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                    />
                ) : (
                    <span className="text-white font-bold text-base select-none">{initial}</span>
                )}
            </div>

            {/* Centre : type + plateforme · date */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-tight truncate">
                    {isDeposit ? "Dépôt" : "Retrait"}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {platformName} · {formattedDate}
                </p>
            </div>

            {/* Droite : montant + badge statut */}
            <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`text-sm font-bold leading-tight ${isDeposit ? "text-[#39D196]" : "text-red-500"}`}>
                    {isDeposit ? "+" : "−"}{formattedAmount}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                    {status.label}
                </span>
            </div>

        </div>
    )
}