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
}

export function PlatformStep({ selectedPlatform, onSelect, type }: PlatformStepProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-0.5 sm:space-y-1 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-bold text-foreground">Choisissez votre plateforme</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Sélectionnez l'application de jeu</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={cn(
              "cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.98] rounded-xl sm:rounded-lg overflow-hidden",
              selectedPlatform?.id === platform.id
                ? type === "deposit"
                  ? "bg-gold text-white border-gold ring-2 ring-gold/30 shadow-lg"
                  : "bg-turquoise text-white border-turquoise ring-2 ring-turquoise/30 shadow-lg"
                : "bg-card hover:border-primary/20 border-border/80"
            )}
            onClick={() => onSelect(platform)}
          >
            <CardContent className="p-2.5 sm:p-4 flex flex-col items-center gap-2 sm:gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-14 sm:h-14 rounded-lg overflow-hidden p-0.5 sm:p-1 shrink-0",
                selectedPlatform?.id === platform.id ? "bg-white/20" : "bg-muted/50"
              )}>
                <SafeImage
                  src={platform.image}
                  alt={platform.name}
                  className="w-full h-full object-cover rounded-md"
                  fallbackText={platform.name.charAt(0).toUpperCase()}
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <h3 className="text-sm sm:text-base font-bold truncate px-0.5">{platform.name}</h3>
                <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-semibold text-[10px] sm:text-xs px-1.5 py-0",
                      selectedPlatform?.id === platform.id
                        ? "bg-white/20 text-white"
                        : "bg-gold/10 text-gold"
                    )}
                  >
                    Instantané
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold text-[10px] sm:text-xs border px-1.5 py-0",
                      selectedPlatform?.id === platform.id ? "border-white/30 text-white" : "border-muted"
                    )}
                  >
                    Min {platform.minimun_deposit >= 1000 ? `${platform.minimun_deposit / 1000}k` : platform.minimun_deposit}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {platforms.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 rounded-xl sm:rounded-lg">
          <CardContent className="py-12 sm:py-20 text-center">
            <p className="text-muted-foreground font-bold text-sm sm:text-base">Aucune plateforme disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
