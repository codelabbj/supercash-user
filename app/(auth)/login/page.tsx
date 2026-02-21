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
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-slate-50 lg:bg-background">
      {/* Left Side - Visual Design (Animated Fresco) - masqué sur petit écran */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#D4AF37] bg-gradient-to-br from-[#D4AF37] via-[#C5A028] to-[#B8860B]">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="1" strokeDasharray="10 10" className="animate-[dash_40s_linear_infinite]" />
            <circle cx="400" cy="400" r="200" stroke="white" strokeWidth="1" strokeDasharray="5 5" className="animate-[dash_30s_linear_infinite] opacity-50" />
            <path d="M0 400C200 350 400 450 800 400" stroke="white" strokeWidth="1" strokeDasharray="8 8" className="animate-dash" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          <div className="relative z-20 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <Image src="/supercash-logo-mint.png" width={32} height={32} alt="Logo" className="brightness-200" />
            </div>
            <span className="text-xl font-bold tracking-tight">Super Cash</span>
          </div>
          <div className="relative z-20 max-w-md">
            <h1 className="text-6xl font-extrabold leading-tight mb-8">Bon Retour<br />Parmi Nous.</h1>
            <p className="text-xl text-white/80 font-medium max-w-sm">
              Votre portail vers le système de gestion de paris le plus sécurisé d&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
          <div className="relative z-20 flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">
            <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Sécurisé par SSL</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Conformité Globale</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form (compact sur petit écran) */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2 px-3 sm:py-4 sm:px-4 lg:py-6 bg-slate-50 lg:bg-background overflow-y-auto">
        <div className="w-full max-w-[320px] sm:max-w-sm lg:max-w-md flex flex-col items-center lg:block">
          {/* Logo mobile - compact */}
          <div className="mb-3 sm:mb-4 lg:hidden flex flex-col items-center">
            {mounted && (
              <Image src="/supercash-logo-gold.png" width={48} height={48} alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
            )}
            <h1 className="text-lg sm:text-xl font-bold mt-1.5 sm:mt-2 text-primary tracking-tight">SUPERCASH</h1>
          </div>

          <div className="hidden lg:block mb-4 lg:mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Bienvenue!</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-md bg-white lg:bg-card w-full rounded-2xl lg:rounded-xl">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-3 sm:mb-4 lg:hidden">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Connexion</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Connectez-vous à votre compte</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 sm:space-y-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="email_or_phone" className="text-xs sm:text-sm font-semibold text-foreground">
                    Email ou Téléphone
                  </Label>
                  <Input
                    id="email_or_phone"
                    type="text"
                    placeholder="exemple@email.com ou +225..."
                    {...register("email_or_phone")}
                    disabled={isLoading}
                    className="h-9 sm:h-10 text-sm rounded-lg border bg-background/50 focus:border-gold transition-colors"
                  />
                  {errors.email_or_phone && <p className="text-[10px] sm:text-xs font-semibold text-destructive mt-0.5">{errors.email_or_phone.message}</p>}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-foreground">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      disabled={isLoading}
                      className="h-9 sm:h-10 text-sm rounded-lg border bg-background/50 focus:border-gold transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-[10px] sm:text-xs font-semibold text-destructive mt-0.5">{errors.password.message}</p>}
                </div>
                <div className="flex justify-end -mt-0.5">
                  <Link href="/forgot-password" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-9 sm:h-10 lg:h-11 text-sm sm:text-base rounded-xl font-bold shadow-lg shadow-gold/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-muted/50 text-center space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Pas encore de compte? <Link href="/signup" className="text-primary font-bold hover:underline">S&apos;inscrire</Link>
                </p>
                <div className="space-y-1.5">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Télécharger l&apos;application mobile</p>
                  <MobileAppDownload className="w-full sm:w-auto h-9 sm:h-10 text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
