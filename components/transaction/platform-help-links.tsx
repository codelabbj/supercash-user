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
        <div className={cn("flex flex-col gap-2 mb-6", className)}>
            {showDepositTuto && (
                <a
                    href={depositTuto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-gold hover:underline group w-fit"
                >
                    <PlayCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Tutoriel pour dépôt sur {platform.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
            )}

            {showWithdrawalTuto && (
                <a
                    href={withdrawalTuto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-turquoise hover:underline group w-fit"
                >
                    <PlayCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Tutoriel pour retrait sur {platform.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
            )}

            {showWithdrawalFail && (
                <a
                    href={withdrawalFail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-destructive hover:underline group w-fit"
                >
                    <HelpCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Pourquoi le retrait échoue ?</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
            )}
        </div>
    )
}
