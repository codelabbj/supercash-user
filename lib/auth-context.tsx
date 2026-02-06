"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isHydrated: boolean
  login: (accessToken: string, refreshToken: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true)

    // Then check localStorage
    const accessToken = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")

    // Only log in development mode and when debug is enabled
    const isDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === 'true'

    if (isDev) {
      console.log("Auth: Checking stored credentials")
    }

    if (accessToken && userData && userData !== "undefined" && userData !== "null") {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        if (isDev) {
          console.log("Auth: User authenticated")
        }
      } catch (error) {
        console.error("Auth: Failed to parse stored user data")
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
    localStorage.setItem("user_data", JSON.stringify(userData))
    setUser(userData)

    // Only log in development mode with debug enabled
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log("Auth: Login successful")
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, isHydrated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
