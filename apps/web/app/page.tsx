"use client";

import { useWallet } from "@/hooks/use-wallet";
import { usePet } from "@/hooks/use-pet";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Activity, ShoppingBag, Wallet, Coins, Trophy, Plus, Settings, Gamepad2, GraduationCap, X } from "lucide-react";
import { BadgeGallery } from "@/components/badge-gallery";

import { OnboardingGuide } from "@/components/onboarding-guide";
import { getUSDCBalance, checkUSDCTrust } from "@/lib/soroswap";

export default function Home() {
  const { isConnected, connect, address } = useWallet();
  const { pet, stats, isLoading, error, mint, trainAttribute, buyEnergyPotion, buySmallEnergyPotion, evolve, release, refresh: fetchPet } = usePet();
  const [petName, setPetName] = useState("");
  const [balances, setBalances] = useState({ xlm: "0", usdc: "0" });
  const [showTrophies, setShowTrophies] = useState(false);

  // Fetch Balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (address) {
        try {
          const usdc = await getUSDCBalance(address);
          const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
          const data = await res.json();
          const native = data.balances.find((b: any) => b.asset_type === 'native');
          setBalances({
            xlm: native ? Math.floor(parseFloat(native.balance)).toString() : "0",
            usdc: usdc
          });
        } catch (e) {
          console.error("Balance error", e);
        }
      }
    };
    if (isConnected && address) {
      fetchBalances();
    }
  }, [address, isConnected]);

  // --- CONNECT SCREEN ---
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full"></div>
          <h1 className="relative text-6xl md:text-8xl text-white drop-shadow-[0_4px_0_#000]">
            PET<br />LEGENDS
          </h1>
        </div>

        <button
          onClick={connect}
          disabled={isLoading}
          className="btn-clash bg-[#fca311] text-[#0d1b2a] text-2xl px-12 py-6 rounded-full font-black tracking-wider hover:brightness-110"
        >
          {isLoading ? "Loading..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  // --- MINT SCREEN ---
  if (!pet) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 panel-clash text-center space-y-6">
        <div className="w-32 h-32 bg-[#0d1b2a] rounded-full mx-auto flex items-center justify-center text-6xl shadow-inner">
          🥚
        </div>
        <h3 className="text-2xl text-white">New Companion</h3>
        <input
          placeholder="ENTER NAME"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          className="w-full bg-[#1c2e4a] border-b-4 border-[#0d1b2a] p-4 text-center text-white text-xl font-bold uppercase placeholder:text-[#5d7599] focus:outline-none focus:border-[#ffb703] rounded-xl"
        />
        <button
          className="btn-clash w-full bg-[#80ed99] text-[#0d1b2a] text-xl py-4 rounded-xl relative overflow-hidden group"
          onClick={() => mint(petName)}
          disabled={!petName || isLoading}
        >
          <span className="relative z-10 group-disabled:opacity-50">
            {isLoading ? "HATCHING..." : "HATCH EGG"}
          </span>
          {isLoading && (
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          )}
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl text-sm animate-in slide-in-from-top-2">
            <p className="font-bold">Hatching Failed</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // --- LOBBY (MAIN) ---
  return (
    <div className="pb-32 space-y-6">

      {/* Top Bar: Currencies & Info */}
      {/* STICKY HEADER CONTAINER */}
      <div className="sticky top-2 z-40 max-w-lg mx-auto space-y-2 px-2">
        {/* Top Bar: Info & Wallet */}
        <div className="flex justify-between items-center bg-[#0d1b2a]/90 p-2 rounded-full border-2 border-[#5d7599]/50 backdrop-blur-md shadow-xl">
          {/* Left: Badges & Level */}
          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={() => setShowTrophies(true)}
              className="bg-[#273e5d] p-1.5 rounded-full border border-[#5d7599] hover:bg-[#ffb703] hover:text-[#0d1b2a] transition-colors group flex items-center gap-2 pr-3"
            >
              <Trophy size={16} className="text-[#ffb703] group-hover:text-[#0d1b2a]" />
              <span className="text-[10px] font-bold uppercase text-white group-hover:text-[#0d1b2a]">Badges</span>
            </button>
            <div className="hidden md:flex flex-col items-center bg-[#0d1b2a] px-3 py-1 rounded-full border border-[#1c2e4a] min-w-[80px]">
              <p className="text-[10px] text-white font-bold uppercase leading-none mb-0.5">Lvl {pet.level}</p>
              <div className="w-full h-1.5 bg-[#1c2e4a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min((pet.xp / (pet.level * 100)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[6px] text-slate-400 font-mono leading-none mt-0.5">{pet.xp}/{pet.level * 100} XP</p>
            </div>
          </div>

          {/* Center: Pet Name */}
          <div className="bg-[#0d1b2a] px-4 py-1.5 rounded-xl border border-[#ffb703]/30 shadow-inner -skew-x-6 mx-2">
            <h2 className="text-sm text-white font-heading uppercase tracking-widest skew-x-6 truncate max-w-[100px] sm:max-w-none">{pet.name}</h2>
          </div>

          {/* Right: Wallet */}
          <div className="flex gap-4 pr-4">
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <Coins size={16} className="text-[#ffb703]" />
              <span className="text-white font-bold">{stats?.gold || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet size={16} className="text-[#219ebc]" />
              <span className="text-white font-bold">{balances.xlm}</span>
            </div>
          </div>
        </div>

        {/* Energy Bar removed - Now Global */}
      </div>

      {/* PET CENTERPIECE */}
      <div className="relative py-12 flex justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Pet Emoji */}
          <div className="w-48 h-48 animate-bounce-slow filter drop-shadow-2xl text-[8rem] flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
            {pet.design === "egg" ? "🥚" : pet.design === "dragon" ? "🐉" : pet.design === "phoenix" ? "🦅" : "🦁"}
          </div>
        </div>
      </div>

      {/* TROPHY MODAL */}
      {showTrophies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#1c2e4a] border-4 border-[#5d7599] rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0d1b2a] p-4 flex justify-between items-center border-b-4 border-[#5d7599]">
              <div className="flex items-center gap-3">
                <Trophy className="text-[#ffb703] fill-current" size={24} />
                <h2 className="text-xl text-white font-heading uppercase tracking-wider">Trophy Case</h2>
              </div>
              <button
                onClick={() => setShowTrophies(false)}
                className="bg-[#ef233c] text-white p-2 rounded-xl border-b-4 border-[#d90429] active:border-b-0 active:translate-y-1 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-[#0d1b2a] p-4 rounded-2xl border-2 border-[#0d1b2a] mb-4">
                <p className="text-[#94a3b8] text-sm text-center">
                  Collect badges by completing Academy quests and mastering the blockchain.
                </p>
              </div>
              <BadgeGallery />
            </div>
          </div>
        </div>
      )}



      {/* ONBOARDING GUIDE (Handles Popups & Evolution) */}
      <OnboardingGuide />




      {/* PET STATS & TRAINING - Removed (Global FAB used instead) */}

      {/* MAIN NAVIGATION CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8 px-4">

        <Link href="/game" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#ffb703] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ffb703]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <Gamepad2 size={24} className="text-[#ffb703] group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-white font-bold uppercase text-xs relative z-10">Arcade</span>
        </Link>

        <Link href="/collection" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-purple-500 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <Wallet size={24} className="text-purple-500 group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-white font-bold uppercase text-xs relative z-10">Collection</span>
        </Link>

        <Link href="/academy" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#80ed99] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#80ed99]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <GraduationCap size={24} className="text-[#80ed99] group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-white font-bold uppercase text-xs relative z-10">Academy</span>
        </Link>

        <Link href="/shop" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#ef233c] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ef233c]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <ShoppingBag size={24} className="text-[#ef233c] group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-white font-bold uppercase text-xs relative z-10">Shop</span>
        </Link>
      </div>
      {/* FOOTER ACTIONS (RELEASE) */}
      <div className="flex justify-center pb-8 pt-4 opacity-30 hover:opacity-100 transition-opacity">
        <button onClick={() => window.confirm("Reset pet?") && release()} className="text-[10px] text-red-500 uppercase font-bold flex items-center gap-1 hover:text-red-400">
          <Settings size={10} /> Release Legacy
        </button>
      </div>
    </div>
  );
}
