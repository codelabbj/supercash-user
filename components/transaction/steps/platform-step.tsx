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
    <div className="space-y-6">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Choisissez votre plateforme</h2>
        <p className="text-sm text-muted-foreground">Sélectionnez l'application de jeu pour votre dépôt</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={cn(
              "cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.99] group rounded-lg",
              selectedPlatform?.id === platform.id
                ? type === "deposit"
                  ? "bg-gold text-white border-gold"
                  : "bg-turquoise text-white border-turquoise"
                : "bg-card hover:border-primary/20"
            )}
            onClick={() => onSelect(platform)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-3">
              <div className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden p-1",
                selectedPlatform?.id === platform.id ? "bg-white/20" : "bg-muted/50"
              )}>
                <SafeImage
                  src={platform.image}
                  alt={platform.name}
                  className="w-full h-full object-cover rounded-[calc(var(--radius)-4px)]"
                  fallbackText={platform.name.charAt(0).toUpperCase()}
                />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold mb-1">{platform.name}</h3>
                <div className="flex flex-wrap justify-center gap-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-semibold text-xs",
                      selectedPlatform?.id === platform.id
                        ? "bg-white/20 text-white"
                        : "bg-gold/5 text-gold"
                    )}
                  >
                    Instantané
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold border-2",
                      selectedPlatform?.id === platform.id ? "border-white/30 text-white" : "border-muted"
                    )}
                  >
                    Min: {platform.minimun_deposit.toLocaleString()} FCFA
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {platforms.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground font-bold">Aucune plateforme disponible pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
