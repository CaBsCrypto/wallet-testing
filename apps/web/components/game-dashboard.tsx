"use client";

import { useWallet } from "../hooks/use-wallet";
import { usePet } from "../hooks/use-pet";
import { useState, useEffect } from "react";
import { AcademyHub } from "./academy/academy-hub";
import { getBadges } from "../lib/pet-contract";
import { getUSDCBalance, checkUSDCTrust } from "../lib/soroswap";
import { Trophy, Crown, Dumbbell, Activity, Brain, ShoppingBag, Coins, Flame, Droplets, Leaf, Grid3X3, Gamepad2, GraduationCap, Zap, Gem, Skull, Wind, Home, Swords, Store, Wallet } from "lucide-react";
import { Game2048 } from "./game-2048";
import { GamePool } from "./game-pool";
import { BadgeGallery } from "./badge-gallery";

export function GameDashboard() {
    const { isConnected, connect, address } = useWallet();
    const { pet, stats, isLoading, error, mint, trainAttribute, battle, hunt, evolve, buyEnergyPotion, buySmallEnergyPotion, release, submitScore } = usePet();
    const [petName, setPetName] = useState("");
    const [lastTx, setLastTx] = useState<string | null>(null);

    // VIEW STATE
    const [activeView, setActiveView] = useState<'home' | 'missions' | 'arcade' | 'shop'>('home');
    const [activeGame, setActiveGame] = useState<'arena' | 'hunt' | 'pool' | '2048' | null>(null); // For Arcade sub-navigation
    const [balances, setBalances] = useState({ xlm: "0", usdc: "0" }); // Balance State

    // Hunt State
    const [huntGrid, setHuntGrid] = useState<Array<{ revealed: boolean, selected: boolean, content: 'gem' | 'trap' | 'dust' | null }>>(Array(9).fill({ revealed: false, selected: false, content: null }));
    const [isHunting, setIsHunting] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState("dragon");
    const PetDesigns = ["dragon", "phoenix", "golem", "spirit"];

    // Academy State
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);

    // Fetch badges on mount/update
    useEffect(() => {
        const fetchBadges = async () => {
            if (address && isConnected) {
                try {
                    const badges = await getBadges(address);
                    setOwnedBadges(badges);
                } catch (e) {
                    console.error("Failed to fetch badges", e);
                }
            }
        };
        fetchBadges();
    }, [address, isConnected, lastTx]);

    // Fetch Balances
    useEffect(() => {
        const fetchBalances = async () => {
            if (address) {
                try {
                    // Fetch USDC
                    const usdc = await getUSDCBalance(address);

                    // Fetch XLM (Native)
                    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
                    const data = await res.json();
                    const native = data.balances.find((b: any) => b.asset_type === 'native');

                    setBalances({
                        xlm: native ? Math.floor(parseFloat(native.balance)).toString() : "0",
                        usdc: usdc
                    });
                } catch (e) {
                    console.error("Balance fetch error", e);
                }
            }
        };
        if (isConnected && address) {
            fetchBalances();
            const interval = setInterval(fetchBalances, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [address, isConnected, lastTx]);

    const handleMint = async () => {
        const hash = await mint(petName);
        if (hash) setLastTx(hash);
    };

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

    const handleBattle = async (move: "Fire" | "Water" | "Grass") => {
        const hash = await battle(move);
        if (hash) setLastTx(hash);
    };

    // Hunt Logic
    const MAX_SELECTION = 3;

    const toggleTileSelection = (index: number) => {
        if (isHunting || huntGrid[index].revealed) return;

        const newGrid = [...huntGrid];
        const isSelected = newGrid[index].selected;
        const currentSelected = newGrid.filter(c => c.selected).length;

        if (!isSelected && currentSelected >= MAX_SELECTION) return;

        const cell = { ...newGrid[index], selected: !isSelected };
        newGrid[index] = cell;
        setHuntGrid(newGrid);
    }

    const selectedCount = huntGrid.filter(c => c.selected).length;
    const huntCost = selectedCount * 5;

    const handleBatchHunt = async () => {
        if (!stats) return;
        const selectedIndices = huntGrid.map((cell, idx) => cell.selected ? idx : -1).filter(idx => idx !== -1);

        if (selectedIndices.length === 0) return;
        if (stats.energy < huntCost) {
            alert("Not enough energy!");
            return;
        }

        setIsHunting(true);
        try {
            const hash = await hunt(selectedIndices);
            if (hash) {
                setLastTx(hash);
                setTimeout(async () => {
                    const newGrid = [...huntGrid];
                    selectedIndices.forEach(idx => {
                        newGrid[idx] = { ...newGrid[idx], revealed: true, selected: false, content: null };
                    });
                    setHuntGrid(newGrid);
                    alert("Digging Successful! Check your stats update.");
                }, 1000);
            } else {
                alert("Transaction failed to start.");
            }
        } catch (e) {
            console.error("Hunt Error:", e);
            alert("Error: " + e);
        } finally {
            setIsHunting(false);
        }
    }

    const resetHunt = () => {
        setHuntGrid(Array(9).fill({ revealed: false, selected: false, content: null }));
    }

    const handleGame2048Over = async (score: number) => {
        if (score === 0) return;
        if (stats && stats.energy < 20) {
            alert(`Game Over! Score: ${score}\n\n⚠️ Not enough Energy (20 required).`);
            return;
        }
        const hash = await submitScore(score, "2048");
        if (hash) {
            setLastTx(hash);
            alert(`Game Over! Score: ${score}\n\nSubmitting to contract...`);
        }
    };

    const handleEvolve = async (design: string) => {
        const hash = await evolve(design);
        if (hash) setLastTx(hash);
    };

    const handleRelease = async () => {
        if (!confirm("Are you sure you want to release your pet?")) return;
        const hash = await release();
        if (hash) setLastTx(hash);
    };

    // --- RENDER HELPERS ---

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2 animate-in fade-in zoom-in duration-500">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600" style={{ fontFamily: '"Press Start 2P"' }}>PET LEGENDS</h1>
                    <p className="text-green-500/80 font-mono text-sm md:text-base">SECURE_CHANNEL_REQUIRED // CONNECT_WALLET</p>
                </div>
                <button onClick={connect} disabled={isLoading} className="relative group overflow-hidden bg-black border-2 border-green-500 px-8 py-4 font-bold font-mono text-green-500 uppercase tracking-widest hover:text-black hover:bg-green-500 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <span className="relative z-10">{isLoading ? "DECRYPTING..." : "[ ESTABLISH UPLINK ]"}</span>
                    <div className="absolute inset-0 bg-green-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
        );
    }

    if (isLoading && !pet) {
        return <div className="flex justify-center items-center h-[50vh] text-green-500 font-mono animate-pulse text-xl">LOADING_PET_DATA...</div>
    }

    if (!pet) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-black border-4 border-green-600 shadow-[8px_8px_0px_#15803d]">
                <h3 className="font-bold text-3xl text-green-500 mb-6 font-mono text-center">INITIALIZE UNIT</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-green-700 font-mono uppercase font-bold">Unit Designation</label>
                        <input
                            placeholder="ENTER_NAME..."
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            className="w-full bg-black border-2 border-slate-700 p-4 text-green-400 font-mono text-lg focus:border-green-500 outline-none uppercase placeholder:text-slate-800"
                        />
                    </div>
                    <button
                        className="w-full bg-green-600 text-black font-bold py-4 font-mono text-xl hover:bg-green-500 uppercase border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                        onClick={handleMint}
                        disabled={!petName || isLoading}
                    >
                        {isLoading ? "MINTING..." : "MINT PET"}
                    </button>
                </div>
            </div>
        );
    }

    const NavItem = ({ view, icon: Icon, label }: { view: 'home' | 'missions' | 'arcade' | 'shop', icon: any, label: string }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-3 p-3 w-full transition-all border-l-4 ${activeView === view
                ? 'border-green-500 bg-green-900/10 text-green-400'
                : 'border-transparent text-slate-500 hover:text-green-500 hover:bg-white/5'
                }`}
        >
            <Icon className={`w-5 h-5 ${activeView === view ? 'animate-pulse' : ''}`} />
            <span className="font-mono font-bold uppercase tracking-widest hidden md:inline text-sm">{label}</span>
        </button>
    );

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen relative animate-in fade-in duration-500 pb-24 md:pb-0 md:pl-64">

            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-slate-800 flex-col z-50">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600" style={{ fontFamily: '"Press Start 2P"' }}>
                        CRYPTO<br />PET
                    </h1>
                </div>

                <div className="flex-1 py-6 space-y-2">
                    <NavItem view="home" icon={Home} label="Base" />
                    <NavItem view="missions" icon={GraduationCap} label="Missions" />
                    <NavItem view="arcade" icon={Gamepad2} label="Arcade" />
                    <NavItem view="shop" icon={ShoppingBag} label="Supply" />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] uppercase text-green-500 font-bold">System Online</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate font-mono">{address?.slice(0, 12)}...</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto min-h-screen">

                {/* VIEW: HOME (PET & STATS) */}
                {activeView === 'home' && (
                    <div className="space-y-8 pt-8 px-4 md:px-8">
                        {/* Pet Showcase */}
                        <div className="relative">
                            <div className="absolute top-0 right-0 md:flex flex-col items-end gap-2 hidden">
                                <span className="text-xs text-slate-500 uppercase font-mono">Status_Monitor</span>
                                <div className="h-px w-20 bg-green-900" />
                            </div>

                            {/* Wallet Balance Card (New) */}
                            <div className="flex justify-center md:justify-end md:absolute md:top-0 md:left-0">
                                <div className="bg-slate-900/80 border border-slate-700 p-3 rounded-lg flex items-center gap-4 shadow-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-500/20 p-1.5 rounded-full"><Wallet className="w-4 h-4 text-blue-400" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">XLM</p>
                                            <p className="text-sm font-mono text-white">{balances.xlm}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-700"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-500/20 p-1.5 rounded-full"><Coins className="w-4 h-4 text-green-400" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">USDC</p>
                                            <p className="text-sm font-mono text-white">{balances.usdc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Header Stats (only visible on mobile) */}
                            <div className="md:hidden flex justify-between items-center mb-6 text-xs font-mono border-b border-slate-800 pb-2 mt-4">
                                <span className="text-yellow-500 flex items-center gap-1"><Coins className="w-3 h-3" /> {stats?.gold} G</span>
                                <span className="text-green-500 flex items-center gap-1"><Trophy className="w-3 h-3" /> V.{pet.level}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center pt-4 md:pt-10 pb-6">
                                <div className="relative group mb-6 scale-90 md:scale-100">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all duration-1000"></div>
                                    <div className="h-64 w-64 bg-black border-4 border-t-green-500 border-r-pink-500 border-b-cyan-500 border-l-yellow-500 flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.1)] relative z-10 transition-transform group-hover:scale-105">
                                        <span className="text-9xl filter contrast-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-bounce-slow cursor-help" title="Your Companion">
                                            {pet.design === "egg" ? "🥚" : "🐉"}
                                        </span>
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-5xl text-white font-mono uppercase tracking-tighter text-center" style={{ fontFamily: '"Press Start 2P"' }}>{pet.name}</h2>
                                <p className="text-green-600 font-mono mt-2 uppercase tracking-widest text-xs md:text-sm border border-green-900/50 px-3 py-1 rounded bg-green-900/10">&lt; {pet.design} CLASS &gt;</p>
                            </div>
                        </div>

                        {/* Stats Dashboard Removed - Now Global FAB */}
                    </div>
                )}

                {/* VIEW: MISSIONS (ACADEMY) */}
                {activeView === 'missions' && (
                    <div className="pt-8 px-4 md:px-8 pb-12">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-green-900 pb-4">
                            <div className="flex items-center gap-4">
                                <GraduationCap className="w-8 h-8 text-green-500" />
                                <div>
                                    <h2 className="text-xl md:text-2xl text-green-500 font-mono font-bold uppercase">Mission Control</h2>
                                    <p className="text-slate-500 font-mono text-xs hidden md:block">ACQUIRE KNOWLEDGE // EARN BADGES</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">
                                <AcademyHub />
                            </div>
                            <div className="xl:col-span-1">
                                <div className="sticky top-8 border-2 border-dashed border-slate-700 p-6 bg-black/50">
                                    <h3 className="text-lg font-bold text-yellow-500 mb-6 flex items-center gap-2 font-mono uppercase tracking-widest">
                                        <Crown className="w-5 h-5" /> BADGE_DB
                                    </h3>
                                    <BadgeGallery ownerAddress={address || undefined} lastTx={lastTx || undefined} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: ARCADE (GAMES) */}
                {activeView === 'arcade' && (
                    <div className="pt-8 px-4 md:px-8 pb-12">
                        {/* Arcade Header / Menu */}
                        <div className="flex items-center justify-between mb-8 border-b-2 border-pink-900 pb-4">
                            <div className="flex items-center gap-4 hidden md:flex">
                                <Gamepad2 className="w-8 h-8 text-pink-500" />
                                <div>
                                    <h2 className="text-xl md:text-2xl text-pink-500 font-mono font-bold uppercase">Arcade Sector</h2>
                                </div>
                            </div>
                            {/* Mobile Header Simplified */}
                            <h2 className="text-xl text-pink-500 font-mono font-bold uppercase md:hidden">Arcade</h2>

                            {activeGame && (
                                <button onClick={() => setActiveGame(null)} className="text-pink-500 font-mono text-xs md:text-sm underline hover:text-pink-400 uppercase">
                                    &lt; BACK
                                </button>
                            )}
                        </div>

                        {/* Game Selection Menu */}
                        {!activeGame && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* Card: ARENA */}
                                <div className="group border-2 border-slate-800 bg-black hover:border-red-500 transition-all cursor-pointer relative overflow-hidden h-64 flex flex-col" onClick={() => setActiveGame('arena')}>
                                    <div className="absolute inset-0 bg-red-900/10 group-hover:bg-red-900/20 transition-colors" />
                                    <div className="h-2/3 flex items-center justify-center border-b-2 border-slate-800 group-hover:border-red-500/50">
                                        <Swords className="w-16 h-16 text-red-800 group-hover:text-red-500 transition-colors transform group-hover:scale-110 duration-300" />
                                    </div>
                                    <div className="h-1/3 p-4 flex flex-col justify-center">
                                        <h3 className="text-red-500 font-mono font-bold text-lg md:text-xl uppercase group-hover:tracking-wider transition-all">Battle Arena</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">PVP // ELEMENTAL</p>
                                    </div>
                                </div>

                                {/* Card: DIG */}
                                <div className="group border-2 border-slate-800 bg-black hover:border-cyan-500 transition-all cursor-pointer relative overflow-hidden h-64 flex flex-col" onClick={() => setActiveGame('hunt')}>
                                    <div className="absolute inset-0 bg-cyan-900/10 group-hover:bg-cyan-900/20 transition-colors" />
                                    <div className="h-2/3 flex items-center justify-center border-b-2 border-slate-800 group-hover:border-cyan-500/50">
                                        <Grid3X3 className="w-16 h-16 text-cyan-800 group-hover:text-cyan-500 transition-colors transform group-hover:scale-110 duration-300" />
                                    </div>
                                    <div className="h-1/3 p-4 flex flex-col justify-center">
                                        <h3 className="text-cyan-500 font-mono font-bold text-lg md:text-xl uppercase group-hover:tracking-wider transition-all">Dig Site</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">RNG // LOOT</p>
                                    </div>
                                </div>

                                {/* Card: 2048 */}
                                <div className="group border-2 border-slate-800 bg-black hover:border-yellow-500 transition-all cursor-pointer relative overflow-hidden h-64 flex flex-col" onClick={() => setActiveGame('2048')}>
                                    <div className="absolute inset-0 bg-yellow-900/10 group-hover:bg-yellow-900/20 transition-colors" />
                                    <div className="h-2/3 flex items-center justify-center border-b-2 border-slate-800 group-hover:border-yellow-500/50">
                                        <Brain className="w-16 h-16 text-yellow-800 group-hover:text-yellow-500 transition-colors transform group-hover:scale-110 duration-300" />
                                    </div>
                                    <div className="h-1/3 p-4 flex flex-col justify-center">
                                        <h3 className="text-yellow-500 font-mono font-bold text-lg md:text-xl uppercase group-hover:tracking-wider transition-all">Data 2048</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">LOGIC // PUZZLE</p>
                                    </div>
                                </div>

                                {/* Card: POOL */}
                                <div className="group border-2 border-slate-800 bg-black hover:border-purple-500 transition-all cursor-pointer relative overflow-hidden h-64 flex flex-col" onClick={() => setActiveGame('pool')}>
                                    <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/20 transition-colors" />
                                    <div className="h-2/3 flex items-center justify-center border-b-2 border-slate-800 group-hover:border-purple-500/50">
                                        <Coins className="w-16 h-16 text-purple-800 group-hover:text-purple-500 transition-colors transform group-hover:scale-110 duration-300" />
                                    </div>
                                    <div className="h-1/3 p-4 flex flex-col justify-center">
                                        <h3 className="text-purple-500 font-mono font-bold text-lg md:text-xl uppercase group-hover:tracking-wider transition-all">Liquidity Pool</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">PHYSICS // DEX</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Game View */}
                        {activeGame === 'arena' && stats && (
                            <div className="border-4 border-red-900 bg-black p-4 md:p-8 animate-in zoom-in duration-300">
                                <div className="text-center mb-8 md:mb-12">
                                    <h4 className="text-2xl md:text-4xl font-bold text-red-500 font-mono uppercase tracking-tighter" style={{ fontFamily: '"Press Start 2P"' }}>ELEMENTAL COMBAT</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                                    <button
                                        className="h-32 md:h-40 border-2 border-red-800 bg-gradient-to-b from-red-950/30 to-black hover:border-red-500 hover:scale-105 transition-all group flex flex-col items-center justify-center gap-4"
                                        onClick={() => handleBattle("Fire")}
                                        disabled={isLoading || stats.energy < 20}
                                    >
                                        <Flame className="w-10 h-10 md:w-12 md:h-12 text-red-600 group-hover:text-red-400 animate-pulse" />
                                        <span className="text-red-500 font-mono font-bold uppercase text-sm md:text-lg">FIRE OFFENSIVE</span>
                                    </button>
                                    <button
                                        className="h-32 md:h-40 border-2 border-blue-800 bg-gradient-to-b from-blue-950/30 to-black hover:border-blue-500 hover:scale-105 transition-all group flex flex-col items-center justify-center gap-4"
                                        onClick={() => handleBattle("Water")}
                                        disabled={isLoading || stats.energy < 20}
                                    >
                                        <Droplets className="w-10 h-10 md:w-12 md:h-12 text-blue-600 group-hover:text-blue-400 animate-pulse" />
                                        <span className="text-blue-500 font-mono font-bold uppercase text-sm md:text-lg">WATER DEFENSIVE</span>
                                    </button>
                                    <button
                                        className="h-32 md:h-40 border-2 border-green-800 bg-gradient-to-b from-green-950/30 to-black hover:border-green-500 hover:scale-105 transition-all group flex flex-col items-center justify-center gap-4"
                                        onClick={() => handleBattle("Grass")}
                                        disabled={isLoading || stats.energy < 20}
                                    >
                                        <Leaf className="w-10 h-10 md:w-12 md:h-12 text-green-600 group-hover:text-green-400 animate-pulse" />
                                        <span className="text-green-500 font-mono font-bold uppercase text-sm md:text-lg">GRASS TACTICAL</span>
                                    </button>
                                </div>
                                <div className="text-center font-mono text-xs text-red-800/70 mt-8">
                                    COSTS: 20 ENERGY | REWARD: 25 CREDITS
                                </div>
                            </div>
                        )}

                        {activeGame === 'hunt' && (
                            <div className="border-4 border-cyan-900 bg-black p-4 md:p-8 animate-in zoom-in duration-300 flex flex-col items-center">
                                <h4 className="text-2xl md:text-3xl font-bold text-cyan-500 uppercase font-mono mb-8" style={{ fontFamily: '"Press Start 2P"' }}>DIG SITE</h4>
                                <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-sm mb-8 w-full md:w-auto">
                                    {huntGrid.map((cell, idx) => (
                                        <button
                                            key={idx}
                                            className={`aspect-square border-2 flex items-center justify-center transition-all ${cell.revealed
                                                ? 'bg-slate-900 border-slate-800'
                                                : cell.selected
                                                    ? 'bg-cyan-900/40 border-cyan-400 shadow-[0_0_15px_#22d3ee]'
                                                    : 'bg-black border-slate-800 hover:border-cyan-700 hover:bg-slate-900'
                                                }`}
                                            onClick={() => !cell.revealed && toggleTileSelection(idx)}
                                            disabled={isLoading || isHunting || cell.revealed}
                                        >
                                            {cell.revealed ? (
                                                <>
                                                    {cell.content === 'gem' && <Gem className="h-8 w-8 md:h-10 md:w-10 text-cyan-400 animate-bounce" />}
                                                    {cell.content === 'trap' && <Skull className="h-8 w-8 md:h-10 md:w-10 text-red-600" />}
                                                    {cell.content === 'dust' && <Wind className="h-8 w-8 md:h-10 md:w-10 text-slate-500" />}
                                                </>
                                            ) : cell.selected ? (
                                                <div className="h-4 w-4 md:h-6 md:w-6 bg-cyan-500 animate-ping"></div>
                                            ) : (
                                                <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-slate-700"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    <button onClick={resetHunt} className="border border-cyan-900 text-cyan-700 px-6 py-3 md:py-2 font-mono hover:bg-cyan-900/20 uppercase text-xs md:text-base">Reset Sensor</button>
                                    <button
                                        className="bg-cyan-600 text-black font-bold px-8 py-3 md:py-2 font-mono uppercase hover:bg-cyan-500 disabled:opacity-50 text-xs md:text-base"
                                        onClick={handleBatchHunt}
                                        disabled={selectedCount === 0 || isLoading || isHunting || (stats ? stats.energy < huntCost : false)}
                                    >
                                        {isLoading ? "SCANNING..." : `EXECUTE DIG (${selectedCount})`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeGame === '2048' && (
                            <div className="border-4 border-yellow-800 bg-black p-4 max-w-2xl mx-auto animate-in zoom-in duration-300">
                                <h4 className="text-xl md:text-2xl text-center font-bold text-yellow-500 uppercase font-mono mb-6" style={{ fontFamily: '"Press Start 2P"' }}>DATA GRID 2048</h4>
                                <Game2048 onGameOver={handleGame2048Over} isActive={activeGame === '2048'} />
                            </div>
                        )}

                        {activeGame === 'pool' && (
                            <div className="border-4 border-purple-800 bg-black p-2 md:p-4 max-w-4xl mx-auto animate-in zoom-in duration-300">
                                <GamePool />
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW: SHOP */}
                {activeView === 'shop' && (
                    <div className="pt-8 px-4 md:px-8 pb-12">
                        <div className="flex items-center justify-center gap-4 mb-8 md:mb-12">
                            <Store className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                            <h2 className="text-2xl md:text-4xl text-yellow-500 font-mono font-bold uppercase tracking-tighter" style={{ fontFamily: '"Press Start 2P"' }}>SUPPLY DEPOT</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Potion Card */}
                            <div className="border-4 border-slate-800 bg-black p-6 group hover:border-yellow-500 transition-colors">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-yellow-900/10 rounded-full border-2 border-yellow-900/30">
                                        <div className="text-4xl">🧉</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-yellow-500 font-mono">10 CR</span>
                                        <span className="text-xs text-slate-500 font-mono uppercase">IN STOCK</span>
                                    </div>
                                </div>
                                <h3 className="text-xl text-white font-mono font-bold uppercase mb-2">Standard Stimpack</h3>
                                <p className="text-slate-400 font-mono text-xs mb-6 h-10">Restores small amount of energy to the unit. Good for quick boosts.</p>
                                <button onClick={handleBuySmallPotion} disabled={isLoading || (stats?.gold || 0) < 10} className="w-full bg-slate-800 text-white font-mono font-bold py-3 uppercase hover:bg-yellow-600 transition-colors disabled:opacity-50">
                                    PURCHASE (+20 NRG)
                                </button>
                            </div>

                            {/* Max Potion Card */}
                            <div className="border-4 border-slate-800 bg-black p-6 group hover:border-yellow-500 transition-colors">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-yellow-900/10 rounded-full border-2 border-yellow-900/30">
                                        <div className="text-4xl">🧪</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-yellow-500 font-mono">50 CR</span>
                                        <span className="text-xs text-slate-500 font-mono uppercase">IN STOCK</span>
                                    </div>
                                </div>
                                <h3 className="text-xl text-white font-mono font-bold uppercase mb-2">Core Reboot</h3>
                                <p className="text-slate-400 font-mono text-xs mb-6 h-10">Fully restores energy reserves. Standard maintenance procedure.</p>
                                <button onClick={handleBuyPotion} disabled={isLoading || (stats?.gold || 0) < 50} className="w-full bg-slate-800 text-white font-mono font-bold py-3 uppercase hover:bg-yellow-600 transition-colors disabled:opacity-50">
                                    PURCHASE (FULL FILL)
                                </button>
                            </div>

                            {/* Evolution Card (Conditional) */}
                            {pet.level >= 2 && !PetDesigns.includes(pet.design) && (
                                <div className="lg:col-span-2 border-4 border-purple-600 bg-black p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <Dumbbell className="w-32 h-32 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl text-purple-400 font-mono font-bold uppercase mb-4">Unit Evolution Upgrade</h3>
                                    <p className="text-purple-200/70 font-mono text-sm mb-6 max-w-lg">
                                        Unit has reached sufficient complexity level. New chassis designs available for implementation.
                                        Select new form factor below.
                                    </p>
                                    <div className="flex flex-col md:flex-row gap-4 max-w-md">
                                        <select
                                            className="bg-black border-2 border-purple-500 text-purple-300 font-mono p-3 flex-grow outline-none uppercase"
                                            onChange={(e) => setSelectedDesign(e.target.value)}
                                        >
                                            <option value="dragon">DRAGON CLS</option>
                                            <option value="phoenix">PHOENIX CLS</option>
                                            <option value="golem">GOLEM CLS</option>
                                            <option value="spirit">SPIRIT CLS</option>
                                        </select>
                                        <button onClick={() => handleEvolve(selectedDesign)} className="bg-purple-600 text-white font-mono font-bold px-8 py-3 md:py-2 uppercase hover:bg-purple-500 shadow-[0_0_15px_#9333ea]">
                                            INITIATE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* ERROR TOAST */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-600 text-white p-4 font-mono text-sm border-2 border-white shadow-xl max-w-sm animate-bounce z-50">
                    <h5 className="font-bold underline">SYSTEM ERROR</h5>
                    <p>{error}</p>
                </div>
            )}

            {lastTx && (
                <div className="fixed top-4 left-4 bg-green-900/90 text-green-100 p-4 font-mono text-xs border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-50">
                    <p className="font-bold mb-1">TRANSACTION CONFIRMED</p>
                    <a
                        href={`https://stellar.expert/explorer/testnet/tx/${lastTx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-green-300 hover:text-white"
                    >
                        VIEW_ON_LEDGER &gt;&gt;
                    </a>
                </div>
            )}

            {/* BOTTOM NAVIGATION DOCK (MOBILE ONLY) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-4 border-slate-800 p-2 z-40 pb-6">
                <div className="flex items-end justify-between gap-1">
                    <button
                        onClick={() => setActiveView('home')}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 border-t-4 transition-all ${activeView === 'home' ? 'border-green-500 text-green-500 -mt-2 bg-slate-900/50' : 'border-transparent text-slate-600 hover:text-green-500'}`}
                    >
                        <Home className={`w-5 h-5 ${activeView === 'home' ? 'animate-pulse' : ''}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Base</span>
                    </button>

                    <button
                        onClick={() => setActiveView('missions')}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 border-t-4 transition-all ${activeView === 'missions' ? 'border-green-500 text-green-500 -mt-2 bg-slate-900/50' : 'border-transparent text-slate-600 hover:text-green-500'}`}
                    >
                        <GraduationCap className={`w-5 h-5 ${activeView === 'missions' ? 'animate-pulse' : ''}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Missions</span>
                    </button>

                    <button
                        onClick={() => setActiveView('arcade')}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 border-t-4 transition-all ${activeView === 'arcade' ? 'border-green-500 text-green-500 -mt-2 bg-slate-900/50' : 'border-transparent text-slate-600 hover:text-green-500'}`}
                    >
                        <Gamepad2 className={`w-5 h-5 ${activeView === 'arcade' ? 'animate-pulse' : ''}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Arcade</span>
                    </button>

                    <button
                        onClick={() => setActiveView('shop')}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 border-t-4 transition-all ${activeView === 'shop' ? 'border-green-500 text-green-500 -mt-2 bg-slate-900/50' : 'border-transparent text-slate-600 hover:text-green-500'}`}
                    >
                        <ShoppingBag className={`w-5 h-5 ${activeView === 'shop' ? 'animate-pulse' : ''}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Supply</span>
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                .animate-bounce-slow {
                     animation: bounce 3s infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
