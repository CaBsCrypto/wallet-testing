"use client";

import { BadgeGallery } from "@/components/badge-gallery";
import { useWallet } from "@/hooks/use-wallet";
import { ArrowLeft, User, Trophy } from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
    const { address } = useWallet();

    return (
        <div className="pb-32 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/academy" className="bg-[#1c2e4a] p-3 rounded-full hover:bg-[#273e5d] transition-colors border-2 border-[#5d7599]">
                    <ArrowLeft className="text-white" size={24} />
                </Link>
                <h1 className="text-3xl font-heading text-white uppercase drop-shadow-md">Player Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-[#1c2e4a] border-4 border-[#5d7599] rounded-3xl p-6 mb-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <User size={120} />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#0d1b2a] rounded-2xl border-4 border-[#ffb703] flex items-center justify-center shadow-lg">
                        <div className="text-3xl">👤</div>
                    </div>
                    <div>
                        <div className="text-[#94a3b8] font-bold text-xs uppercase tracking-widest mb-1">Cadet ID</div>
                        <div className="text-white font-mono text-lg bg-[#0d1b2a] px-3 py-1 rounded-lg border border-[#273e5d] inline-block">
                            {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "NOT_CONNECTED"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-[#ffb703]" />
                    <h2 className="text-xl text-white font-heading uppercase">Trophy Case</h2>
                </div>

                <div className="bg-[#0d1b2a] border-4 border-[#1c2e4a] rounded-3xl p-6">
                    <BadgeGallery />
                </div>
            </div>
        </div>
    );
}
