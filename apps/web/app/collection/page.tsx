"use client";

import { useWallet } from "../../hooks/use-wallet";
import { BadgeGallery } from "../../components/badge-gallery";
import { AssetGallery } from "../../components/asset-gallery";
import { Trophy, Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBadges } from "../../lib/pet-contract"; // Assuming getBadges is exported from here or similar

export default function CollectionPage() {
    const { isConnected, address } = useWallet();
    const [activeTab, setActiveTab] = useState<'badges' | 'assets'>('assets');

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0d1b2a]/90 backdrop-blur-md border-b border-slate-800 p-4">
                <div className="max-w-lg mx-auto flex items-center justify-between relative">
                    <Link href="/" className="absolute left-0 p-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="w-full text-center text-xl font-bold text-white font-heading uppercase tracking-widest">
                        My Collection
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">

                {/* Tabs */}
                <div className="flex justify-center gap-4 bg-slate-900/50 p-1 rounded-xl max-w-sm mx-auto">
                    <button
                        onClick={() => setActiveTab('assets')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'assets'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                : 'text-slate-500 hover:text-purple-400'
                            }`}
                    >
                        <Wallet size={16} />
                        Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'badges'
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/50'
                                : 'text-slate-500 hover:text-yellow-400'
                            }`}
                    >
                        <Trophy size={16} />
                        Badges
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[50vh]">
                    {activeTab === 'assets' && (
                        <div className="space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl text-center">
                                <h2 className="text-purple-400 font-bold uppercase text-sm mb-1">Digital Assets</h2>
                                <p className="text-slate-400 text-xs">Collected NFTs and Items from your journey.</p>
                            </div>
                            <AssetGallery />
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl text-center">
                                <h2 className="text-yellow-500 font-bold uppercase text-sm mb-1">Achievements</h2>
                                <p className="text-slate-400 text-xs">Badges earned through Academy Quests.</p>
                            </div>
                            <BadgeGallery />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
