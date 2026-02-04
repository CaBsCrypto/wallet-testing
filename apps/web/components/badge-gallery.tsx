"use client";

import { useEffect, useState } from 'react';
import { getBadges } from '../lib/pet-contract';
import { useWallet } from '../hooks/use-wallet';
import { Shield, Compass, Scale, Crown, Lock, PenTool } from 'lucide-react';
import { toast } from 'sonner';

const BADGES = [
    { id: 'initiate', name: 'The Initiate', icon: Shield, color: 'text-blue-400', desc: 'Secure your keys.' },
    { id: 'signer', name: 'The Signer', icon: PenTool, color: 'text-pink-400', desc: 'Digital signatures.' },
    { id: 'explorer', name: 'The Explorer', icon: Compass, color: 'text-green-400', desc: 'Master transactions.' },
    { id: 'trader', name: 'The Trader', icon: Scale, color: 'text-yellow-400', desc: 'Liquidity & Swaps.' },
    { id: 'collector', name: 'The Collector', icon: Crown, color: 'text-purple-400', desc: 'NFT Mastery.' },
];

export function BadgeGallery() {
    const { address } = useWallet();
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);

    useEffect(() => {
        if (address) {
            getBadges(address).then(setOwnedBadges);
        }
    }, [address]);

    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {BADGES.map(badge => {
                const isOwned = ownedBadges.includes(badge.id);
                const Icon = badge.icon;

                return (
                    <div
                        key={badge.id}
                        className={`relative group p-4 rounded-xl border-2 transition-all duration-300 ${isOwned
                            ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500 shadow-lg hover:shadow-cyan-500/20'
                            : 'bg-slate-950/50 border-slate-800 opacity-50'
                            }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className={`p-3 rounded-full mb-3 ${isOwned ? 'bg-slate-800' : 'bg-slate-900'}`}>
                                <Icon className={`w-8 h-8 ${isOwned ? badge.color : 'text-slate-600'}`} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-200">{badge.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>

                            {isOwned ? (
                                <span className="absolute top-2 right-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                    OWNED
                                </span>
                            ) : (
                                <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-700" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
