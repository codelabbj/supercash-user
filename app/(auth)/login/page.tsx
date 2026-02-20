"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { setupNotifications } from "@/lib/fcm-helper"
import Image from "next/image"
import { useTheme } from "next-themes"
import { normalizePhoneNumber } from "@/lib/utils"
import { MobileAppDownload } from "@/components/mobile-app-download"

const loginSchema = z.object({
  email_or_phone: z.string().min(1, "Email ou téléphone requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Step 1: Authenticate user
      const emailOrPhone = data.email_or_phone.includes('@')
        ? data.email_or_phone
        : normalizePhoneNumber(data.email_or_phone)
      const response = await authApi.login(emailOrPhone, data.password)
      login(response.access, response.refresh, response.data)

      // Step 2: Show success toast first
      toast.success("Connexion réussie!")

      // Step 3: Request notification permission
      try {
        const userId = response.data?.id
        await new Promise(resolve => setTimeout(resolve, 100))
        console.log('[Login] Setting up notifications for user:', userId)
        const fcmToken = await setupNotifications(userId)
        if (fcmToken) {
          toast.success("Notifications activées!")
        }
      } catch (fcmError) {
        console.error('[Login] Error setting up notifications:', fcmError)
      }

      // Step 4: Redirect to dashboard
      await new Promise(resolve => setTimeout(resolve, 300))
      router.push("/dashboard/v2")
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 lg:bg-background">
      {/* Left Side - Visual Design (Animated Fresco) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#D4AF37] bg-gradient-to-br from-[#D4AF37] via-[#C5A028] to-[#B8860B]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="1" strokeDasharray="10 10" className="animate-[dash_40s_linear_infinite]" />
            <circle cx="400" cy="400" r="200" stroke="white" strokeWidth="1" strokeDasharray="5 5" className="animate-[dash_30s_linear_infinite] opacity-50" />
            <path d="M0 400C200 350 400 450 800 400" stroke="white" strokeWidth="1" strokeDasharray="8 8" className="animate-dash" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          {/* Top Logo */}
          <div className="relative z-20 flex items-center gap-3 animate-reveal [animation-delay:100ms]">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <Image src="/supercash-logo-mint.png" width={32} height={32} alt="Logo Small" className="brightness-200" />
            </div>
            <span className="text-xl font-bold tracking-tight">Super Cash</span>
          </div>

          {/* Center Content */}
          <div className="relative z-20 max-w-md">
            <h1 className="text-6xl font-extrabold leading-tight mb-8 animate-reveal [animation-delay:300ms]">
              Bon Retour<br />Parmi Nous.
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-sm animate-reveal [animation-delay:500ms]">
              Votre portail vers le système de gestion de paris le plus sécurisé d'Afrique de l'Ouest. Prêt pour le prochain gain ?
            </p>
          </div>

          {/* Animated Floating Objects Container */}
          <div className="absolute top-1/2 right-[-5%] w-[400px] h-[400px] -translate-y-1/2 z-10">
            {/* Security Shield */}
            <div className="absolute top-[15%] left-[10%] w-32 h-32 animate-reveal [animation-delay:600ms]">
              <div className="w-full h-full bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-3xl shadow-2xl animate-float-slow rotate-[5deg] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#39D196]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
            </div>

            {/* Premium Card */}
            <div className="absolute bottom-[20%] left-[25%] animate-reveal [animation-delay:750ms]">
              <div className="w-48 h-28 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl animate-float-medium rotate-[-10deg] p-4">
                <div className="w-8 h-6 bg-white/20 rounded-md mb-8"></div>
                <div className="space-y-1">
                  <div className="w-full h-1 bg-white/30 rounded-full"></div>
                  <div className="w-1/2 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Key Icon Turquoise */}
            <div className="absolute top-[35%] right-[20%] animate-reveal [animation-delay:900ms]">
              <div className="w-14 h-14 bg-[#39D196] rounded-2xl shadow-xl shadow-[#39D196]/40 animate-float-fast rotate-[20deg] flex items-center justify-center border-2 border-white/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3-3.5 3.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Footer Credits */}
          <div className="relative z-20 flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold animate-reveal [animation-delay:1100ms]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Sécurisé par SSL
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              Conformité Globale
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 lg:bg-background overflow-y-auto lg:overflow-visible">
        <div className="w-full max-w-sm lg:max-w-md flex flex-col items-center lg:block">
          {/* Mobile Logo centered above card */}
          <div className="mb-8 lg:hidden flex flex-col items-center">
            {mounted && (
              <Image
                src="/supercash-logo-gold.png"
                width={80}
                height={80}
                alt="Logo"
                className="w-20 h-auto"
              />
            )}
            <h1 className="text-2xl font-bold mt-4 text-primary tracking-tight">SUPERCASH</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-4 lg:mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
              Bienvenue!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-md bg-white lg:bg-card w-full rounded-3xl lg:rounded-xl">
            <CardContent className="p-6 sm:p-6 lg:p-6">
              {/* Mobile Title inside Card */}
              <div className="text-center mb-6 lg:hidden">
                <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email_or_phone" className="text-sm font-semibold text-foreground">
                    Email ou Téléphone
                  </Label>
                  <Input
                    id="email_or_phone"
                    type="text"
                    placeholder="exemple@email.com ou +225..."
                    {...register("email_or_phone")}
                    disabled={isLoading}
                    className="h-10 rounded-lg border bg-background/50 focus:border-gold transition-colors"
                  />
                  {errors.email_or_phone && <p className="text-xs font-semibold text-destructive mt-1">{errors.email_or_phone.message}</p>}
                </div>

                <div className="space-y-1.5 lg:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Mot de passe
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      disabled={isLoading}
                      className="h-10 rounded-lg border bg-background/50 focus:border-gold transition-colors pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs font-semibold text-destructive mt-1">{errors.password.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 lg:h-11 text-base lg:text-lg rounded-xl font-bold shadow-lg shadow-gold/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-muted/50 text-center space-y-4">
                <p className="text-muted-foreground font-medium text-sm">Pas encore de compte? <Link href="/signup" className="text-primary font-bold hover:underline">S&apos;inscrire</Link></p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Télécharger l&apos;application mobile</p>
                  <div className="flex justify-center">
                    <MobileAppDownload className="w-full sm:w-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
