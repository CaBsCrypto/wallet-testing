"use client";

import { useWallet } from "../hooks/use-wallet";
import { usePet } from "../hooks/use-pet";
import { useState } from "react";
import { PawPrint, Zap, Trophy, Crown } from "lucide-react";

export function GameDashboard() {
    const { isConnected, connect, address } = useWallet();
    const { pet, isLoading, error, mint, train, release } = usePet();
    const [petName, setPetName] = useState("");
    const [lastTx, setLastTx] = useState<string | null>(null);

    const handleMint = async () => {
        const hash = await mint(petName);
        if (hash) setLastTx(hash);
    };

    const handleTrain = async () => {
        const hash = await train();
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
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleTrain}
                        disabled={isLoading}
                    >
                        <Zap className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
                        Train (+50 XP)
                    </button>

                    {/* Future Actions */}
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300" disabled>
                        <Trophy className="mr-2 h-4 w-4" />
                        Battle (Coming Soon)
                    </button>

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
