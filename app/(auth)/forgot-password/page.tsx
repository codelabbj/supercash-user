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
import { authApi } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, Code, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

// Form schemas
const emailSchema = z.object({
  email: z.string().email("Email invalide"),
})

const otpSchema = z.object({
  otp: z.string().min(4, "Le code OTP doit contenir au moins 4 caractères"),
})

const passwordSchema = z.object({
  new_password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirm_new_password: z.string().min(6, "La confirmation doit contenir au moins 6 caractères"),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_new_password"],
})

type EmailFormData = z.infer<typeof emailSchema>
type OtpFormData = z.infer<typeof otpSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

type ForgotPasswordStep = "email" | "otp" | "password"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<ForgotPasswordStep>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  // OTP form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    try {
      await authApi.requestOtp(data.email)
      setEmail(data.email)
      setStep("otp")
      toast.success("Code OTP envoyé à votre email")
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.email?.[0] || "Erreur lors de l'envoi du code OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (data: OtpFormData) => {
    setOtp(data.otp)
    setStep("password")
    otpForm.reset()
  }

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      await authApi.resetPassword(otp, data.new_password, data.confirm_new_password)
      toast.success("Mot de passe réinitialisé avec succès!")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.otp?.[0] ||
        error?.response?.data?.new_password?.[0] ||
        "Erreur lors de la réinitialisation du mot de passe"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    try {
      await authApi.requestOtp(email)
      toast.success("Code OTP renvoyé à votre email")
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Erreur lors du renvoi du code OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    if (step === "email") {
      router.push("/login")
    } else if (step === "otp") {
      emailForm.reset()
      setEmail("")
      setStep("email")
    } else {
      otpForm.reset()
      setOtp("")
      setStep("otp")
    }
  }

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 lg:bg-background">
      {/* Left Side - Visual Design (Animated Fresco) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#D4AF37] bg-gradient-to-br from-[#D4AF37] via-[#C5A028] to-[#B8860B]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200C200 150 400 250 800 200" stroke="white" strokeWidth="1" strokeDasharray="10 10" className="animate-dash" />
            <path d="M0 600C300 550 500 650 900 600" stroke="white" strokeWidth="1" strokeDasharray="5 5" className="animate-[dash_25s_linear_infinite]" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          {/* Top Logo */}
          <div className="relative z-20 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <Image src="/supercash-logo-mint.png" width={32} height={32} alt="Logo Small" className="brightness-200" />
            </div>
            <span className="text-xl font-bold tracking-tight">Super Cash</span>
          </div>

          {/* Center Content */}
          <div className="relative z-20 max-w-md">
            <h1 className="text-6xl font-extrabold leading-tight mb-8">
              Restez en<br />Sécurité.
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-sm">
              Pas d'inquiétude ! Nous vous aiderons à retrouver l'accès à votre compte en un clin d'œil. Votre sécurité est notre priorité.
            </p>
          </div>

          {/* Animated Floating Objects Container */}
          <div className="absolute top-1/2 right-[-5%] w-[400px] h-[400px] -translate-y-1/2 z-10">
            {/* Keyhole / Lock */}
            <div className="absolute top-[20%] left-[15%] w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl animate-float-slow flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#39D196]">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Reset Icon Badge */}
            <div className="absolute bottom-[30%] right-[25%] w-20 h-20 bg-[#f59e0b] rounded-3xl shadow-xl shadow-[#f59e0b]/30 animate-float-medium rotate-[-15deg] z-20 flex items-center justify-center border-2 border-white/40">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </div>
          </div>

          {/* Bottom Footer Credits */}
          <div className="relative z-20 flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Protection 2FA
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              Confidentialité Garantie
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
          <div className="hidden lg:flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">

            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-black text-primary italic">
                {step === "email" && "Réinitialiser"}
                {step === "otp" && "Vérifier"}
                {step === "password" && "Nouveau mot de passe"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {step === "email" && "Entrez votre email pour recevoir un code de vérification"}
                {step === "otp" && "Entrez le code reçu dans votre email"}
                {step === "password" && "Créez votre nouveau mot de passe"}
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-md bg-white lg:bg-card w-full rounded-3xl lg:rounded-xl">
            <CardContent className="p-6 sm:p-6 lg:p-6">
              <div className="text-center mb-6 lg:hidden">
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === "email" && "Mot de passe oublié"}
                  {step === "otp" && "Vérification OTP"}
                  {step === "password" && "Nouveau mot de passe"}
                </h2>
                <p className="text-gray-500 text-sm mt-1 px-4">
                  {step === "email" && "Entrez votre email pour recevoir un code de réinitialisation"}
                  {step === "otp" && "Entrez le code reçu dans votre email"}
                  {step === "password" && "Créez votre nouveau mot de passe"}
                </p>
              </div>

              {/* Step indicator - Hidden on mobile */}
              <div className="hidden lg:flex w-full items-center mb-6 px-1">
                {["email", "otp", "password"].map((s, index) => (
                  <div
                    key={s}
                    className={`flex items-center ${index < 2 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all ${(s === "email" && (step === "email" || step === "otp" || step === "password")) ||
                        (s === "otp" && (step === "otp" || step === "password")) ||
                        (s === "password" && step === "password")
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div
                        className={`h-1 flex-1 mx-4 rounded-full transition-all ${(s === "email" && (step === "otp" || step === "password")) ||
                          (s === "otp" && step === "password")
                          ? "bg-primary"
                          : "bg-muted"
                          }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>

              {step === "email" && (
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      {...emailForm.register("email")}
                      disabled={isLoading}
                      className="h-10 rounded-lg bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 lg:h-11 text-base lg:text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gold/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer le code
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Un code de vérification a été envoyé à{" "}
                      <span className="font-semibold text-foreground">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-semibold flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      {...otpForm.register("otp")}
                      disabled={isLoading}
                      maxLength={6}
                      className="h-10 rounded-lg bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-widest text-center font-semibold"
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gold/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" />
                        Continuer
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "password" && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...passwordForm.register("new_password")}
                        disabled={isLoading}
                        className="h-10 rounded-lg bg-background/50 border-primary/20 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.new_password && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.new_password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_new_password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm_new_password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...passwordForm.register("confirm_new_password")}
                        disabled={isLoading}
                        className="h-10 rounded-lg bg-background/50 border-primary/20 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 lg:h-11 text-base lg:text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-gold/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Réinitialiser
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-sm text-center">
                <span className="text-muted-foreground">Vous vous souvenez de votre mot de passe ? </span><br />
                <Link href="/login" className="text-primary hover:underline font-bold">
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}