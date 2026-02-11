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
import { authApi } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import { Loader2, UserPlus, CheckCircle, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react"
import { normalizePhoneNumber } from "@/lib/utils"
import { useSettings } from "@/lib/hooks/use-settings"
import { MobileAppDownload } from "@/components/mobile-app-download"
import Image from "next/image"

// Schemas for each step
const step1Schema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
})

const createStep2Schema = (includeReferralCode: boolean) => {
  const baseSchema = z.object({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    re_password: z.string().min(6, "Confirmation requise"),
    referral_code: z.string().optional(),
  }).refine((data) => data.password === data.re_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["re_password"],
  })

  return baseSchema
}

type Step1Data = z.infer<typeof step1Schema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  // Store step 1 data
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)

  const { referralBonus, isLoading: isLoadingSettings } = useSettings()
  const shouldShowReferralCode = !isLoadingSettings && referralBonus

  // Form for Step 1
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || undefined
  })

  // Full unified submit handler
  const onFinalSubmit = async (step2Data: any) => {
    if (!step1Data) return

    setIsLoading(true)
    try {
      const registerData: any = {
        ...step1Data,
        phone: normalizePhoneNumber(step1Data.phone),
        password: step2Data.password,
        re_password: step2Data.re_password,
      }

      if (shouldShowReferralCode && step2Data.referral_code?.trim()) {
        registerData.referral_code = step2Data.referral_code.trim()
      }

      await authApi.register(registerData)
      toast.success("Compte créé avec succès! Veuillez vous connecter.")
      router.push("/login")
    } catch (error) {
      console.error("Signup error:", error)
      // Stay on step 2 if error
    } finally {
      setIsLoading(false)
    }
  }

  const step2Schema = createStep2Schema(shouldShowReferralCode)
  type Step2Data = z.infer<typeof step2Schema>

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  const onSubmitStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 lg:bg-background">
      {/* Left Side - Visual Design (Animated Fresco) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#D4AF37] bg-gradient-to-br from-[#D4AF37] via-[#C5A028] to-[#B8860B]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 600C50 550 150 650 300 600C450 550 550 450 750 500C950 550 1050 650 1200 600" stroke="white" strokeWidth="2" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
            <path d="M-100 700C100 650 250 750 450 700C650 650 750 550 950 600" stroke="white" strokeWidth="2" strokeDasharray="8 8" className="animate-[dash_25s_linear_infinite]" />
            <path d="M-100 500C150 450 350 550 550 500C750 450 850 350 1050 400" stroke="white" strokeWidth="2" strokeDasharray="8 8" className="animate-[dash_30s_linear_infinite]" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          {/* Top Logo - Fixed Z-index */}
          <div className="relative z-20 flex items-center gap-3 animate-reveal [animation-delay:100ms]">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <Image src="/supercash-logo-mint.png" width={32} height={32} alt="Logo Small" className="brightness-200" />
            </div>
            <span className="text-xl font-bold tracking-tight">Super Cash</span>
          </div>

          {/* Center Content - High Z-index */}
          <div className="relative z-20 max-w-md">
            <h1 className="text-6xl font-extrabold leading-tight mb-8 animate-reveal [animation-delay:300ms]">
              Maximisez<br />Vos Gains.
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-sm animate-reveal [animation-delay:500ms]">
              Le moyen le plus rapide de gérer vos transactions de paris en Afrique de l'Ouest. Sécurisé, instantané et fiable.
            </p>
          </div>

          {/* Animated Floating Objects Container - Lower Z-index */}
          <div className="absolute top-1/2 right-[-5%] w-[400px] h-[400px] -translate-y-1/2 z-10">
            {/* Phone 1 (Glassmorphism) */}
            <div className="absolute top-[10%] left-[5%] animate-reveal [animation-delay:600ms]">
              <div className="w-32 h-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl animate-float-slow rotate-[-15deg] flex items-center justify-center overflow-hidden">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-sm"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-sm"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-sm"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-sm"></div>
                  </div>
                </div>
                {/* Turquoise Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#39D196] rounded-full shadow-lg flex items-center justify-center border-2 border-white/20 animate-pulse">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="m3 11 18-5v12L3 11Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* FCFA Badge Large */}
            <div className="absolute top-[45%] left-[30%] animate-reveal [animation-delay:800ms]">
              <div className="px-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl animate-float-medium rotate-[5deg] z-20">
                <span className="text-3xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">FCFA</span>
              </div>
            </div>

            {/* Instant Badge Turquoise */}
            <div className="absolute top-[25%] right-[20%] animate-reveal [animation-delay:1000ms]">
              <div className="px-5 py-3 bg-[#39D196] border border-white/30 rounded-xl shadow-lg shadow-[#39D196]/30 animate-float-fast rotate-[-5deg] z-30 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                <span className="font-bold text-sm tracking-wide">Instant</span>
              </div>
            </div>

            {/* Phone 2 Small */}
            <div className="absolute bottom-[10%] right-[15%] animate-reveal [animation-delay:700ms]">
              <div className="w-24 h-40 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[1.5rem] shadow-xl animate-float-slow rotate-[10deg] flex items-center justify-center">
                <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                {/* FCFA Small Badge */}
                <div className="absolute -top-3 -left-10 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-[10px] font-bold">FCFA</span>
                </div>
                {/* +221 PAY Badge */}
                <div className="absolute top-1/2 -right-16 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 whitespace-nowrap">
                  <span className="text-[10px] text-white/60 font-medium">+221 PAY</span>
                </div>
              </div>
            </div>

            {/* Small Dots and Decor */}
            <div className="absolute top-[20%] left-[45%] animate-reveal [animation-delay:1200ms]">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            </div>
            <div className="absolute bottom-[30%] left-[10%] animate-reveal [animation-delay:1300ms]">
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
            <div className="absolute top-[60%] right-[5%] animate-reveal [animation-delay:1150ms]">
              <div className="w-3 h-3 border border-white/20 rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Bottom Footer Credits - High Z-index */}
          <div className="relative z-20 flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold animate-reveal [animation-delay:1400ms]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Confiance à chaque transaction
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              Agréé en Afrique de l'Ouest
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 lg:bg-background overflow-y-auto lg:overflow-visible">
        <div className="w-full max-w-md lg:max-w-md flex flex-col items-center lg:block">
          {/* Mobile Logo centered above card */}
          <div className="mb-8 lg:hidden flex flex-col items-center">
            <Image
              src="/supercash-logo-gold.png" // Use gold logo for light bg
              width={80} // Bigger logo
              height={80}
              alt="Logo"
              className="w-20 h-auto"
            />
            <h1 className="text-2xl font-bold mt-4 text-primary tracking-tight">SUPERCASH</h1>
          </div>

          <div className="hidden lg:block mb-6 lg:mb-8 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-primary">
              Créer un compte
            </h2>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
              <span>Étape {step} sur 2</span>
              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-md bg-white lg:bg-card w-full rounded-3xl lg:rounded-xl">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="text-center mb-6 lg:hidden">
                <h2 className="text-2xl font-bold text-gray-900">Inscription</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
                  <span>Étape {step} sur 2</span>
                  <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                  </div>
                </div>
              </div>
              {step === 1 ? (
                <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="first_name" className="text-xs sm:text-sm font-semibold">Prénom</Label>
                      <Input
                        id="first_name"
                        {...registerStep1("first_name")}
                        className="bg-background/50 focus:border-primary"
                        defaultValue={step1Data?.first_name}
                      />
                      {errorsStep1.first_name && <p className="text-xs text-destructive">{errorsStep1.first_name.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="last_name" className="text-xs sm:text-sm font-semibold">Nom</Label>
                      <Input
                        id="last_name"
                        {...registerStep1("last_name")}
                        className="bg-background/50 focus:border-primary"
                        defaultValue={step1Data?.last_name}
                      />
                      {errorsStep1.last_name && <p className="text-xs text-destructive">{errorsStep1.last_name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerStep1("email")}
                      className="bg-background/50 focus:border-primary h-10"
                      defaultValue={step1Data?.email}
                    />
                    {errorsStep1.email && <p className="text-xs text-destructive">{errorsStep1.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...registerStep1("phone")}
                      className="bg-background/50 focus:border-primary"
                      defaultValue={step1Data?.phone}
                    />
                    {errorsStep1.phone && <p className="text-xs text-destructive">{errorsStep1.phone.message}</p>}
                  </div>

                  <Button type="submit" className="w-full mt-2 font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gold/20">
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmitStep2(onFinalSubmit)} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs sm:text-sm font-semibold">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...registerStep2("password")}
                        className="bg-background/50 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    {errorsStep2.password && <p className="text-xs text-destructive">{errorsStep2.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="re_password" className="text-xs sm:text-sm font-semibold">Confirmation</Label>
                    <div className="relative">
                      <Input
                        id="re_password"
                        type={showRePassword ? "text" : "password"}
                        {...registerStep2("re_password")}
                        className="bg-background/50 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowRePassword(!showRePassword)}
                      >
                        {showRePassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    {errorsStep2.re_password && <p className="text-xs text-destructive">{errorsStep2.re_password.message}</p>}
                  </div>

                  {shouldShowReferralCode && (
                    <div className="space-y-1.5">
                      <Label htmlFor="referral_code" className="text-xs sm:text-sm font-semibold">Code parrainage (optionnel)</Label>
                      <Input
                        id="referral_code"
                        {...registerStep2("referral_code")}
                        className="bg-background/50 focus:border-primary"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gold/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
                        </>
                      ) : (
                        "Créer compte"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-sm text-center border-t border-muted/50 pt-6 space-y-4">
                <p className="text-sm">
                  Déjà un compte?{" "}
                  <Link href="/login" className="text-primary hover:underline font-semibold">
                    Se connecter
                  </Link>
                </p>
                <div className="flex justify-center">
                  <MobileAppDownload />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
