"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/ui/safe-image"
import { Loader2 } from "lucide-react"
import { networkApi } from "@/lib/api-client"
import type { Network } from "@/lib/types"
import { TRANSACTION_TYPES, getTransactionTypeLabel } from "@/lib/constants"

interface NetworkStepProps {
  selectedNetwork: Network | null
  onSelect: (network: Network) => void
  type: "deposit" | "withdrawal"
  /** Affichage en liste verticale (au lieu de grille) */
  listLayout?: boolean
}
import { cn } from "@/lib/utils"

export function NetworkStep({ selectedNetwork, onSelect, type, listLayout }: NetworkStepProps) {
  const [networks, setNetworks] = useState<Network[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await networkApi.getAll()
        const activeNetworks = data.filter(network =>
          type === TRANSACTION_TYPES.DEPOSIT ? network.active_for_deposit : network.active_for_with
        )
        setNetworks(activeNetworks)
      } catch (error) {
        console.error("Error fetching networks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNetworks()
  }, [type])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-turquoise" />
      </div>
    )
  }

  const isDeposit = type === "deposit"

  return (
    <div className={cn(listLayout ? "space-y-2" : "space-y-4 sm:space-y-6")}>
      <div className={cn("text-center space-y-0.5 mb-3", listLayout && "mb-2")}>
        <h2 className={cn("font-bold text-foreground", listLayout ? "text-base sm:text-lg" : "text-base sm:text-xl")}>Choisissez votre réseau</h2>
        {!listLayout && <p className="text-xs sm:text-sm text-muted-foreground">Moyen de paiement</p>}
      </div>

      <div className={cn(listLayout ? "flex flex-col gap-2.5" : "grid grid-cols-2 gap-2 sm:gap-4")}>
        {networks.map((network) => {
          const selected = selectedNetwork?.id === network.id
          if (listLayout) {
            return (
              <button
                key={network.id}
                type="button"
                onClick={() => onSelect(network)}
                className={cn(
                  "w-full text-left rounded-none overflow-hidden transition-all duration-200 active:scale-[0.99]",
                  "flex items-center gap-3 py-2.5 px-3 border border-border/60",
                  selected
                    ? "bg-muted/60 dark:bg-muted/40 border-l-4 border-l-primary"
                    : "bg-card hover:bg-muted/40 dark:hover:bg-muted/30 border-l-4 border-l-transparent hover:border-border"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-none overflow-hidden shrink-0",
                  selected ? "ring-2 ring-primary/20" : "",
                  "bg-muted/50 dark:bg-muted/50"
                )}>
                  <SafeImage
                    src={network.image}
                    alt={network.name}
                    className="w-full h-full object-cover"
                    fallbackText={network.public_name.charAt(0).toUpperCase()}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-foreground">{network.public_name}</p>
                  <p className="text-[10px] truncate text-muted-foreground">
                    {network.name}{network.country_code ? ` · ${network.country_code}` : ""} · 24/7
                  </p>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full shrink-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            )
          }
          return (
            <Card
              key={network.id}
              className={cn(
                "cursor-pointer transition-all duration-200 border bg-white dark:bg-card hover:shadow-md active:scale-[0.98] rounded-xl flex flex-col items-center justify-center aspect-square shadow-sm",
                selected
                  ? isDeposit 
                    ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20" 
                    : "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-border/80 hover:border-slate-300 dark:hover:border-border"
              )}
              onClick={() => onSelect(network)}
            >
              <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center h-full w-full gap-2 sm:gap-3">
                <div className={cn("w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center")}>
                  <SafeImage 
                    src={network.image} 
                    alt={network.name} 
                    className="max-w-full max-h-full object-contain rounded-sm" 
                    fallbackText={network.public_name.charAt(0).toUpperCase()} 
                  />
                </div>
                <div className="text-center w-full px-1">
                  <h3 className="text-sm sm:text-[15px] font-medium text-slate-800 dark:text-slate-200 truncate">{network.public_name}</h3>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {networks.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 rounded-none">
          <CardContent className="py-12 sm:py-20 text-center">
            <p className="text-muted-foreground font-semibold text-sm sm:text-base">Aucun réseau disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
