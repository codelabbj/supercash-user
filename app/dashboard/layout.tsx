"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Loader2, Bell, Ticket, Moon, Sun, LayoutDashboard, History, Smartphone } from "lucide-react"
import { MobileAppDownload } from "@/components/mobile-app-download"
import { FloatingSocialButton } from "@/components/floating-social-button"
import { Switch } from "@/components/ui/switch"
import Image from "next/image";
import { notificationApi } from "@/lib/api-client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationApi.getAll()
      const unread = data.results.filter(n => !n.is_read).length
      // Note: If paginated, this only counts the first page. 
      // Ideally the backend provides a dedicated unread count endpoint.
      // For now, setting it based on the first page results.
      setUnreadCount(unread)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userInitials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Top row with logo and user menu */}
          <div className="flex h-16 sm:h-20 items-center justify-between relative">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative w-11 h-11 group-hover:scale-105 transition-transform">
                  <Image
                    src={resolvedTheme === "dark" ? "/supercash-logo-mint.png" : "/supercash-logo-gold.png"}
                    fill
                    alt="SuperCash Logo"
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white uppercase hidden sm:block">Super Cash</span>
              </Link>
            </div>

            {/* Middle Navigation - Horizontal */}
            <nav className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-200/60 dark:border-white/10 gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${pathname === '/dashboard' ? 'bg-gold/10 text-gold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
              <Link
                href="/dashboard/history"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${pathname === '/dashboard/history' ? 'bg-gold/10 text-gold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <History className="w-4 h-4" />
                <span>Historique</span>
              </Link>

            </nav>

            {/* Right Side Tools */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="flex items-center gap-0 sm:gap-0.5">
                {/* Téléchargement app : masqué sur mobile */}
                <div className="hidden sm:block">
                  <MobileAppDownload variant="header" />
                </div>
                {/* Coupon icon */}
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-xl relative hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  asChild
                >
                  <Link href="/dashboard/coupon">
                    <Ticket className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </Link>
                </Button>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-xl relative hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  asChild
                >
                  <Link href="/dashboard/notifications">
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#0F0F0F] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all outline-none group border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white leading-tight">{user.first_name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">#{user.id?.toString().slice(-5) || "82739"}</span>
                    </div>
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-gold/20 group-hover:ring-gold/40 transition-all">
                      <AvatarFallback className="bg-gold text-white font-bold text-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Toggle thème */}
                  <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={handleThemeToggle}>
                    <div className="flex items-center gap-2">
                      {mounted && resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span className="text-sm font-medium">{mounted && resolvedTheme === "dark" ? "Mode sombre" : "Mode clair"}</span>
                    </div>
                    <Switch
                      checked={mounted ? resolvedTheme === "dark" : false}
                      onCheckedChange={handleThemeToggle}
                      onClick={(e) => e.stopPropagation()}
                      className="scale-90"
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/phones">
                      <Smartphone className="mr-2 h-4 w-4" />
                      <span>Numéros</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm px-4 py-3 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex items-center justify-around gap-2 scale-hover transition-all">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/dashboard' ? 'text-gold bg-gold/5 px-4' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Accueil</span>
        </Link>
        <Link
          href="/dashboard/history"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/dashboard/history' ? 'text-gold bg-gold/5 px-4' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Historique</span>
        </Link>

      </nav>
      {/* Main content */}
      <main className="flex-1 px-0 py-4 sm:py-8 relative z-20">{children}</main>

      <footer className="w-full bg-background relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center border-t border-slate-200/60 dark:border-white/5 pt-8">
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              © 2024 Super Cash Fintech — West African Operations
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Social Button */}
      <FloatingSocialButton />
    </div>
  )
}
