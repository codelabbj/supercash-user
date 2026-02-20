"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/ui/safe-image"
import { Loader2 } from "lucide-react"
import { platformApi } from "@/lib/api-client"
import type { Platform } from "@/lib/types"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface PlatformStepProps {
  selectedPlatform: Platform | null
  onSelect: (platform: Platform) => void
  onNext: () => void
  type: "deposit" | "withdrawal"
  /** Affichage en liste verticale (au lieu de grille) */
  listLayout?: boolean
}

export function PlatformStep({ selectedPlatform, onSelect, type, listLayout }: PlatformStepProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await platformApi.getAll()
        // Filter only enabled platforms
        const enabledPlatforms = data.filter(platform => platform.enable)
        setPlatforms(enabledPlatforms)
      } catch (error) {
        toast.error("Erreur lors du chargement des plateformes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const isDeposit = type === "deposit"

  return (
    <div className={cn(listLayout ? "space-y-2" : "space-y-4 sm:space-y-6")}>
      <div className={cn(
        "text-center space-y-0.5 mb-3",
        listLayout && "mb-2"
      )}>
        <h2 className={cn(
          "font-bold text-foreground",
          listLayout ? "text-base sm:text-lg" : "text-base sm:text-xl"
        )}>Choisissez votre plateforme</h2>
        {!listLayout && (
          <p className="text-xs sm:text-sm text-muted-foreground">Sélectionnez l'application de jeu</p>
        )}
      </div>

      <div className={cn(listLayout ? "flex flex-col gap-2.5" : "grid grid-cols-2 gap-2 sm:gap-4")}>
        {platforms.map((platform) => {
          const selected = selectedPlatform?.id === platform.id
          if (listLayout) {
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onSelect(platform)}
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
                    src={platform.image}
                    alt={platform.name}
                    className="w-full h-full object-cover"
                    fallbackText={platform.name.charAt(0).toUpperCase()}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-foreground">{platform.name}</p>
                  <p className="text-[10px] truncate text-muted-foreground">
                    Min {platform.minimun_deposit >= 1000 ? `${platform.minimun_deposit / 1000}k` : platform.minimun_deposit} · Instantané
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
              key={platform.id}
              className={cn(
                "cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.98] rounded-none overflow-hidden",
                selected
                  ? isDeposit
                    ? "bg-gold text-white border-gold ring-2 ring-gold/30 shadow-lg"
                    : "bg-turquoise text-white border-turquoise ring-2 ring-turquoise/30 shadow-lg"
                  : "bg-card hover:border-primary/20 border-border/80"
              )}
              onClick={() => onSelect(platform)}
            >
              <CardContent className="p-2.5 sm:p-4 flex flex-col items-center gap-2 sm:gap-3">
                <div className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 rounded-none overflow-hidden p-0.5 sm:p-1 shrink-0",
                  selected ? "bg-white/20" : "bg-muted/50"
                )}>
                  <SafeImage
                    src={platform.image}
                    alt={platform.name}
                    className="w-full h-full object-cover rounded-none"
                    fallbackText={platform.name.charAt(0).toUpperCase()}
                  />
                </div>
                <div className="text-center min-w-0 w-full">
                  <h3 className="text-sm sm:text-base font-bold truncate px-0.5">{platform.name}</h3>
                  <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                    <Badge variant="secondary" className={cn("font-semibold text-[10px] px-1.5 py-0", selected ? "bg-white/20 text-white" : "bg-gold/10 text-gold")}>Instantané</Badge>
                    <Badge variant="outline" className={cn("font-bold text-[10px] border px-1.5 py-0", selected ? "border-white/30 text-white" : "border-muted")}>Min {platform.minimun_deposit >= 1000 ? `${platform.minimun_deposit / 1000}k` : platform.minimun_deposit}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {platforms.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 rounded-none">
          <CardContent className="py-12 sm:py-20 text-center">
            <p className="text-muted-foreground font-bold text-sm sm:text-base">Aucune plateforme disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
