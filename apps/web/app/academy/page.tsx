"use client";

import { AcademyHub } from "@/components/academy/academy-hub";
import { BadgeGallery } from "@/components/badge-gallery";
import { useWallet } from "@/hooks/use-wallet";
import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { getBadges } from "@/lib/pet-contract";

export default function AcademyPage() {
    const { address, isConnected } = useWallet();
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);

    useEffect(() => {
        if (address && isConnected) {
            getBadges(address).then(setOwnedBadges).catch(console.error);
        }
    }, [address, isConnected]);

    return (
        <div className="pb-24 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <span className="bg-[#0d1b2a] text-[#80ed99] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#80ed99]/30">
                    Knowledge Base
                </span>
                <h1 className="text-4xl text-white mt-4 drop-shadow-md">Academy</h1>
                <p className="text-[#94a3b8] mt-2">Complete quests to earn Soulbound Badges</p>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                {/* Progress Teaser (New) */}
                <div className="flex justify-end">
                    <a href="/progress" className="bg-[#273e5d] hover:bg-[#355070] border-4 border-[#5d7599] rounded-2xl px-6 py-3 flex items-center gap-3 transition-all group">
                        <div className="bg-[#ffb703] p-2 rounded-full text-[#0d1b2a] group-hover:scale-110 transition-transform">
                            <Crown size={20} fill="currentColor" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">My Progress</div>
                            <div className="text-white font-heading uppercase text-sm">View Badges</div>
                        </div>
                    </a>
                </div>

                {/* Main Quest Area */}
                <div className="w-full">
                    <AcademyHub />
                </div>
            </div>
        </div>
    );
}
