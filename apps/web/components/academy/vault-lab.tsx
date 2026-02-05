"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../../hooks/use-wallet";
import { useTransactionLogger } from "../../contexts/transaction-context";
import { Wallet, Info, ArrowUpRight, ArrowDownLeft, ShieldCheck, Activity } from "lucide-react";
import { claimBadge } from "../../lib/pet-contract";

interface VaultLabProps {
    onComplete: () => void;
}

export function VaultLab({ onComplete }: VaultLabProps) {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();

    // Simulation State
    const [suppliedAmount, setSuppliedAmount] = useState<number>(0);
    const [walletBalance, setWalletBalance] = useState<number>(1000); // Mock Start
    const [accruedInterest, setAccruedInterest] = useState<number>(0);
    const [isDepositing, setIsDepositing] = useState(false);
    const [inputAmount, setInputAmount] = useState("");
    const [activeTab, setActiveTab] = useState<'supply' | 'withdraw'>('supply');

    // Constants
    const APY = 5.0; // 5% APY
    const HEALTH_FACTOR = 1.25; // Safe

    // Real-time Interest Accrual
    useEffect(() => {
        if (suppliedAmount > 0) {
            const interval = setInterval(() => {
                // Mock: 5% APY per second (super fast for demo)
                // Real: supplied * (0.05 / 31536000) per second
                const interestPerSecond = suppliedAmount * 0.001;
                setAccruedInterest(prev => prev + interestPerSecond);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [suppliedAmount]);

    const handleTransaction = async () => {
        if (!inputAmount || isNaN(Number(inputAmount))) return;
        const amount = Number(inputAmount);

        setIsDepositing(true);
        addLog('info', activeTab === 'supply' ? 'Supplying to Blend Pool' : 'Withdrawing from Blend', `${amount} XLM`);

        try {
            // Simulate Network Delay & Signing
            await new Promise(r => setTimeout(r, 2000));

            if (activeTab === 'supply') {
                if (amount > walletBalance) throw new Error("Insufficient Balance");
                setWalletBalance(prev => prev - amount);
                setSuppliedAmount(prev => prev + amount);
                addLog('success', 'Supply Successful', `+${amount} XLM to Vault`);

                // Complete Quest Logic
                if (suppliedAmount + amount >= 100) { // Goal: Supply 100 XLM total
                    // Trigger completion after a short delay
                    setTimeout(() => {
                        onComplete();
                    }, 1500);
                }

            } else {
                if (amount > suppliedAmount) throw new Error("Insufficient Collateral");
                setSuppliedAmount(prev => prev - amount);
                setWalletBalance(prev => prev + amount + accruedInterest);
                setAccruedInterest(0); // Claim interest
                addLog('success', 'Withdrawal Successful', `-${amount} XLM from Vault`);
            }

            setInputAmount("");
        } catch (e: any) {
            addLog('error', 'Transaction Failed', e.message);
        } finally {
            setIsDepositing(false);
        }
    };

    return (
        <div className="space-y-4">

            {/* Header / Stats Panel */}
            <div className="bg-[#1c2e4a] rounded-2xl p-4 border-2 border-[#5d7599] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={80} />
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div>
                        <p className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-wider mb-1">Total Supplied</p>
                        <h2 className="text-2xl text-white font-heading">{suppliedAmount.toFixed(2)} <span className="text-sm text-[#5d7599]">XLM</span></h2>
                    </div>
                    <div>
                        <p className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-wider mb-1">Net APY</p>
                        <h2 className="text-2xl text-[#80ed99] font-heading">{APY}%</h2>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#273e5d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-[#ffb703]" />
                        <span className="text-white font-bold text-xs">Health Factor</span>
                        <span className="bg-[#80ed99]/20 text-[#80ed99] px-1.5 py-0.5 rounded text-[10px] font-bold">{HEALTH_FACTOR} (Safe)</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[#94a3b8] text-[10px]">Accrued Interest</p>
                        <p className="text-[#ffb703] font-mono text-xs">+{accruedInterest.toFixed(6)} XLM</p>
                    </div>
                </div>
            </div>

            {/* Action Panel */}
            <div className="bg-[#0d1b2a] rounded-2xl p-1 border border-[#1c2e4a] flex gap-1">
                <button
                    onClick={() => setActiveTab('supply')}
                    className={`flex-1 py-2 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-1.5
                        ${activeTab === 'supply' ? 'bg-[#5d7599] text-white shadow-lg' : 'text-[#5d7599] hover:bg-[#1c2e4a]'}
                    `}
                >
                    <ArrowUpRight size={14} /> Supply
                </button>
                <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`flex-1 py-2 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-1.5
                        ${activeTab === 'withdraw' ? 'bg-[#5d7599] text-white shadow-lg' : 'text-[#5d7599] hover:bg-[#1c2e4a]'}
                    `}
                >
                    <ArrowDownLeft size={14} /> Withdraw
                </button>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
                <div className="bg-[#0d1b2a] border-2 border-[#1c2e4a] rounded-xl p-3 flex items-center gap-3 focus-within:border-[#ffb703] transition-colors">
                    <div className="bg-[#1c2e4a] p-1.5 rounded-lg">
                        <Wallet className="text-[#5d7599]" size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[#5d7599] text-[10px] font-bold uppercase mb-0.5">Amount</p>
                        <input
                            type="number"
                            value={inputAmount}
                            onChange={(e) => setInputAmount(e.target.value)}
                            className="bg-transparent text-white text-xl font-bold w-full focus:outline-none placeholder:text-[#1c2e4a]"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-[#94a3b8] text-[10px] font-bold uppercase mb-0.5">Balance</p>
                        <p className="text-white font-mono text-xs">{activeTab === 'supply' ? walletBalance.toFixed(2) : suppliedAmount.toFixed(2)} XLM</p>
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex gap-2">
                    <Info className="text-blue-400 shrink-0" size={14} />
                    <p className="text-blue-200 text-[10px] leading-relaxed">
                        <strong>Powered by Blend Protocol:</strong> When you supply assets, others can borrow them in a decentralized way.
                    </p>
                </div>

                <button
                    onClick={handleTransaction}
                    disabled={isDepositing || !inputAmount}
                    className="w-full btn-clash bg-[#ffb703] text-[#0d1b2a] py-3 rounded-xl text-lg font-black tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDepositing ? "Processing..." : activeTab === 'supply' ? "Supply XLM" : "Withdraw XLM"}
                </button>
            </div>

        </div>
    );
}
