"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the application is running inside a mobile app (Capacitor webview)
 * or in a standard web browser.
 */
export function useIsMobileApp() {
    const [isMobileApp, setIsMobileApp] = useState<boolean>(false)

    useEffect(() => {
        // Capacitor injects the 'Capacitor' object into the window scope when running in a native app.
        // We check for both window.Capacitor and Capacitor.isNative to be sure.
        const checkIsMobileApp = () => {
            const win = window as any
            const isNative = !!(win.Capacitor && win.Capacitor.isNative)
            setIsMobileApp(isNative)
        }

        checkIsMobileApp()

        // In some cases, Capacitor might take a few ms to be injected
        const timer = setTimeout(checkIsMobileApp, 100)

        return () => clearTimeout(timer)
    }, [])

    return isMobileApp
}
