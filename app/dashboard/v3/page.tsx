"use client"

import { useState, useEffect } from "react"
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
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react"

export default function DashboardV3Page() {
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
  
  // Debug: voir ce que contiennent les ads
  console.log('Advertisements:', advertisements)
  console.log('Enabled ads:', enabledAds)

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

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Bonjour"
    if (h < 18) return "Bon après-midi"
    return "Bonsoir"
  })()

  return (
    <div className="-mt-4 sm:-mt-8 min-h-screen pb-24 md:pb-4">

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
      >
        {/* Background carousel / fallback */}
        <div className="relative h-[220px] sm:h-[260px]">
          {isLoadingAd ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-background to-turquoise/10 animate-pulse" />
          ) : enabledAds.length > 0 ? (
            <Carousel
              opts={{ loop: true, align: "start" }}
              className="absolute inset-0 w-full h-full"
              setApi={(api) => {
                setHeroCarouselApi(api ?? null)
                api?.on("select", () => setHeroAdIndex(api.selectedScrollSnap()))
              }}
            >
              <CarouselContent className="h-full" style={{ height: '100%' }}>
                {advertisements.map(
                  (ad, index) =>
                    ad.enable && (
                      <CarouselItem key={ad.id ?? index} className="h-full" style={{ height: '260px' }}>
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
            </Carousel>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-background to-turquoise/20" />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

          {/* Dots indicator */}
          {enabledAds.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {enabledAds.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => heroCarouselApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === heroAdIndex ? "w-6 bg-gold" : "w-1.5 bg-foreground/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Greeting card overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 sm:px-6 pb-4">
            <button
              type="button"
              className="w-full text-left focus:outline-none"
              onClick={() => {
                if (enabledAds.length > 0) {
                  setSelectedAdIndex(heroAdIndex)
                  setIsModalOpen(true)
                }
              }}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    {greeting}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
                    {user?.first_name || "—"}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-xs font-semibold text-gold">Premium</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Quick Actions ─── */}
      <section className="px-5 sm:px-6 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/deposit/v2"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 dark:from-gold/15 dark:to-gold/5 border border-gold/15 p-4 sm:p-5 transition-all duration-300 hover:shadow-gold hover:border-gold/30 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/20 dark:bg-gold/25 mb-3 group-hover:scale-110 transition-transform duration-300">
                <ArrowDownToLine className="h-5 w-5 text-gold" />
              </div>
              <p className="font-bold text-[15px] text-foreground">Dépôt</p>
              <p className="text-xs text-muted-foreground mt-0.5">Approvisionner</p>
            </div>
          </Link>

          <Link
            href="/dashboard/withdrawal/v2"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-turquoise/10 to-turquoise/5 dark:from-turquoise/15 dark:to-turquoise/5 border border-turquoise/15 p-4 sm:p-5 transition-all duration-300 hover:shadow-turquoise hover:border-turquoise/30 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-turquoise/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-turquoise/20 dark:bg-turquoise/25 mb-3 group-hover:scale-110 transition-transform duration-300">
                <ArrowUpFromLine className="h-5 w-5 text-turquoise" />
              </div>
              <p className="font-bold text-[15px] text-foreground">Retrait</p>
              <p className="text-xs text-muted-foreground mt-0.5">Retirer mes gains</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Stats Row ─── */}
      <section className="px-5 sm:px-6 pt-5">
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-turquoise/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-turquoise" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Transactions</span>
            </div>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {isLoadingTransactions ? "—" : recentTransactions.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">récentes</p>
          </div>

          <div className="flex-1 rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-gold/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-gold" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">En attente</span>
            </div>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {isLoadingTransactions
                ? "—"
                : recentTransactions.filter(
                    (t) => t.status === "pending" || t.status === "init_payment"
                  ).length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">à traiter</p>
          </div>
        </div>
      </section>

      {/* ─── Recent Activity ─── */}
      <section className="px-5 sm:px-6 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">Activité récente</h2>
          <Link
            href="/dashboard/history/v2"
            className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold/80 transition-colors"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {isLoadingTransactions ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <div className="h-11 w-11 rounded-full bg-muted/60 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-24 bg-muted/60 rounded-md animate-pulse" />
                    <div className="h-2.5 w-36 bg-muted/40 rounded-md animate-pulse" />
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div className="h-3.5 w-20 bg-muted/60 rounded-md animate-pulse" />
                    <div className="h-4 w-14 bg-muted/40 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-turquoise/15 border border-border/60">
                  <Wallet className="h-7 w-7 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-5 font-bold text-sm text-foreground">Pas encore de transactions</p>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                Effectuez votre premier dépôt pour commencer.
              </p>
              <Link
                href="/dashboard/deposit/v2"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-white text-sm font-semibold hover:bg-gold/90 transition-colors active:scale-[0.98]"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Effectuer un dépôt
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentTransactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions?id=${transaction.id}&returnTo=/dashboard/v3`}
                  className="block"
                >
                  <TransactionCard transaction={transaction} compact />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Ad Lightbox ─── */}
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
                              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
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
