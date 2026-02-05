"use client";
import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import Link from 'next/link';
import { LayoutGrid, Gamepad2, GraduationCap } from 'lucide-react';

export function Navbar() {
    const { isConnected, address, connect } = useWallet();

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
            {/* Floating 3D Panel */}
            <div className="bg-[#273e5d] border-4 border-[#5d7599] rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.4)] px-4 py-3 flex justify-between items-center text-white">

                {/* Home */}
                <Link href="/" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition active:scale-95">
                    <LayoutGrid size={24} strokeWidth={3} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Hub</span>
                </Link>

                {/* Play (Center Big Button) */}
                <Link href="/game" className="-mt-12">
                    <div className="bg-yellow-400 border-b-[6px] border-yellow-600 rounded-full p-4 shadow-xl active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center w-16 h-16">
                        <Gamepad2 size={32} color="#0d1b2a" strokeWidth={3} />
                    </div>
                </Link>

                {/* Academy */}
                <Link href="/academy" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition active:scale-95">
                    <GraduationCap size={24} strokeWidth={3} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Quest</span>
                </Link>

            </div>
        </nav>
    );
}
