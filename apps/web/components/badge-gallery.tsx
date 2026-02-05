"use client";

import { useEffect, useState } from 'react';
import { getBadges } from '../lib/pet-contract';
import { useWallet } from '../hooks/use-wallet';
import { Shield, Compass, Scale, Crown, Lock, PenTool, Book } from 'lucide-react';
import { toast } from 'sonner';

const BADGES = [
    { id: 'initiate', name: 'The Initiate', icon: Shield, color: 'text-blue-400', desc: 'Secure your keys.' },
    { id: 'signer', name: 'The Signer', icon: PenTool, color: 'text-pink-400', desc: 'Digital signatures.' },
    { id: 'scholar', name: 'The Scholar', icon: Book, color: 'text-cyan-400', desc: 'DeFi Theory.' },
    { id: 'explorer', name: 'The Explorer', icon: Compass, color: 'text-green-400', desc: 'Master transactions.' },
    { id: 'trader', name: 'The Trader', icon: Scale, color: 'text-yellow-400', desc: 'Liquidity & Swaps.' },
    { id: 'collector', name: 'The Collector', icon: Crown, color: 'text-purple-400', desc: 'NFT Mastery.' },
];

export function BadgeGallery({ ownerAddress, lastTx }: { ownerAddress?: string, lastTx?: string }) {
    const { address } = useWallet();
    const targetAddress = ownerAddress || address;
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);

    useEffect(() => {
        if (targetAddress) {
            getBadges(targetAddress).then(setOwnedBadges);
        }
    }, [targetAddress, lastTx]);

    return (
        <div className="grid grid-cols-2 gap-4 w-full font-mono">
            {BADGES.map(badge => {
                const isOwned = ownedBadges.includes(badge.id);
                const Icon = badge.icon;

                return (
                    <div
                        key={badge.id}
                        className={`relative group p-4 border-2 transition-all duration-300 ${isOwned
                            ? 'bg-green-950/20 border-green-500 hover:bg-green-900/40 shadow-[2px_2px_0px_#15803d]'
                            : 'bg-black border-slate-800 opacity-70 grayscale'
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className={`p-2 border-2 ${isOwned ? 'bg-black border-green-500' : 'bg-black border-slate-700'}`}>
                                <Icon className={`w-8 h-8 ${isOwned ? badge.color : 'text-slate-600'}`} />
                            </div>
                            <h3 className={`font-bold text-xs uppercase tracking-widest ${isOwned ? 'text-green-400' : 'text-slate-500'}`}>{badge.name}</h3>
                            <p className="text-[10px] text-slate-500 uppercase leading-tight">&gt; {badge.desc}</p>

                            {isOwned ? (
                                <span className="absolute top-2 right-2 text-[8px] bg-green-500 text-black px-1 font-bold uppercase">
                                    [OWNED]
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
