"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Loader2, ArrowRight, RefreshCw, Phone, Gift } from "lucide-react"
import Link from "next/link"
import { transactionApi, advertisementApi } from "@/lib/api-client"
import type { Advertisement, Transaction } from "@/lib/types"
import { toast } from "react-hot-toast"
import { useSettings } from "@/lib/hooks/use-settings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image"
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const { user } = useAuth()
  const { referralBonus } = useSettings()
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoadingAd, setIsLoadingAd] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false)


  useEffect(() => {
    if (user) {
      fetchRecentTransactions()
      fetchAdvertisements()
    }
  }, [user])

  // Refetch data when the page gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchRecentTransactions()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  useEffect(() => {
    const autoScrollCarousel = () => {
      if (!isCarouselHovered) {
        const next = document.getElementById("next")
        if (next) next.click()
      }
    }

    const intervalId = setInterval(autoScrollCarousel, 5000)
    return () => clearInterval(intervalId)
  }, [isCarouselHovered]);

  const fetchRecentTransactions = async () => {
    try {
      setIsLoadingTransactions(true)
      const data = await transactionApi.getHistory({
        page: 1,
        page_size: 5, // Get only the 5 most recent transactions
      })
      setRecentTransactions(data.results)
    } catch (error) {
      console.error("Error fetching recent transactions:", error)
      toast.error("Erreur lors du chargement des transactions récentes")
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const fetchAdvertisements = async () => {
    try {
      setIsLoadingAd(true)
      const data = await advertisementApi.get()
      setAdvertisements(data.results)
    } catch (error) {
      console.error("Error fetching advertisements:", error)
      toast.error("Erreur lors du chargement des publicités")
    } finally {
      setIsLoadingAd(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-0">
      {/* Welcome section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Bienvenue {user?.first_name}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Content de vous revoir</p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/deposit" className="group">
          <Card className="h-full border transition-all duration-300 hover:shadow-md active:scale-[0.99] bg-card rounded-lg overflow-hidden">
            <CardContent className="p-5 flex flex-col items-start gap-3 min-h-[160px]">
              <div className="p-2.5 rounded-lg bg-gold/5 text-gold border border-gold/10">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Dépôt</h3>
                <p className="text-sm text-muted-foreground">Rechargez rapidement votre compte</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/withdrawal" className="group">
          <Card className="h-full border transition-all duration-300 hover:shadow-md active:scale-[0.99] bg-card rounded-lg overflow-hidden">
            <CardContent className="p-5 flex flex-col items-start gap-3 min-h-[160px]">
              <div className="p-2.5 rounded-lg bg-turquoise/5 text-turquoise border border-turquoise/10">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Retrait</h3>
                <p className="text-sm text-muted-foreground">Retirez vos gains instantanément</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/phones" className="group">
          <Card className="h-full border transition-all duration-300 hover:shadow-md active:scale-[0.99] bg-card rounded-lg overflow-hidden">
            <CardContent className="p-5 flex flex-col items-start gap-3 min-h-[160px]">
              <div className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground border border-border">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Numéros & IDs</h3>
                <p className="text-sm text-muted-foreground">Gérez vos identifiants de jeux</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {referralBonus && (
          <Link href="/dashboard/bonus" className="group">
            <Card className="h-full border transition-all duration-300 hover:shadow-md active:scale-[0.99] bg-card rounded-lg overflow-hidden">
              <CardContent className="p-5 flex flex-col items-start gap-3 min-h-[160px]">
                <div className="p-2.5 rounded-lg bg-turquoise/5 text-turquoise border border-turquoise/10">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Bonus</h3>
                  <p className="text-sm text-muted-foreground">Consultez vos récompenses</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Ads Section */}
      {
        isLoadingAd ? (
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10">
            <CardContent className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex gap-2 items-center justifiy-center text-primary space-y-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm sm:text-base font-medium text-muted-foreground">
                  Chargement...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : advertisements.length > 0 && advertisements.find((ad) => ad.enable) ? (
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            <Carousel
              className="w-full"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {advertisements.map((ad, index) =>
                  ad.enable ? (
                    <CarouselItem key={index}>
                      <div className="relative w-full aspect-[21/9] sm:aspect-[21/6]">
                        <Image
                          src={ad.image}
                          alt={`Publicité ${index + 1}`}
                          fill
                          className="object-fit border-2 rounded-lg"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ) : (
                    <></>
                  )
                )}
              </CarouselContent>
              {advertisements.length > 1 && (
                <>
                  <CarouselPrevious id="previous" className="left-2 sm:left-4" />
                  <CarouselNext id="next" className="right-2 sm:right-4" />
                </>
              )}

            </Carousel>
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10">
            <CardContent className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center space-y-2">
                <p className="text-sm sm:text-base font-medium text-muted-foreground">
                  Espace publicitaire à venir
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Les publicités arriveront bientôt ici
                </p>
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Recent activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Transactions récentes</h2>
          <Button asChild variant="ghost" className="font-semibold hover:text-muted-foreground">
            <Link href="/dashboard/history" className="flex items-center gap-2">
              Voir tout <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {isLoadingTransactions ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-[var(--radius)] bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="p-6 rounded-full bg-muted/20 mb-6 drop-shadow-sm">
                <Wallet className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-muted-foreground mb-2">Aucune transaction</h3>
              <p className="text-sm text-muted-foreground/70 text-center max-w-xs">
                Vos activités apparaîtront ici dès que vous commencerez à utiliser Super Cash.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
