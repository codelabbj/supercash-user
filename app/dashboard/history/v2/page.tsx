"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Wallet,
  XCircle,
  Loader2,
  History,
} from "lucide-react"
import { transactionApi } from "@/lib/api-client"
import type { Transaction } from "@/lib/types"
import { toast } from "react-hot-toast"
import { TransactionCard } from "@/components/transaction/TransactionCard"

export default function HistoryV2Page() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdrawal">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accept" | "reject" | "timeout">("all")

  useEffect(() => {
    if (user?.id) fetchTransactions()
  }, [user?.id, currentPage, searchTerm, typeFilter, statusFilter])

  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) fetchTransactions()
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [user?.id])

  const fetchTransactions = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        page_size: 10,
      }
      if (searchTerm) params.search = searchTerm
      if (typeFilter !== "all") params.type_trans = typeFilter
      if (statusFilter !== "all") params.status = statusFilter

      const data = await transactionApi.getHistory(params)
      setTransactions(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / 10))
    } catch {
      toast.error("Erreur lors du chargement de l'historique")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType: "type" | "status", value: string) => {
    if (filterType === "type") setTypeFilter(value as "all" | "deposit" | "withdrawal")
    else if (filterType === "status") setStatusFilter(value as "all" | "pending" | "accept" | "reject" | "timeout")
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Veuillez vous connecter pour voir l'historique.</p>
      </div>
    )
  }

  return (
    <div className="-mt-4 sm:-mt-8 min-h-screen pb-20 md:pb-2">
      {/* ── En-tête ── */}
      <section className="border-b border-border/60 bg-card/50 px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard/v2"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Historique</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Toutes vos transactions
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </section>

      {/* ── Filtres ── */}
      <section className="px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">Filtres</span>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Référence ou montant..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-9 pl-8 text-xs bg-muted/30 dark:bg-muted/20 border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-gold/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={typeFilter} onValueChange={(v) => handleFilterChange("type", v)}>
                <SelectTrigger className="h-9 text-xs bg-muted/30 dark:bg-muted/20 border-border/60 rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="deposit">Dépôts</SelectItem>
                  <SelectItem value="withdrawal">Retraits</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="h-9 text-xs bg-muted/30 dark:bg-muted/20 border-border/60 rounded-lg">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accept">Accepté</SelectItem>
                  <SelectItem value="reject">Rejeté</SelectItem>
                  <SelectItem value="timeout">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="flex w-full items-center justify-center gap-1.5 h-8 text-[10px] font-medium text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/5 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Effacer les filtres
            </button>
          </div>
        </div>
      </section>

      {/* ── Liste des transactions ── */}
      <section className="px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
          <span className="text-[10px] font-medium text-muted-foreground">{totalCount} au total</span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border/60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 sm:h-18 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-semibold text-sm text-foreground">Aucune transaction</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                Vos opérations s'afficheront ici.
              </p>
              <Link
                href="/dashboard/deposit/v2"
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Effectuer un dépôt
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {transactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions?id=${transaction.id}&returnTo=/dashboard/history/v2`}
                  className="block"
                >
                  <TransactionCard transaction={transaction} compact />
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-border/60 bg-muted/20">
              <p className="text-[10px] text-muted-foreground">
                Page {currentPage} / {totalPages}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 min-w-[60px] rounded-lg border border-border/60 bg-background px-2 text-[10px] font-medium text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Préc.
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 min-w-[60px] rounded-lg border border-border/60 bg-background px-2 text-[10px] font-medium text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Suiv.
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
