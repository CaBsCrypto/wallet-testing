"use client";

import { useWallet } from "@/hooks/use-wallet";
import { usePet } from "@/hooks/use-pet";
import { ArrowLeft, ShoppingBag, Zap, Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ShopPage() {
    const { address, isConnected, connect } = useWallet();
    const { pet, stats, isLoading, buyEnergyPotion, buySmallEnergyPotion } = usePet();
    const [purchasing, setPurchasing] = useState<string | null>(null);

    // Mock Prices (Verify with contract if needed, but usually these are fixed in this demo)
    const PRICES = {
        small: 15,
        big: 40
    };

    const handleBuy = async (type: 'small' | 'big') => {
        if (!address) return;
        setPurchasing(type);
        try {
            if (type === 'small') {
                await buySmallEnergyPotion(address);
            } else {
                await buyEnergyPotion(address);
            }
        } catch (e) {
            console.error("Purchase failed", e);
        } finally {
            setPurchasing(null);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <p className="text-slate-400">Connect wallet to access the shop.</p>
                <button
                    onClick={connect}
                    className="bg-[#fca311] text-[#0d1b2a] px-6 py-2 rounded-full font-bold hover:brightness-110"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="pb-24 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-4 mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Back to Hub
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl text-white font-heading drop-shadow-md flex items-center gap-3">
                            <ShoppingBag className="text-[#ef233c]" size={36} />
                            Item Shop
                        </h1>
                        <p className="text-[#94a3b8] mt-1">Spend your hard-earned gold on upgrades.</p>
                    </div>

                    {/* Gold Balance Display */}
                    <div className="bg-[#0d1b2a] border-2 border-[#ffb703] px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(255,183,3,0.2)]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#ffb703] p-1.5 rounded-full">
                                <Coins size={20} className="text-[#0d1b2a]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#ffb703] font-bold uppercase tracking-wider leading-none">Your Gold</p>
                                <p className="text-2xl text-white font-mono leading-none mt-1">{stats?.gold ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">

                {/* Small Potion */}
                <div className="group bg-[#1c2e4a] border-4 border-[#273e5d] hover:border-[#80ed99] rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={100} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex-1 text-center space-y-4">
                            <div className="w-24 h-24 mx-auto bg-[#0d1b2a] rounded-full flex items-center justify-center border-2 border-[#80ed99] shadow-[0_0_20px_rgba(128,237,153,0.2)]">
                                <span className="text-4xl">🧪</span>
                            </div>
                            <div>
                                <h3 className="text-2xl text-white font-bold uppercase">Minor Ether</h3>
                                <p className="text-[#80ed99] font-bold">+50 Energy</p>
                            </div>
                            <p className="text-slate-400 text-sm">
                                A quick boost to get you back in action. Perfect for short adventures.
                            </p>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => handleBuy('small')}
                                disabled={!!purchasing || (stats?.gold || 0) < PRICES.small}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                    ${(stats?.gold || 0) >= PRICES.small
                                        ? "bg-[#80ed99] text-[#0d1b2a] hover:brightness-110 shadow-lg"
                                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    }
                                `}
                            >
                                {purchasing === 'small' ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <Coins size={18} /> {PRICES.small} Gold
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Big Potion */}
                <div className="group bg-[#1c2e4a] border-4 border-[#273e5d] hover:border-[#ffb703] rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={100} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex-1 text-center space-y-4">
                            <div className="w-24 h-24 mx-auto bg-[#0d1b2a] rounded-full flex items-center justify-center border-2 border-[#ffb703] shadow-[0_0_20px_rgba(255,183,3,0.2)]">
                                <span className="text-4xl">⚡</span>
                            </div>
                            <div>
                                <h3 className="text-2xl text-white font-bold uppercase">Mega Elixir</h3>
                                <p className="text-[#ffb703] font-bold">+100 Energy</p>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Fully restores your energy reserves. Maximum power for extended battles.
                            </p>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => handleBuy('big')}
                                disabled={!!purchasing || (stats?.gold || 0) < PRICES.big}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                    ${(stats?.gold || 0) >= PRICES.big
                                        ? "bg-[#ffb703] text-[#0d1b2a] hover:brightness-110 shadow-lg"
                                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    }
                                `}
                            >
                                {purchasing === 'big' ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <Coins size={18} /> {PRICES.big} Gold
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
