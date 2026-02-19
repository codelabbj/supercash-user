"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import Image from "next/image"
import { transactionApi, advertisementApi } from "@/lib/api-client"
import type { Advertisement, Transaction } from "@/lib/types"
import { toast } from "react-hot-toast"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { TransactionCard } from "@/components/transaction/TransactionCard"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  Loader2,
  X,
  Wallet,
} from "lucide-react"

export default function DashboardV2Page() {
  const { user } = useAuth()
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoadingAd, setIsLoadingAd] = useState(true)
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdIndex, setSelectedAdIndex] = useState(0)
  const [modalApi, setModalApi] = useState<CarouselApi>()
  const [heroCarouselApi, setHeroCarouselApi] = useState<CarouselApi | null>(null)
  const [heroAdIndex, setHeroAdIndex] = useState(0)

  const enabledAds = advertisements.filter((ad) => ad.enable)

  useEffect(() => {
    if (isModalOpen && modalApi) modalApi.scrollTo(selectedAdIndex, true)
  }, [isModalOpen, modalApi, selectedAdIndex])

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user?.id])

  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) fetchRecentTransactions()
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [user?.id])

  // Défilement auto des pubs (carousel) toutes les 5 s
  useEffect(() => {
    if (enabledAds.length <= 1 || !heroCarouselApi) return
    const t = setInterval(() => {
      if (!isCarouselHovered) heroCarouselApi.scrollNext()
    }, 5000)
    return () => clearInterval(t)
  }, [isCarouselHovered, heroCarouselApi, enabledAds.length])

  const fetchData = async () => {
    try {
      setIsLoadingTransactions(true)
      setIsLoadingAd(true)
      const [transactionsData, adsData] = await Promise.all([
        transactionApi.getHistory({ page: 1, page_size: 5 }),
        advertisementApi.get(),
      ])
      setRecentTransactions(transactionsData.results)
      setAdvertisements(adsData.results)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setIsLoadingTransactions(false)
      setIsLoadingAd(false)
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      setIsLoadingTransactions(true)
      const data = await transactionApi.getHistory({ page: 1, page_size: 5 })
      setRecentTransactions(data.results)
    } catch (error) {
      console.error("Error fetching recent transactions:", error)
      toast.error("Erreur lors du chargement des transactions récentes")
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  return (
    <div className="-mt-4 sm:-mt-8 min-h-screen pb-20 md:pb-2">
      {/* ── Hero : Bonjour + pub en arrière-plan (collé à l'app bar) ── */}
      <section
        className="relative min-h-[260px] sm:min-h-[300px] overflow-hidden border-b border-border/60"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
      >
        {/* Background : images pub (carousel) ou fallback */}
        {isLoadingAd ? (
          <div className="absolute inset-0 bg-muted/40 animate-pulse" />
        ) : enabledAds.length > 0 ? (
          <Carousel
            opts={{ loop: true, align: "start" }}
            className="absolute inset-0 w-full h-full"
            setApi={(api) => {
              setHeroCarouselApi(api ?? null)
              api?.on("select", () => setHeroAdIndex(api.selectedScrollSnap()))
            }}
          >
            <CarouselContent className="h-full">
              {advertisements.map(
                (ad, index) =>
                  ad.enable && (
                    <CarouselItem key={ad.id ?? index} className="h-full">
                      <div className="relative h-full w-full">
                        <Image
                          src={ad.image}
                          alt=""
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="100vw"
                        />
                      </div>
                    </CarouselItem>
                  )
              )}
            </CarouselContent>
            {enabledAds.length > 1 && (
              <>
                <CarouselPrevious className="left-2 sm:left-4 border-white/30 bg-black/30 text-white hover:bg-black/50 hover:text-white" />
                <CarouselNext id="carousel-next-v2" className="right-2 sm:right-4 border-white/30 bg-black/30 text-white hover:bg-black/50 hover:text-white" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="absolute inset-0">
            <Image
              src="/default-ad.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Overlay pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

        {/* Contenu : Bonjour + titre */}
        <button
          type="button"
          className="relative z-10 flex w-full flex-col items-start px-4 sm:px-6 py-6 sm:py-8 text-left min-h-[260px] sm:min-h-[300px] justify-end focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 rounded-b-2xl"
          onClick={() => {
            if (enabledAds.length > 0) {
              setSelectedAdIndex(heroAdIndex)
              setIsModalOpen(true)
            }
          }}
        >
          <p className="text-sm font-medium text-white/90">
            Bonjour{user?.first_name ? `, ${user.first_name}` : ""}
          </p>
          <p className="mt-0.5 text-xs sm:text-sm text-white/80">
            Gérez vos dépôts et retraits en un clic.
          </p>
          {enabledAds.length > 0 && (
            <span className="mt-2 text-[10px] sm:text-xs text-white/60">Touchez pour voir la pub</span>
          )}
        </button>
      </section>

      {/* ── Actions principales ── */}
      <section className="px-4 sm:px-6 pt-4 sm:pt-5">
        <h2 className="sr-only">Actions principales</h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Link
            href="/dashboard/deposit/v2"
            className="group flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 dark:bg-gold/10 p-3 sm:p-3.5 transition-all duration-200 hover:border-gold/40 hover:bg-gold/10 dark:hover:bg-gold/15 active:scale-[0.99]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold dark:bg-gold/30">
              <ArrowDownToLine className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">Dépôt</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Approvisionner</p>
            </div>
          </Link>
          <Link
            href="/dashboard/withdrawal/v2"
            className="group flex items-center gap-3 rounded-xl border border-turquoise/20 bg-turquoise/5 dark:bg-turquoise/10 p-3 sm:p-3.5 transition-all duration-200 hover:border-turquoise/40 hover:bg-turquoise/10 dark:hover:bg-turquoise/15 active:scale-[0.99]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-turquoise/20 text-turquoise dark:bg-turquoise/30">
              <ArrowUpFromLine className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">Retrait</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Retirer mes gains</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Activité récente ── */}
      <section className="px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Activité récente</h2>
          <Link
            href="/dashboard/history/v2"
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
          >
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {isLoadingTransactions ? (
            <div className="divide-y divide-border/60">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 sm:h-18 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                <Wallet className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 font-semibold text-sm text-foreground">Aucune transaction</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Vos dépôts et retraits apparaîtront ici.
              </p>
              <Link
                href="/dashboard/deposit/v2"
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Effectuer un dépôt
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recentTransactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions?id=${transaction.id}&returnTo=/dashboard/v2`}
                  className="block"
                >
                  <TransactionCard transaction={transaction} compact />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox publicités ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm z-[100]" />
          <DialogContent
            className="max-w-full max-h-screen w-full h-[100dvh] bg-transparent border-none p-0 shadow-none z-[101] flex flex-col items-center justify-center outline-none"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Aperçu publicité</DialogTitle>
            <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="fixed top-6 right-6 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-full h-full flex items-center justify-center px-4 sm:px-8">
                <Carousel
                  setApi={setModalApi}
                  className="w-full max-w-4xl"
                  opts={{ loop: true, startIndex: Math.min(selectedAdIndex, enabledAds.length - 1) }}
                >
                  <CarouselPrevious className="left-2 sm:left-4 border-white/20 bg-white/10 text-white hover:bg-white/20" />
                  <CarouselContent className="items-center">
                    {advertisements.map(
                      (ad, index) =>
                      ad.enable && (
                        <CarouselItem key={ad.id ?? index} className="flex justify-center">
                          <img
                            src={ad.image}
                            alt={`Publicité ${index + 1}`}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                          />
                        </CarouselItem>
                      )
                    )}
                  </CarouselContent>
                  <CarouselNext className="right-2 sm:right-4 border-white/20 bg-white/10 text-white hover:bg-white/20" />
                </Carousel>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
