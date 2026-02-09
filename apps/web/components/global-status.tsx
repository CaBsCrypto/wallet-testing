"use client";

import { usePet } from "@/hooks/use-pet";
import { Zap, X } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";
import { PetDashboard } from "./academy/pet-dashboard";

export function GlobalStatus() {
    const { isConnected } = useWallet();
    const { stats } = usePet();
    const [isOpen, setIsOpen] = useState(false);

    if (!isConnected) return null;

    // Default to empty if loading
    const energy = stats?.energy ?? 0;
    const isLoading = !stats;

    return (
        <>
            {/* FAB Button - Gold Style */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 z-[60] bg-[#0d1b2a] hover:bg-[#1c2e4a] text-[#ffb703] p-4 rounded-full shadow-[0_0_20px_rgba(255,183,3,0.3)] border-4 border-[#ffb703] transition-transform hover:scale-110 active:scale-95 flex items-center justify-center group ${isLoading ? 'animate-pulse grayscale' : ''}`}
                title="Pet Dashboard"
            >
                <Zap size={28} className="fill-current group-hover:rotate-12 transition-transform" />
                {/* Notification dot if full energy */}
                {energy >= 100 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                )}
            </button>

            {/* Modal - Full Screen Dashboard */}
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                    <div className="w-full max-w-4xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-12 right-0 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="max-h-[85vh] overflow-y-auto rounded-3xl no-scrollbar">
                            <PetDashboard onClose={() => setIsOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
