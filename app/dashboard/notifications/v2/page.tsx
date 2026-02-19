"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, RefreshCw, Loader2, ArrowLeft, MessageSquare } from "lucide-react"
import { notificationApi } from "@/lib/api-client"
import { Notification } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "react-hot-toast"
import { fcmService } from "@/lib/firebase"
import type { MessagePayload } from "firebase/messaging"

interface FCMNotification {
  id: string
  title: string
  content: string
  created_at: string
  is_read: boolean
  is_fcm: true
  payload?: MessagePayload
}

type CombinedNotification = Notification | FCMNotification

export default function NotificationsV2Page() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fcmNotifications, setFcmNotifications] = useState<FCMNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setIsRefreshing(pageNum === 1)
      setIsLoading(pageNum === 1)
      const response = await notificationApi.getAll(pageNum)
      setNotifications(response.results)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)
      setPage(pageNum)
    } catch {
      toast.error("Erreur lors du chargement des notifications")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handleFocus = () => fetchNotifications(page)
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [page])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("fcm_notifications")
    if (stored) {
      try {
        setFcmNotifications(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleFCMMessage = (payload: MessagePayload) => {
      const fcmNotification: FCMNotification = {
        id: `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        title: payload.notification?.title || "Nouvelle notification",
        content: payload.notification?.body || (payload.data?.body as string) || "Vous avez une nouvelle notification",
        created_at: new Date().toISOString(),
        is_read: false,
        is_fcm: true,
        payload,
      }
      setFcmNotifications((prev) => {
        const updated = [fcmNotification, ...prev]
        localStorage.setItem("fcm_notifications", JSON.stringify(updated))
        return updated
      })
      try {
        if ("Notification" in window && window.Notification?.permission === "granted") {
          const n = new window.Notification(fcmNotification.title, {
            body: fcmNotification.content,
            icon: "/placeholder-logo.png",
            badge: "/placeholder-logo.png",
            tag: fcmNotification.id,
            requireInteraction: false,
          })
          n.onclick = () => {
            window.focus()
            if (payload.data?.url) window.open(payload.data.url as string, "_blank")
            n.close()
          }
        }
      } catch {
        // ignore
      }
    }

    fcmService.setupForegroundListener(handleFCMMessage)
    if ("serviceWorker" in navigator) {
      const handler = (e: MessageEvent) => {
        if (e.data?.firebaseMessaging) handleFCMMessage(e.data.firebaseMessaging)
      }
      navigator.serviceWorker.addEventListener("message", handler)
      return () => navigator.serviceWorker.removeEventListener("message", handler)
    }
  }, [])

  const markAsRead = async (notificationId: number | string) => {
    if (typeof notificationId === "string" && notificationId.startsWith("fcm-")) {
      setFcmNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      const updated = fcmNotifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
      localStorage.setItem("fcm_notifications", JSON.stringify(updated))
      toast.success("Marqué comme lu")
      return
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
    toast.success("Marqué comme lu")
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: fr })
    } catch {
      return dateString
    }
  }

  const allNotifications: CombinedNotification[] = [
    ...fcmNotifications,
    ...notifications,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const unreadCount = allNotifications.filter((n) => !n.is_read).length

  return (
    <div className="-mt-4 sm:-mt-8 min-h-screen pb-20 md:pb-2">
      {/* En-tête */}
      <section className="border-b border-border/60 bg-card/50 px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard/v2"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
              Notifications
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Vos notifications
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                {unreadCount} non lues
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchNotifications(1)}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="border border-border/60 bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border/60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-semibold text-sm text-foreground">
                Aucune notification
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                Vos notifications s&apos;afficheront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {allNotifications.map((notification) => {
                const isFCM = "is_fcm" in notification && notification.is_fcm
                return (
                  <div
                    key={notification.id}
                    className={`px-3 sm:px-4 py-3 sm:py-4 transition-colors ${
                      !notification.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    } ${isFCM ? "border-l-blue-500/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isFCM && (
                            <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <h3 className="font-semibold text-sm text-foreground leading-tight">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {isFCM && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Push
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(notification.created_at)}
                          {"reference" in notification &&
                            notification.reference &&
                            ` · Ref. ${notification.reference}`}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="shrink-0 h-8 text-xs rounded-lg"
                        >
                          <Check className="h-3.5 w-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Lu</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {(hasNext || hasPrevious) && !isLoading && allNotifications.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-border/60 bg-muted/20">
              <p className="text-[10px] text-muted-foreground">Page {page}</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchNotifications(page - 1)}
                  disabled={!hasPrevious}
                  className="h-7 min-w-[60px] rounded-lg border border-border/60 bg-background px-2 text-[10px] font-medium text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Préc.
                </button>
                <button
                  type="button"
                  onClick={() => fetchNotifications(page + 1)}
                  disabled={!hasNext}
                  className="h-7 min-w-[60px] rounded-lg border border-border/60 bg-background px-2 text-[10px] font-medium text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Suiv.
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
