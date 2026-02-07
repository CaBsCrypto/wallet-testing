"use client";

import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/use-wallet';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface UserAsset {
    code: string;
    issuer: string;
    balance: string;
    icon?: string;
    isNFT: boolean;
}

export function AssetGallery() {
    const { address } = useWallet();
    const [assets, setAssets] = useState<UserAsset[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            setLoading(true);
            fetch(`https://horizon-testnet.stellar.org/accounts/${address}`)
                .then(res => res.json())
                .then(data => {
                    const mappedAssets = data.balances
                        .filter((b: any) => b.asset_type !== 'native')
                        .map((b: any) => {
                            const isArt = b.asset_code?.startsWith('ART');
                            const storedImage = isArt ? localStorage.getItem(`nft_img_${b.asset_code}`) : null;

                            return {
                                code: b.asset_code,
                                issuer: b.asset_issuer,
                                balance: b.balance,
                                isNFT: b.balance === "1.0000000" && isArt, // Simple heuristic
                                icon: storedImage || (isArt ? "/assets/ai-mocks/cyberpunk-cat.png" : undefined)
                            };
                        });
                    setAssets(mappedAssets);
                })
                .catch(err => console.error("Error fetching assets", err))
                .finally(() => setLoading(false));
        }
    }, [address]);

    if (!address) return null;

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-[#ffb703]" />
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                <p>No extra assets found.</p>
                <p className="text-xs">Mint something in the Academy!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl text-white font-heading uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="text-[#ffb703]" size={20} /> My Collection
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {assets.map((asset, i) => (
                    <div key={i} className={`bg-[#0d1b2a] border-2 ${asset.isNFT ? 'border-pink-500/50' : 'border-[#1c2e4a]'} rounded-xl p-4 relative overflow-hidden group`}>
                        {asset.isNFT && (
                            <div className="absolute top-0 right-0 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                                NFT
                            </div>
                        )}

                        <div className="flex flex-col items-center text-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${asset.isNFT ? 'bg-pink-900/30' : 'bg-[#1c2e4a]'}`}>
                                {asset.isNFT && asset.icon ? (
                                    <Image src={asset.icon} alt={asset.code} width={48} height={48} className="object-cover w-full h-full" />
                                ) : asset.isNFT ? (
                                    <span className="text-2xl">🎨</span>
                                ) : (
                                    <span className="text-xl font-bold text-[#5d7599]">{asset.code[0]}</span>
                                )}
                            </div>

                            <div>
                                <h4 className="text-white font-bold">{asset.code}</h4>
                                <p className="text-[#94a3b8] text-xs truncate max-w-[100px] opacity-70">
                                    {asset.issuer.substring(0, 4)}...{asset.issuer.substring(52)}
                                </p>
                            </div>

                            <div className="mt-2 bg-[#1c2e4a] px-3 py-1 rounded-full">
                                <span className="text-xs font-mono text-white">{parseFloat(asset.balance).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
