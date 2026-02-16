"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Loader2, ArrowRight, RefreshCw, Phone, Gift, Ticket, Banknote, Smartphone, BookOpen, Search, Plus } from "lucide-react"
import Link from "next/link"
import { transactionApi, advertisementApi } from "@/lib/api-client"
import type { Advertisement, Transaction } from "@/lib/types"
import { toast } from "react-hot-toast"
import { useSettings } from "@/lib/hooks/use-settings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image"
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth()
  const { referralBonus } = useSettings()
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoadingAd, setIsLoadingAd] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdIndex, setSelectedAdIndex] = useState(0)
  const [modalApi, setModalApi] = useState<CarouselApi>()

  // Effect to synchronize modal carousel with selected index
  useEffect(() => {
    if (isModalOpen && modalApi) {
      modalApi.scrollTo(selectedAdIndex, true)
    }
  }, [isModalOpen, modalApi, selectedAdIndex])



  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  // Refetch data when the page gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        fetchRecentTransactions()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id])

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

  const fetchData = async () => {
    try {
      setIsLoadingTransactions(true)
      setIsLoadingAd(true)

      // Parallel API calls for better performance
      const [transactionsData, adsData] = await Promise.all([
        transactionApi.getHistory({
          page: 1,
          page_size: 5, // Get only the 5 most recent transactions
        }),
        advertisementApi.get()
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
      const data = await transactionApi.getHistory({
        page: 1,
        page_size: 5,
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
    <div className="space-y-8 sm:space-y-12 px-2 sm:px-0 overflow-x-hidden pb-24 md:pb-0">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-[#1A1A1A] dark:text-white leading-tight">
          Bienvenue, {user?.first_name} !
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">Que souhaitez-vous faire aujourd'hui ?</p>
      </div>

      {/* Quick actions grid */}
      <>
        {/* Mobile View: Single Card with 4 buttons */}
        <Card className="block sm:hidden border-0 shadow-sm bg-white dark:bg-white/5 rounded-2xl overflow-hidden p-4">
          <div className="grid grid-cols-4 gap-2">
            <Link href="/dashboard/deposit" className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#FFF9EB] dark:bg-gold/10 flex items-center justify-center text-[#DCB452] dark:text-gold shrink-0">
                <div className="w-7 h-7 rounded-full border-2 border-[#DCB452] dark:border-gold flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
              <h3 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white text-center leading-tight">Dépôt</h3>
            </Link>

            <Link href="/dashboard/withdrawal" className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#E6FFF5] dark:bg-[#39D196]/10 flex items-center justify-center text-[#39D196] shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white text-center leading-tight">Retrait</h3>
            </Link>

            <Link href="/dashboard/phones" className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#EBF2FF] dark:bg-[#4B89FF]/10 flex items-center justify-center text-[#4B89FF] shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white text-center leading-tight">Numéros</h3>
            </Link>

            <Link href="/dashboard/coupon" className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#FFF1F1] dark:bg-[#FF5B5B]/10 flex items-center justify-center text-[#FF5B5B] shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white text-center leading-tight">Coupons</h3>
            </Link>
          </div>
        </Card>

        {/* Desktop View: Separate Cards */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/deposit" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden p-8">
              <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF9EB] dark:bg-gold/10 flex items-center justify-center text-[#DCB452] dark:text-gold">
                  <div className="w-8 h-8 rounded-full border-2 border-[#DCB452] dark:border-gold flex items-center justify-center">
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Dépôt</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Approvisionnez votre compte instantanément.</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/withdrawal" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden p-8">
              <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#E6FFF5] dark:bg-[#39D196]/10 flex items-center justify-center text-[#39D196]">
                  <Banknote className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Retrait</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Récupérez vos gains en un clic.</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/phones" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden p-8">
              <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#EBF2FF] dark:bg-[#4B89FF]/10 flex items-center justify-center text-[#4B89FF]">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Numéros</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Gérez vos identifiants de jeu.</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/coupon" className="group">
            <Card className="h-full border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden p-8">
              <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF1F1] dark:bg-[#FF5B5B]/10 flex items-center justify-center text-[#FF5B5B]">
                  <Ticket className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Coupons</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Utilisez vos codes promos et bonus.</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </>

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
                      <div
                        className="relative w-full aspect-[2/1] sm:aspect-[21/6] border-2 rounded-2xl overflow-hidden bg-muted/5 cursor-zoom-in group"
                        onClick={() => {
                          setSelectedAdIndex(index)
                          setIsModalOpen(true)
                        }}
                      >
                        <Image
                          src={ad.image}
                          alt={`Publicité ${index + 1}`}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      </div>
                    </CarouselItem>
                  ) : null
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Transactions récentes</h2>
          <Button asChild variant="ghost" className="font-semibold hover:text-muted-foreground transition-colors">
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
          <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] bg-white dark:bg-white/5 p-12 sm:p-20">
            <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Wallet className="h-10 w-10 text-slate-300 dark:text-white/20" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                  <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Aucune transaction récente</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Vos opérations s'afficheront ici dès que vous aurez effectué votre premier dépôt ou retrait.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>

      {/* Ad Lightbox Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/95 backdrop-blur-md z-[100]" />
          <DialogContent
            className="max-w-full max-h-screen w-full h-[100dvh] bg-transparent border-none p-0 shadow-none z-[101] flex flex-col items-center justify-center outline-none"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Aperçu Publicité</DialogTitle>

            <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center">
              {/* Close Button - Always at top right */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[120] backdrop-blur-sm border border-white/20 shadow-2xl active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="w-full h-full flex items-center justify-center">
                <Carousel
                  setApi={setModalApi}
                  className="w-full flex items-center justify-center gap-1 sm:gap-8 px-2 sm:px-12"
                  opts={{
                    loop: true,
                    startIndex: selectedAdIndex
                  }}
                >
                  <CarouselPrevious
                    className="static translate-y-0 opacity-60 hover:opacity-100 bg-white/10 border-white/20 text-white size-10 sm:size-14 shrink-0 pointer-events-auto"
                  />

                  <div className="flex-1 max-w-5xl h-full flex items-center justify-center">
                    <CarouselContent className="h-full items-center">
                      {advertisements.map((ad, index) =>
                        ad.enable ? (
                          <CarouselItem key={ad.id || index} className="h-full flex items-center justify-center p-2">
                            <img
                              src={ad.image}
                              alt={`Publicité ${index + 1}`}
                              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg pointer-events-none select-none"
                            />
                          </CarouselItem>
                        ) : null
                      )}
                    </CarouselContent>
                  </div>

                  <CarouselNext
                    className="static translate-y-0 opacity-60 hover:opacity-100 bg-white/10 border-white/20 text-white size-10 sm:size-14 shrink-0 pointer-events-auto"
                  />
                </Carousel>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
