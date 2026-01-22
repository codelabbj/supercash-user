"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" className="h-10 w-10 sm:h-12 sm:w-12">
        <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      className="h-10 w-10 sm:h-12 sm:w-12"
      onClick={handleToggle}
      aria-label={`Passer en mode ${theme === "light" ? "sombre" : "clair"}`}
      title={`Passer en mode ${theme === "light" ? "sombre" : "clair"}`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      )}
      <span className="sr-only">Changer de thème</span>
    </Button>
  )
}
