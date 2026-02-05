"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Gamepad2, GraduationCap, ShoppingBag } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    // Don't show on home page
    if (pathname === "/") return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-[#1c2e4a]/90 backdrop-blur-md border-2 border-[#5d7599] rounded-full px-6 py-2 shadow-2xl flex items-center justify-between relative">

                {/* Left: HUB (Home) */}
                <Link href="/" className="flex flex-col items-center gap-1 group w-16">
                    <LayoutGrid size={24} className="text-[#94a3b8] group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-white uppercase tracking-wider">Hub</span>
                </Link>

                {/* Center: GAME (Floating) */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                    <Link href="/game" className="bg-[#ffb703] hover:bg-[#ffca3a] text-[#0d1b2a] p-4 rounded-full border-4 border-[#0d1b2a] shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                        <Gamepad2 size={32} strokeWidth={2.5} />
                    </Link>
                </div>

                {/* Right: QUEST (Academy) */}
                <Link href="/academy" className="flex flex-col items-center gap-1 group w-16">
                    <GraduationCap size={24} className="text-[#94a3b8] group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-white uppercase tracking-wider">Quest</span>
                </Link>
            </div>
        </div>
    );
}
