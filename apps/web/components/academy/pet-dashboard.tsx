"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../../hooks/use-wallet";
import { useTransactionLogger } from "../../contexts/transaction-context";
import { Pet, PetStats, getPet, getPetStats, trainStat } from "../../lib/pet-contract";
import {
    Activity,
    Zap,
    Brain,
    Dumbbell,
    Trophy,
    Swords,
    Coins,
    RefreshCw,
    Shield
} from "lucide-react";
import Image from "next/image";

// Helper for Stat Bars
const StatBar = ({ label, value, max = 100, color, icon: Icon, onTrain, training }: any) => (
    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[120px]">
            <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
            </div>
        </div>

        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
                className={`h-full bg-${color}-500 transition-all duration-500`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            />
        </div>

        <button
            onClick={onTrain}
            disabled={training}
            className={`
                px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${training
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : `bg-${color}-500/10 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                }
            `}
        >
            TRAIN
        </button>
    </div>
);

export function PetDashboard({ onClose }: { onClose?: () => void }) {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();

    const [pet, setPet] = useState<Pet | null>(null);
    const [stats, setStats] = useState<PetStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState<string | null>(null);

    const fetchData = async () => {
        if (!address) return;
        try {
            setLoading(true);
            const [petData, statsData] = await Promise.all([
                getPet(address),
                getPetStats(address)
            ]);
            setPet(petData);
            setStats(statsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll for energy regen every 30s? Or just rely on user interaction refreshes.
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [address]);

    const handleTrain = async (stat: 'str' | 'agi' | 'int') => {
        if (!address || !stats) return;

        if (stats.energy < 10) {
            addLog("error", "Low Energy", "You need at least 10 Energy to train.");
            return;
        }

        setTraining(stat);
        const statName = stat === 'str' ? "Strength" : stat === 'agi' ? "Agility" : "Intelligence";
        addLog("info", `Training ${statName}`, "Sending transaction...");

        try {
            await trainStat(address, stat);
            addLog("success", "Training Complete!", `Your ${statName} increased!`);
            await fetchData(); // Refresh data
        } catch (e: any) {
            addLog("error", "Training Failed", e.message);
        } finally {
            setTraining(null);
        }
    };

    if (!address) return <div className="text-center text-slate-400 p-10">Connect Wallet to view Pet</div>;

    if (loading && !pet) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCw className="animate-spin text-pink-500" size={32} />
                <p className="text-slate-400">Syncing with Neural Network...</p>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="text-yellow-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">No Pet Found</h3>
                <p className="text-slate-400">You need to mint a Pet first to access the dashboard.</p>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                    Complete "The Artist" Quest to mint your unique Companion.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row">

            {/* Left Column: Pet Visual & Info */}
            <div className="md:w-1/3 bg-slate-900/50 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-700 relative">
                {/* Level Badge */}
                <div className="absolute top-6 left-6 bg-slate-800 border border-slate-600 px-3 py-1 rounded-full text-xs font-bold text-white flex gap-2">
                    <span className="text-pink-400">LVL</span> {pet.level}
                </div>

                {/* Pet Image (Placeholder or AI Generated if we stored it) */}
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-2 border-slate-600 mb-6 relative overflow-hidden group">
                    {/* Try to load from localStorage if available, else generic */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🦖
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{pet.name}</h2>
                <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded mb-6 font-mono">
                    ID: {pet.design || "Unknown"}
                </div>

                {/* Core Stats Summary */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-slate-800 p-3 rounded-xl text-center">
                        <Trophy className="mx-auto text-yellow-400 mb-1" size={16} />
                        <div className="text-xs text-slate-400">Wins</div>
                        <div className="font-bold text-white">{stats?.wins || 0}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl text-center">
                        <Swords className="mx-auto text-red-400 mb-1" size={16} />
                        <div className="text-xs text-slate-400">Losses</div>
                        <div className="font-bold text-white">{stats?.losses || 0}</div>
                    </div>
                </div>
            </div>

            {/* Right Column: Stats & Actions */}
            <div className="md:w-2/3 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="text-blue-400" />
                        Performance Metrics
                    </h3>
                    <div className="flex items-center gap-2 bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-700/50">
                        <Coins size={14} className="text-yellow-400" />
                        <span className="text-yellow-200 font-bold text-sm">{stats?.gold || 0} G</span>
                    </div>
                </div>

                {/* Energy Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                        <span>Energy</span>
                        <span>{stats?.energy || 0} / 100</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                            style={{ width: `${stats?.energy || 0}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 text-right">Regenerates 1 per 30s</p>
                </div>

                <div className="space-y-3">
                    <StatBar
                        label="Strength"
                        value={stats?.strength || 1}
                        color="red"
                        icon={Dumbbell}
                        onTrain={() => handleTrain('str')}
                        training={training === 'str'}
                    />
                    <StatBar
                        label="Agility"
                        value={stats?.agility || 1}
                        color="green"
                        icon={Zap}
                        onTrain={() => handleTrain('agi')}
                        training={training === 'agi'}
                    />
                    <StatBar
                        label="Intelligence"
                        value={stats?.intelligence || 1}
                        color="blue"
                        icon={Brain}
                        onTrain={() => handleTrain('int')}
                        training={training === 'int'}
                    />
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-500">
                            XP Progress
                        </div>
                        <div className="text-xs text-white font-bold">
                            {pet.xp} / {pet.level * 100} XP
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(pet.xp / (pet.level * 100)) * 100}%` }}
                        />
                    </div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full py-3 mt-4 text-sm text-slate-400 hover:text-white transition-colors border-t border-slate-800"
                    >
                        Close Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}
