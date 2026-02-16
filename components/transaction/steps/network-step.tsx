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
}
import { cn } from "@/lib/utils"

export function NetworkStep({ selectedNetwork, onSelect, type }: NetworkStepProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-0.5 sm:space-y-1 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-bold text-foreground">Choisissez votre réseau</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Moyen de paiement</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {networks.map((network) => (
          <Card
            key={network.id}
            className={cn(
              "cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.98] rounded-xl sm:rounded-lg overflow-hidden",
              selectedNetwork?.id === network.id
                ? type === "deposit"
                  ? "bg-gold text-white border-gold ring-2 ring-gold/30 shadow-lg"
                  : "bg-turquoise text-white border-turquoise ring-2 ring-turquoise/30 shadow-lg"
                : "bg-card hover:border-primary/20 border-border/80"
            )}
            onClick={() => onSelect(network)}
          >
            <CardContent className="p-2.5 sm:p-4 flex flex-col items-center gap-2 sm:gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-14 sm:h-14 rounded-lg overflow-hidden p-0.5 sm:p-1 shrink-0",
                selectedNetwork?.id === network.id ? "bg-white/20" : "bg-muted/50"
              )}>
                <SafeImage
                  src={network.image}
                  alt={network.name}
                  className="w-full h-full object-cover rounded-md"
                  fallbackText={network.public_name.charAt(0).toUpperCase()}
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <h3 className="text-sm sm:text-base font-bold truncate">{network.public_name}</h3>
                <p className={cn(
                  "text-[10px] sm:text-xs font-medium opacity-70 truncate",
                  selectedNetwork?.id === network.id ? "text-white" : "text-muted-foreground"
                )}>
                  {network.name}
                </p>
                <div className="flex justify-center gap-1 mt-0.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-semibold text-[10px] sm:text-xs px-1.5 py-0",
                      selectedNetwork?.id === network.id
                        ? "bg-white/20 text-white"
                        : "bg-gold/10 text-gold"
                    )}
                  >
                    24/7
                  </Badge>
                  {network.country_code && (
                    <Badge variant="outline" className="font-semibold text-[10px] sm:text-xs px-1.5 py-0">
                      {network.country_code}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {networks.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 rounded-xl sm:rounded-lg">
          <CardContent className="py-12 sm:py-20 text-center">
            <p className="text-muted-foreground font-semibold text-sm sm:text-base">Aucun réseau disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
