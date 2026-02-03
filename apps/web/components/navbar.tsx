"use client";
import React from 'react';
import { useWallet } from '@/hooks/use-wallet';

export function Navbar() {
    const { isConnected, address, connect } = useWallet();

    return (
        <nav className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
                {/* Logo placeholder */}
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    P
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Crypto<span className="text-purple-400">Pet</span>
                </h1>
            </div>
            <div>
                {isConnected ? (
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-mono text-slate-300 truncate max-w-[120px]" title={address || ''}>
                            {address}
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={connect}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    );
}
