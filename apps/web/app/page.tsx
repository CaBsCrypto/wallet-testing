"use client";

import { useWallet } from "@/hooks/use-wallet";
import { usePet } from "@/hooks/use-pet";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Activity, ShoppingBag, Wallet, Coins, Trophy, Plus, Settings, Gamepad2, GraduationCap, X } from "lucide-react";
import { BadgeGallery } from "@/components/badge-gallery";
import { AssetGallery } from "@/components/asset-gallery";
import { getUSDCBalance, checkUSDCTrust } from "@/lib/soroswap";

export default function Home() {
  const { isConnected, connect, address } = useWallet();
  const { pet, stats, isLoading, error, mint, trainAttribute, buyEnergyPotion, buySmallEnergyPotion, evolve, release } = usePet();
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
          className="btn-clash w-full bg-[#80ed99] text-[#0d1b2a] text-xl py-4 rounded-xl"
          onClick={() => mint(petName)}
          disabled={!petName || isLoading}
        >
          HATCH EGG
        </button>
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

        {/* Energy Bar (Floating below header) */}
        {stats && (
          <div className="bg-[#0d1b2a]/80 backdrop-blur-sm border border-[#5d7599]/30 rounded-full p-1 mx-4 shadow-lg animate-in slide-in-from-top-2 flex items-center gap-3 px-3">
            <div className="flex items-center gap-1 text-[#ffb703]">
              <Zap size={10} fill="currentColor" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Energy</span>
            </div>
            <div className="flex-1 h-2 bg-[#1c2e4a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500" style={{ width: `${stats.energy}%` }}></div>
            </div>
            <span className="text-[10px] text-white font-bold w-6 text-right">{stats.energy}%</span>
          </div>
        )}
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



      {/* EVOLUTION UPGRADE CARD (Conditional) */}
      {pet.level >= 2 && !["dragon", "phoenix", "golem", "spirit"].includes(pet.design) && (
        <div className="max-w-md mx-auto px-4 mt-8 animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-br from-purple-900 to-[#1c2e4a] border-4 border-purple-500 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            <h3 className="text-2xl text-white font-heading uppercase text-center mb-2 drop-shadow-md">Evolution Available</h3>
            <p className="text-purple-200 text-center text-sm mb-6">Your companion is ready to evolve.</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {["dragon", "phoenix", "golem", "spirit"].map(cls => (
                <button
                  key={cls}
                  onClick={() => evolve(cls)}
                  className="bg-[#0d1b2a] border-2 border-purple-400/50 rounded-xl p-3 text-center hover:border-purple-400 hover:bg-purple-900/50 transition-all uppercase font-bold text-xs"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}




      {/* ASSET GALLERY */}
      <div className="max-w-lg mx-auto px-4 mt-8">
        <AssetGallery />
      </div>

      {/* MAIN NAVIGATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto mt-8 px-4">
        <Link href="/game" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#ffb703] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ffb703]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <div className="bg-[#ffb703] p-4 rounded-full text-[#0d1b2a] group-hover:scale-110 transition-transform z-10">
            <Gamepad2 size={32} />
          </div>
          <div className="text-center z-10">
            <span className="text-white font-bold uppercase text-lg block">Arcade</span>
            <span className="text-[#94a3b8] text-xs">Play & Earn</span>
          </div>
        </Link>

        <Link href="/academy" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#80ed99] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#80ed99]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <div className="bg-[#80ed99] p-4 rounded-full text-[#0d1b2a] group-hover:scale-110 transition-transform z-10">
            <GraduationCap size={32} />
          </div>
          <div className="text-center z-10">
            <span className="text-white font-bold uppercase text-lg block">Academy</span>
            <span className="text-[#94a3b8] text-xs">Learn DeFi</span>
          </div>
        </Link>

        <Link href="/shop" className="group bg-[#0d1b2a] border-2 border-[#5d7599] rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#ef233c] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ef233c]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <div className="bg-[#ef233c] p-4 rounded-full text-white group-hover:scale-110 transition-transform z-10">
            <ShoppingBag size={32} />
          </div>
          <div className="text-center z-10">
            <span className="text-white font-bold uppercase text-lg block">Shop</span>
            <span className="text-[#94a3b8] text-xs">Upgrades</span>
          </div>
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
