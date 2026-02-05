"use client";

import { useState } from "react";
import { Swords, Grid3X3, Brain, Coins, ArrowLeft } from "lucide-react";
import { usePet } from "@/hooks/use-pet"; // Ensure this hook is robust for standalone use
import { GamePool } from "@/components/game-pool";
import { Game2048 } from "@/components/game-2048";
// note: Hunt and Battle logic will be moved here or kept in separate components

export default function GamePage() {
    // Local state for game selection
    // In a real app, maybe sub-routes like /game/arena, but state is fine for now
    const [activeGame, setActiveGame] = useState<'arena' | 'hunt' | 'pool' | '2048' | null>(null);

    // Render Game Selection Menu
    if (!activeGame) {
        return (
            <div className="pb-24 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <span className="bg-[#0d1b2a] text-[#ffb703] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#ffb703]/30">
                        Arcade Sector
                    </span>
                    <h1 className="text-4xl text-white mt-4 drop-shadow-md">Choose Mode</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* ARENA */}
                    <button
                        onClick={() => setActiveGame('arena')}
                        className="group relative h-48 bg-[#273e5d] border-4 border-[#5d7599] rounded-3xl overflow-hidden hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-red-500 group-hover:opacity-30 transition-opacity">
                            <Swords size={120} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d1b2a] to-transparent">
                            <h3 className="text-2xl text-white drop-shadow-md">Battle Arena</h3>
                            <p className="text-[#ef233c] text-sm uppercase font-bold">PVP Combat • Earn XP</p>
                        </div>
                    </button>

                    {/* HUNT */}
                    <button
                        onClick={() => setActiveGame('hunt')}
                        className="group relative h-48 bg-[#273e5d] border-4 border-[#5d7599] rounded-3xl overflow-hidden hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-cyan-500 group-hover:opacity-30 transition-opacity">
                            <Grid3X3 size={120} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d1b2a] to-transparent">
                            <h3 className="text-2xl text-white drop-shadow-md">Treasure Hunt</h3>
                            <p className="text-[#219ebc] text-sm uppercase font-bold">RNG Mining • Loot</p>
                        </div>
                    </button>

                    {/* 2048 */}
                    <button
                        onClick={() => setActiveGame('2048')}
                        className="group relative h-48 bg-[#273e5d] border-4 border-[#5d7599] rounded-3xl overflow-hidden hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-yellow-500 group-hover:opacity-30 transition-opacity">
                            <Brain size={120} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d1b2a] to-transparent">
                            <h3 className="text-2xl text-white drop-shadow-md">Data 2048</h3>
                            <p className="text-[#ffb703] text-sm uppercase font-bold">Logic Puzzle</p>
                        </div>
                    </button>

                    {/* POOL */}
                    <button
                        onClick={() => setActiveGame('pool')}
                        className="group relative h-48 bg-[#273e5d] border-4 border-[#5d7599] rounded-3xl overflow-hidden hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-purple-500 group-hover:opacity-30 transition-opacity">
                            <Coins size={120} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d1b2a] to-transparent">
                            <h3 className="text-2xl text-white drop-shadow-md">Liquidity Pool</h3>
                            <p className="text-[#a855f7] text-sm uppercase font-bold">Physics • Dexterity</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Render Active Game
    // Note: For now we'll import logic later to keep this file clean, or embed placeholders
    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={() => setActiveGame(null)}
                className="mb-6 flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Arcade
            </button>

            {activeGame === '2048' && <Game2048 onGameOver={() => { }} isActive={true} />}
            {activeGame === 'pool' && <GamePool />}
            {/* Arena and Hunt need their logic ported if not components already. 
                For this step, we'll placeholder them to focus on Layout, then migrate logic. 
            */}
            {activeGame === 'arena' && <div className="text-center text-white py-20">Arena Module Loading... (Migration in progress)</div>}
            {activeGame === 'hunt' && <div className="text-center text-white py-20">Hunt Module Loading... (Migration in progress)</div>}
        </div>
    );
}
