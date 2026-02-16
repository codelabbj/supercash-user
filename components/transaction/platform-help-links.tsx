"use client"

import { Platform } from "@/lib/types"
import { ExternalLink, HelpCircle, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformHelpLinksProps {
    platform: Platform | null
    type: "deposit" | "withdrawal"
    className?: string
}

export function PlatformHelpLinks({ platform, type, className }: PlatformHelpLinksProps) {
    if (!platform) return null

    const depositTuto = platform.deposit_tuto_link
    const withdrawalTuto = platform.withdrawal_tuto_link
    const withdrawalFail = platform.why_withdrawal_fail

    const showDepositTuto = type === "deposit" && depositTuto
    const showWithdrawalTuto = type === "withdrawal" && withdrawalTuto
    const showWithdrawalFail = type === "withdrawal" && withdrawalFail

    if (!showDepositTuto && !showWithdrawalTuto && !showWithdrawalFail) return null

    return (
        <div className={cn("flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-6", className)}>
            {showDepositTuto && (
                <a
                    href={depositTuto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold hover:underline group w-fit py-1 rounded-lg hover:bg-gold/5 -mx-1 px-1"
                >
                    <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>Tutoriel dépôt {platform.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                </a>
            )}

            {showWithdrawalTuto && (
                <a
                    href={withdrawalTuto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-turquoise hover:underline group w-fit py-1 rounded-lg hover:bg-turquoise/5 -mx-1 px-1"
                >
                    <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>Tutoriel retrait {platform.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                </a>
            )}

            {showWithdrawalFail && (
                <a
                    href={withdrawalFail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-destructive hover:underline group w-fit py-1 rounded-lg hover:bg-destructive/5 -mx-1 px-1"
                >
                    <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>Pourquoi le retrait échoue ?</span>
                    <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                </a>
            )}
        </div>
    )
}
