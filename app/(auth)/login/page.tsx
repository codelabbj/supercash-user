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
import { Loader2, Eye, EyeOff } from "lucide-react"
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
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 lg:bg-background">
      {/* Left Side - Visual Design (Brand Section) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/95">
        <div className="flex flex-col justify-center items-center text-white p-12 w-full text-center">
          <div className="mb-10">
            <div className="w-24 h-24 bg-white/10 rounded-lg p-4 shadow-lg mb-8 mx-auto flex items-center justify-center border border-white/20">
              {mounted && (
                <Image
                  src="/supercash-logo-mint.png"
                  width={80}
                  height={80}
                  alt="Logo"
                  className="w-full h-auto brightness-200 contrast-200"
                />
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              SUPERCASH
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-md mx-auto">
              L'expérience premium pour vos transactions de jeux.
            </p>
          </div>

          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="font-semibold">Transactions Express</span>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="font-semibold">Sécurité 100% Garantie</span>
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

              <div className="mt-4 pt-4 border-t border-muted/50 text-center">
                <p className="text-muted-foreground font-medium mb-2 text-sm">Pas encore de compte? <Link href="/signup" className="text-primary font-bold hover:underline">S'inscrire</Link></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
