"use client"

import { useState } from "react"
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
import { useEffect } from "react"
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
      // Normalize phone number if it looks like a phone (contains + or starts with digits)
      const emailOrPhone = data.email_or_phone.includes('@')
        ? data.email_or_phone
        : normalizePhoneNumber(data.email_or_phone)
      const response = await authApi.login(emailOrPhone, data.password)
      login(response.access, response.refresh, response.data)

      // Step 2: Show success toast first
      toast.success("Connexion réussie!")

      // Step 3: Request notification permission (shows native browser prompt)
      try {
        const userId = response.data?.id

        // Add small delay to ensure page is ready
        await new Promise(resolve => setTimeout(resolve, 100))

        console.log('[Login] Setting up notifications for user:', userId)
        const fcmToken = await setupNotifications(userId)

        if (fcmToken) {
          toast.success("Notifications activées!")
          console.log('[Login] FCM Token registered:', fcmToken.substring(0, 20) + '...')
        } else {
          console.log('[Login] No FCM token - permission might be denied or not granted')
        }
      } catch (fcmError) {
        // Non-critical error - don't block login
        console.error('[Login] Error setting up notifications:', fcmError)
      }

      // Step 4: Redirect to dashboard
      // Wait a bit more to ensure notification prompt completes if shown
      await new Promise(resolve => setTimeout(resolve, 300))
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by api interceptor
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-background">
      {/* Left Side - Visual Design (Brand Section) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gold via-gold/90 to-turquoise">
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-24 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-white dark:bg-card mb-6 lg:hidden shadow-md p-3">
              {mounted && (
                <Image
                  src={resolvedTheme === "dark" ? "/supercash-logo-mint.png" : "/supercash-logo-gold.png"}
                  width={60}
                  height={60}
                  alt="Logo"
                  className="w-full h-auto"
                />
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">
              Bienvenue! 👋
            </h2>
            <p className="text-base text-muted-foreground">Content de vous revoir sur Super Cash</p>
          </div>

          <Card className="border shadow-md bg-card">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    className="h-11 rounded-lg border bg-background/50 focus:border-gold transition-colors"
                  />
                  {errors.email_or_phone && <p className="text-xs font-semibold text-destructive mt-1">{errors.email_or_phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Mot de passe
                    </Label>
                    <Link href="/forgot-password" className="text-sm font-semibold text-gold hover:underline">
                      Oublié?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      disabled={isLoading}
                      className="h-11 rounded-lg border bg-background/50 focus:border-gold transition-colors pr-12"
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

                <Button
                  type="submit"
                  variant="action-ids"
                  size="lg"
                  className="w-full h-14 text-lg"
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

              <div className="mt-10 pt-8 border-t border-muted/50 text-center">
                <p className="text-muted-foreground font-medium mb-4">Pas encore de compte?</p>
                <Button asChild variant="outline" className="w-full h-11 rounded-lg font-semibold hover:bg-gold/5">
                  <Link href="/signup">
                    Créer un compte GRATUIT
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex justify-center">
                <MobileAppDownload
                  variant="ghost"
                  className="text-gold font-semibold hover:bg-gold/5"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
