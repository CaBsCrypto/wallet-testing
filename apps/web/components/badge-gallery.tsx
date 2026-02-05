"use client";

import { useEffect, useState } from 'react';
import { getBadges } from '../lib/pet-contract';
import { useWallet } from '../hooks/use-wallet';
import { Shield, Compass, Scale, Crown, Lock, PenTool, Book, Check } from 'lucide-react';

const BADGES = [
    { id: 'initiate', name: 'The Initiate', icon: Shield, bg: 'bg-blue-500', border: 'border-blue-700', desc: 'Secure your keys.' },
    { id: 'signer', name: 'The Signer', icon: PenTool, bg: 'bg-pink-500', border: 'border-pink-700', desc: 'Digital signatures.' },
    { id: 'scholar', name: 'The Scholar', icon: Book, bg: 'bg-cyan-500', border: 'border-cyan-700', desc: 'DeFi Theory.' },
    { id: 'explorer', name: 'The Explorer', icon: Compass, bg: 'bg-green-500', border: 'border-green-700', desc: 'Master transactions.' },
    { id: 'trader', name: 'The Trader', icon: Scale, bg: 'bg-yellow-500', border: 'border-yellow-700', desc: 'Liquidity & Swaps.' },
    { id: 'collector', name: 'The Collector', icon: Crown, bg: 'bg-purple-500', border: 'border-purple-700', desc: 'NFT Mastery.' },
];

export function BadgeGallery({ ownerAddress, lastTx, variant = 'default' }: { ownerAddress?: string, lastTx?: string, variant?: 'default' | 'mini' }) {
    const { address } = useWallet();
    const targetAddress = ownerAddress || address;
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetAddress) {
            setLoading(true);
            getBadges(targetAddress).then((badges) => {
                setOwnedBadges(badges);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [targetAddress, lastTx]);

    if (!targetAddress && variant === 'default') return <div className="text-center text-slate-500">Connect wallet to view badges</div>;
    if (loading && variant === 'default') return <div className="text-center text-white animate-pulse">Loading Trophies...</div>;
    if (loading && variant === 'mini') return <div className="h-8 w-full animate-pulse bg-white/5 rounded-full"></div>;

    if (variant === 'mini') {
        return (
            <div className="flex justify-center gap-2 flex-wrap">
                {BADGES.map(badge => {
                    const isOwned = ownedBadges.includes(badge.id);
                    const Icon = badge.icon;

                    // Only show owned badges in mini mode? Or show all with locks?
                    // User said "ver nuestros badges" (see OUR badges), usually implying owned ones or progress.
                    // Let's show all but dim unowned ones for that "completionist" feel.
                    return (
                        <div key={badge.id} className={`relative p-1.5 rounded-xl border-2 transition-all ${isOwned ? `${badge.bg} ${badge.border}` : 'bg-[#0d1b2a] border-[#1c2e4a] opacity-50'}`}>
                            <Icon size={14} className="text-white" />
                        </div>
                    );
                })}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {BADGES.map(badge => {
                const isOwned = ownedBadges.includes(badge.id);
                const Icon = badge.icon;

                return (
                    <div
                        key={badge.id}
                        className={`relative group flex flex-col items-center text-center transition-all duration-300
                            ${isOwned ? 'opacity-100 hover:scale-105 transform cursor-pointer' : 'opacity-50 grayscale'}
                        `}
                    >
                        {/* Badge Hexagon/Shape */}
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-2 shadow-lg border-b-4 relative overflow-hidden
                            ${isOwned ? `${badge.bg} ${badge.border}` : 'bg-[#1c2e4a] border-[#0d1b2a]'}
                        `}>
                            {isOwned && <div className="absolute inset-0 bg-white/20 -translate-y-1/2 rotate-45 transform"></div>}
                            <Icon className={`w-10 h-10 text-white drop-shadow-md`} />

                            {!isOwned && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Lock className="text-slate-400" size={24} /></div>}
                        </div>

                        {/* Text */}
                        <h3 className="font-heading text-xs text-white uppercase tracking-wider mb-1">{badge.name}</h3>

                        {isOwned && (
                            <span className="bg-[#80ed99] text-[#0d1b2a] px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                                <Check size={8} strokeWidth={4} /> Obtained
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
