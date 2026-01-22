"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface ActionButtonProps {
  semantic: "gold" | "turquoise" | "neutral"
}

export function ActionButton({ semantic }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false)

    const styles = {
        gold: {
            base: { backgroundColor: "rgba(220, 180, 82, 0.1)", color: "#DCB452" },
            hover: { backgroundColor: "#DCB452", color: "#FFFFFF" }
        },
        turquoise: {
            base: { backgroundColor: "rgba(57, 209, 150, 0.1)", color: "#39D196" },
            hover: { backgroundColor: "#39D196", color: "#FFFFFF" }
        },
        neutral: {
            base: { backgroundColor: "rgba(100, 116, 139, 0.1)", color: "#64748B" },
            hover: { backgroundColor: "#64748B", color: "#FFFFFF" }
        }
    }

    return (
        <div
            className="absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            style={isHovered ? styles[semantic].hover : styles[semantic].base}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <ArrowRight className="w-5 h-5" />
        </div>
    )
}
