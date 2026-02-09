"use client";

import { useState } from "react";
import { useWallet } from "../hooks/use-wallet";
import { useTransactionLogger } from "../contexts/transaction-context";
import { PetStats, trainStat } from "../lib/pet-contract";
import { Activity, Zap, Brain, Dumbbell } from "lucide-react";

interface PetStatsSectionProps {
    stats: PetStats | null;
    refresh: () => void;
}

const StatBar = ({ label, value, max = 100, color, icon: Icon, onTrain, training }: any) => (
    <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3 group hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400 group-hover:bg-${color}-500/30 transition-colors`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
                    <p className="text-xl font-bold text-white font-mono">{value}</p>
                </div>
            </div>
            <button
                onClick={onTrain}
                disabled={training}
                className={`
                    px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider
                    ${training
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : `bg-${color}-500/10 text-${color}-400 hover:bg-${color}-500 hover:text-white border border-${color}-500/30 hover:border-${color}-500`
                    }
                `}
            >
                {training ? 'Training...' : 'Train (+1)'}
            </button>
        </div>

        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
                className={`h-full bg-${color}-500 transition-all duration-500`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            />
        </div>
        <p className="text-[10px] text-slate-500 text-right uppercase">Cost: 10 Energy</p>
    </div>
);

export function PetStatsSection({ stats, refresh }: PetStatsSectionProps) {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();
    const [training, setTraining] = useState<string | null>(null);

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
            refresh();
        } catch (e: any) {
            addLog("error", "Training Failed", e.message);
        } finally {
            setTraining(null);
        }
    };

    if (!stats) return null;

    return (
        <div className="space-y-6 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 font-heading uppercase tracking-widest justify-center">
                <Activity className="text-blue-400" />
                Neural Stats
            </h3>

            <div className="grid grid-cols-1 gap-4">
                <StatBar
                    label="Strength"
                    value={stats.strength}
                    color="red"
                    icon={Dumbbell}
                    onTrain={() => handleTrain('str')}
                    training={training === 'str'}
                />
                <StatBar
                    label="Agility"
                    value={stats.agility}
                    color="green"
                    icon={Zap}
                    onTrain={() => handleTrain('agi')}
                    training={training === 'agi'}
                />
                <StatBar
                    label="Intelligence"
                    value={stats.intelligence}
                    color="blue"
                    icon={Brain}
                    onTrain={() => handleTrain('int')}
                    training={training === 'int'}
                />
            </div>
        </div>
    );
}
