"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ArrowUpFromLine, Loader2, ArrowRight, Smartphone, Ticket, MessageCircle } from "lucide-react"
import Link from "next/link"
import { transactionApi, advertisementApi } from "@/lib/api-client"
import type { Advertisement, Transaction } from "@/lib/types"
import { toast } from "react-hot-toast"
import { useSettings } from "@/lib/hooks/use-settings"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image"
import { TransactionCard } from "@/components/transaction/TransactionCard";
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

  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) fetchRecentTransactions()
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
      const [transactionsData, adsData] = await Promise.all([
        transactionApi.getHistory({ page: 1, page_size: 5 }),
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
    <div className="space-y-5 overflow-x-hidden pb-28 md:pb-8">

      {/* ── Section avec arrière-plan coloré ── */}
      <div className="bg-gradient-to-b from-orange-200 via-amber-100 to-white dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-950 pb-8 -mx-6 sm:-mx-8 md:-mx-4 lg:mx-0 px-6 sm:px-8 md:px-4 lg:px-0 rounded-b-3xl">
        <div className="mx-auto max-w-6xl">
        {/* ── Bannière publicitaire ── */}
        {isLoadingAd ? (
          <div className="w-full aspect-[2/1] sm:aspect-[21/6] rounded-2xl bg-muted/40 animate-pulse flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : advertisements.length > 0 && advertisements.find((ad) => ad.enable) ? (
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {advertisements.map((ad, index) =>
                  ad.enable ? (
                    <CarouselItem key={index}>
                      <div
                        className="relative w-full aspect-[2/1] sm:aspect-[21/6] rounded-2xl overflow-hidden bg-muted/10 cursor-zoom-in group"
                        onClick={() => { setSelectedAdIndex(index); setIsModalOpen(true) }}
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
        ) : null}

        {/* ── Actions principales : Dépôt / Retrait ── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto mt-6">
          {/* Dépôt */}
          <Link href="/dashboard/deposit/v2" className="group">
            <div className="flex items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:from-amber-500/30 dark:via-amber-400/20 dark:to-orange-500/30 rounded-2xl border border-amber-200 dark:border-amber-400/40 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-400 dark:to-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                <ArrowDownToLine className="w-6 h-6 text-amber-700 dark:text-amber-900" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-100 leading-tight">Dépôt</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5 leading-tight">Dépôt</p>
              </div>
            </div>
          </Link>

          {/* Retrait */}
          <Link href="/dashboard/withdrawal/v2" className="group">
            <div className="flex items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-500/30 dark:via-emerald-400/20 dark:to-teal-500/30 rounded-2xl border border-emerald-200 dark:border-emerald-400/40 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-400 dark:to-teal-400 flex items-center justify-center shrink-0 shadow-sm">
                <ArrowUpFromLine className="w-6 h-6 text-emerald-700 dark:text-emerald-900" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100 leading-tight">Retrait</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 leading-tight">Retrait</p>
              </div>
            </div>
          </Link>
        </div>
        </div>
      </div>


      {/* ── Transactions récentes ── */}
      <div className="space-y-3 px-6 sm:px-8 md:px-0">
        <div className="bg-white dark:bg-white/5 rounded-t-3xl pt-8 -mt-8 shadow-lg">
          <div className="px-6 sm:px-8 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Transactions récentes</h2>
              <Link
                href="/dashboard/history/v2"
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#DCB452] dark:text-gold hover:opacity-80 transition-opacity"
              >
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingTransactions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[68px] rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-12 px-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <ArrowDownToLine className="w-6 h-6 text-slate-300 dark:text-white/20" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1A1A1A] dark:text-white">Aucune transaction</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vos opérations apparaîtront ici après votre premier dépôt.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                {recentTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox publicités ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/95 backdrop-blur-md z-[100]" />
          <DialogContent
            className="max-w-full max-h-screen w-full h-[100dvh] bg-transparent border-none p-0 shadow-none z-[101] flex flex-col items-center justify-center outline-none"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Aperçu Publicité</DialogTitle>
            <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center">
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
                  opts={{ loop: true, startIndex: selectedAdIndex }}
                >
                  <CarouselPrevious className="static translate-y-0 opacity-60 hover:opacity-100 bg-white/10 border-white/20 text-white size-10 sm:size-14 shrink-0 pointer-events-auto" />
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
                  <CarouselNext className="static translate-y-0 opacity-60 hover:opacity-100 bg-white/10 border-white/20 text-white size-10 sm:size-14 shrink-0 pointer-events-auto" />
                </Carousel>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* ── Bouton d'action flottant (FAB) ── */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 md:bottom-8 md:right-8"
        onClick={() => {
          // Action pour le support/chat
          window.open('mailto:support@supercash.com', '_blank')
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

    </div>
  )
}
