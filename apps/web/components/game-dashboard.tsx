"use client";

import { useWallet } from "../hooks/use-wallet";
import { usePet } from "../hooks/use-pet";
import { useState } from "react";
import { useRef } from "react";
import { PawPrint, Zap, Trophy, Crown, Dumbbell, Activity, Brain, ShoppingBag, Coins } from "lucide-react";

export function GameDashboard() {
    const { isConnected, connect, address } = useWallet();
    const { pet, stats, isLoading, error, mint, trainAttribute, battle, evolve, buyEnergyPotion, buySmallEnergyPotion, release } = usePet();
    const [petName, setPetName] = useState("");
    const [lastTx, setLastTx] = useState<string | null>(null);

    const handleMint = async () => {
        const hash = await mint(petName);
        if (hash) setLastTx(hash);
    };

    // const handleTrain = async () => {
    //     const hash = await train();
    //     if (hash) setLastTx(hash);
    // };

    const handleTrainStats = async (type: "str" | "agi" | "int") => {
        const hash = await trainAttribute(type);
        if (hash) setLastTx(hash);
    }

    const handleBuyPotion = async () => {
        const hash = await buyEnergyPotion();
        if (hash) setLastTx(hash);
    }

    const handleBuySmallPotion = async () => {
        const hash = await buySmallEnergyPotion();
        if (hash) setLastTx(hash);
    }

    const handleBattle = async () => {
        const hash = await battle();
        if (hash) setLastTx(hash);
    };

    const handleEvolve = async () => {
        const hash = await evolve();
        if (hash) setLastTx(hash);
    };

    const handleRelease = async () => {
        if (!confirm("Are you sure you want to release your pet? This cannot be undone!")) return;
        const hash = await release();
        if (hash) setLastTx(hash);
    };


    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Welcome to Pet Legends
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center">
                    Connect your wallet to start your journey. Mint a pet, train it, and watch it evolve!
                </p>
                <button
                    onClick={connect}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8"
                >
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
            </div>
        );
    }

    if (isLoading && !pet) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-lg animate-pulse">Loading Pet Data...</p>
            </div>
        )
    }

    if (!pet) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto mt-10 p-6 bg-slate-900 border-slate-800">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold tracking-tight text-2xl">Create Your Companion</h3>
                    <p className="text-sm text-muted-foreground">You don't have a pet yet. Mint one to begin!</p>
                </div>
                <div className="p-6 pt-0">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Pet Name</label>
                            <input
                                id="name"
                                placeholder="Ex. Rocky"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0">
                    <button
                        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleMint}
                        disabled={!petName || isLoading}
                    >
                        {isLoading ? "Minting..." : "Mint Pet"}
                    </button>
                </div>
            </div>
        );
    }

    // Calculate generic progress for MVP (e.g. XP / 100)
    const progress = pet.xp;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Pet Status Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-2 bg-slate-900 border-slate-800">
                <div className="flex flex-col space-y-1.5 p-6 flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="font-semibold tracking-tight text-2xl">{pet.name}</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-lg px-3 py-1 text-slate-200 border-slate-700">
                        <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                        Lvl {pet.level}
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center space-y-6 py-4">
                        {/* Design / Avatar Placeholder */}
                        <div className="h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-float">
                            <span className="text-4xl">
                                {pet.design === "egg" ? "🥚" : "🐉"}
                            </span>
                        </div>

                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground text-slate-400">Experience</span>
                                <span className="font-bold text-slate-200">{pet.xp} / 100 XP</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full w-full flex-1 bg-indigo-500 transition-all" style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}></div>
                            </div>
                        </div>

                        {/* Stats & Energy */}
                        {stats && (
                            <div className="w-full space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs uppercase text-slate-400 font-bold">
                                        <span>Energy</span>
                                        <span className={stats.energy < 20 ? "text-red-500" : "text-green-400"}>{stats.energy} / 100</span>
                                    </div>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                        <div className="h-full w-full flex-1 bg-green-500 transition-all" style={{ transform: `translateX(-${100 - stats.energy}%)` }}></div>
                                    </div>
                                    <div className="flex items-center space-x-1 justify-end pt-1">
                                        <Coins className="h-4 w-4 text-yellow-500" />
                                        <span className="text-yellow-400 font-bold">{stats.gold} Gold</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Dumbbell className="h-4 w-4 text-red-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.strength}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">STR</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Activity className="h-4 w-4 text-blue-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.agility}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">AGI</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Brain className="h-4 w-4 text-purple-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.intelligence}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">INT</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 px-1">
                                    <span>Wins: {stats.wins}</span>
                                    <span>Losses: {stats.losses}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center p-3 bg-slate-800 rounded-lg">
                                <span className="text-xs text-muted-foreground uppercase text-slate-400">Design</span>
                                <span className="font-semibold capitalize text-slate-200">{pet.design}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-slate-800 rounded-lg">
                                <span className="text-xs text-muted-foreground uppercase text-slate-400">Owner</span>
                                <span className="font-mono text-xs truncate max-w-[100px] text-slate-200">{pet.owner}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-slate-900 border-slate-800 h-fit">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold tracking-tight text-2xl">Actions</h3>
                    <p className="text-sm text-muted-foreground text-slate-400">Interact with your pet</p>
                </div>
                <div className="p-6 space-y-4 pt-0">
                    {/* Training Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("str")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Dumbbell className="h-5 w-5 mb-1 text-red-500" />
                            <span className="text-[10px] uppercase font-bold">Strength</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("agi")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Activity className="h-5 w-5 mb-1 text-blue-500" />
                            <span className="text-[10px] uppercase font-bold">Agility</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("int")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Brain className="h-5 w-5 mb-1 text-purple-500" />
                            <span className="text-[10px] uppercase font-bold">Intellect</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                    </div>

                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white h-12"
                        onClick={handleBattle}
                        disabled={isLoading || (stats ? stats.energy < 20 : false)}
                    >
                        <Trophy className="mr-2 h-4 w-4 text-orange-500" />
                        <div className="flex flex-col items-start leading-tight">
                            <span>Battle (Earn Gold + XP)</span>
                            <span className="text-[10px] text-slate-500">-20 Energy | Win: +15 Gold | Loss: +1 Gold</span>
                        </div>
                    </button>

                    {/* Shop */}
                    {stats && (
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center space-x-2 text-slate-300 mb-2">
                                <ShoppingBag className="h-4 w-4" />
                                <h4 className="text-sm font-semibold">Item Shop</h4>
                            </div>
                            <div className="space-y-2">
                                {/* Small Potion */}
                                <button
                                    className="inline-flex items-center justify-between w-full p-3 rounded-md bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors border text-slate-200 disabled:opacity-50"
                                    onClick={handleBuySmallPotion}
                                    disabled={isLoading || stats.gold < 10}
                                >
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-lg">🧉</div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Small Potion</span>
                                            <span className="text-[10px] text-slate-400">Restore 20 Energy</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-400 font-bold text-sm">
                                        10 G
                                    </div>
                                </button>

                                {/* Max Potion */}
                                <button
                                    className="inline-flex items-center justify-between w-full p-3 rounded-md bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors border text-slate-200 disabled:opacity-50"
                                    onClick={handleBuyPotion}
                                    disabled={isLoading || stats.gold < 50}
                                >
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3 text-lg">🧪</div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Max Potion</span>
                                            <span className="text-[10px] text-slate-400">Restore 100% Energy</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-400 font-bold text-sm">
                                        50 G
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Evolve Action */}
                    {pet.level >= 2 && pet.design === "egg" && (
                        <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full shadow-lg animate-pulse"
                            onClick={handleEvolve}
                            disabled={isLoading}
                        >
                            <Crown className="mr-2 h-5 w-5 fill-yellow-300 text-yellow-100" />
                            Evolve to Dragon!
                        </button>
                    )}

                    {/* Release Pet (Reset) */}
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-900 bg-red-950/20 hover:bg-red-900/40 text-red-500 w-full mt-4"
                        onClick={handleRelease}
                        disabled={isLoading}
                    >
                        Release Pet (Reset)
                    </button>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                    {lastTx && (
                        <div className="mt-4 p-3 bg-green-900/50 border border-green-800 rounded text-sm text-green-200">
                            Success! View on Explorer:{" "}
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${lastTx}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline font-bold"
                            >
                                View Transaction
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
