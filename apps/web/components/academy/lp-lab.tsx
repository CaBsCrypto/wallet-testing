"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../../hooks/use-wallet";
import { useTransactionLogger } from "../../contexts/transaction-context";
import {
    approveToken,
    addLiquidity,
    getUSDCContractId,
    getNativeContractId,
    getSoroswapRatio,
    getLPBalance,
    ROUTER_ADDRESS,
    checkUSDCTrust
} from "../../lib/soroswap";
import { Loader2, Check, Zap, Percent, Droplets, Info, Wallet, Divide } from "lucide-react";

const RawButton = ({ children, onClick, disabled, className, variant = "primary" }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all w-full ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
            } ${variant === "primary" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" :
                variant === "start" ? "bg-blue-600 text-white" :
                    variant === "success" ? "bg-green-600 text-white" :
                        "border border-slate-700 text-slate-300 hover:bg-slate-800"
            } ${className}`}
    >
        {children}
    </button>
);

const InfoCard = ({ title, children, icon: Icon }: any) => (
    <div className="bg-purple-900/10 border border-purple-800/50 rounded-lg p-3 text-left">
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="w-4 h-4 text-purple-400" />}
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">{title}</h4>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
            {children}
        </p>
    </div>
);

export function LPLab({ onComplete }: { onComplete: () => void }) {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();

    // Steps: 1=Check, 2=Input/Approve, 3=Deposit, 4=Done
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [xlmAmount, setXlmAmount] = useState<number>(10);
    const [usdcAmount, setUsdcAmount] = useState<number>(0);
    const [ratio, setRatio] = useState<number>(0);
    const [lpBalance, setLPBalance] = useState("0.0000000"); // Fix: Add State

    const [approvedXLM, setApprovedXLM] = useState(false);
    const [approvedUSDC, setApprovedUSDC] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Initial Ratio Fetch
    useEffect(() => {
        if (address) {
            const native = getNativeContractId();
            const usdc = getUSDCContractId();

            // Initial check
            checkUSDCTrust(address).then(trusted => {
                if (!trusted) {
                    addLog("error", "Prerequisite Missing", "Please complete the Swap Quest to trust USDC first.");
                } else {
                    setStep(2);
                }
            });

            // Get Ratio (1 XLM = ? USDC)
            getSoroswapRatio(address, native, usdc).then(r => {
                console.log("Pool Ratio:", r);
                setRatio(r);
                setUsdcAmount(parseFloat((10 * r).toFixed(2)));
            });
        }
    }, [address]);

    // Handle XLM Input Change -> Auto calc USDC
    const handleXlmChange = (val: string) => {
        const v = parseFloat(val);
        setXlmAmount(v);
        if (!isNaN(v) && ratio > 0) {
            setUsdcAmount(parseFloat((v * ratio).toFixed(2)));
        }
    };

    const handleApproveXLM = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            await approveToken(address, getNativeContractId(), xlmAmount);
            addLog("success", "XLM Approved", `Router can spend ${xlmAmount} XLM`);
            setApprovedXLM(true);
        } catch (e: any) {
            addLog("error", "Approve Failed", e.message);
        } finally { setIsLoading(false); }
    };

    const handleApproveUSDC = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            await approveToken(address, getUSDCContractId(), usdcAmount);
            addLog("success", "USDC Approved", `Router can spend ${usdcAmount} USDC`);
            setApprovedUSDC(true);
        } catch (e: any) {
            addLog("error", "Approve Failed", e.message);
        } finally { setIsLoading(false); }
    };

    const handleDeposit = async () => {
        if (!address) return;
        if (usdcAmount <= 0) {
            addLog("error", "Invalid Amount", "USDC amount cannot be zero. Ratio fetch failed?");
            return;
        }
        setIsLoading(true);
        addLog("info", "Adding Liquidity", `Depositing ${xlmAmount} XLM + ${usdcAmount} USDC...`);
        try {
            const hash = await addLiquidity(address, getNativeContractId(), getUSDCContractId(), xlmAmount, usdcAmount);
            addLog("success", "Liquidity Added!", "You are now a Market Maker.", hash);
            setTxHash(hash);

            // Refresh LP Balance
            getLPBalance(address).then(setLPBalance);

            setStep(4);
            setTimeout(onComplete, 2000);
        } catch (e: any) {
            addLog("error", "Deposit Failed", e.message);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <div className="p-3 bg-purple-900/30 rounded-full">
                    <Droplets className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Liquidity Lab</h2>
                    <p className="text-slate-400 text-xs">Provide liquidity to earn fees</p>
                </div>
                {/* LP Balance Display */}
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Your Position</p>
                    <p className="text-purple-400 font-mono text-sm">{lpBalance} LP-XLM-USDC</p>
                </div>
            </div>

            {step === 1 && <div className="text-center text-slate-400 animate-pulse">Initializing Pool Data...</div>}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in">

                    {/* Inputs */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                        <div className="bg-black p-4 rounded-lg border border-slate-800">
                            <label className="text-xs text-slate-500 mb-1 block">Input A</label>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">XLM</span>
                                <input
                                    type="number"
                                    value={xlmAmount}
                                    onChange={(e) => handleXlmChange(e.target.value)}
                                    className="bg-transparent text-right w-full text-white font-mono focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="text-slate-600 font-bold text-xl">+</div>

                        <div className="bg-black p-4 rounded-lg border border-slate-800">
                            <label className="text-xs text-slate-500 mb-1 block">Input B (Auto)</label>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-400">USDC</span>
                                <input
                                    type="number"
                                    value={usdcAmount}
                                    disabled
                                    className="bg-transparent text-right w-full text-slate-400 font-mono cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <InfoCard title="The Golden Rule: 50/50" icon={Divide}>
                        You cannot just add one token. A Liquidity Pool requires <b>equal value</b> of both assets to maintain the price ratio.
                        <br />
                        Current Ratio: <code>1 XLM ≈ {ratio.toFixed(2)} USDC</code>
                    </InfoCard>

                    {/* Approvals */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <RawButton
                            onClick={handleApproveXLM}
                            disabled={approvedXLM || isLoading}
                            variant={approvedXLM ? "success" : "primary"}
                            className="text-xs"
                        >
                            {approvedXLM ? <Check className="w-4 h-4" /> : "1. Approve XLM"}
                        </RawButton>

                        <RawButton
                            onClick={handleApproveUSDC}
                            disabled={approvedUSDC || isLoading}
                            variant={approvedUSDC ? "success" : "primary"}
                            className="text-xs"
                        >
                            {approvedUSDC ? <Check className="w-4 h-4" /> : "2. Approve USDC"}
                        </RawButton>
                    </div>

                    {/* Deposit Action */}
                    <div className="pt-2">
                        <RawButton
                            onClick={handleDeposit}
                            disabled={!approvedXLM || !approvedUSDC || isLoading}
                            variant="success"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Droplets className="w-4 h-4" />}
                            3. Deposit Liquidity
                        </RawButton>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-in zoom-in space-y-4 text-center">
                    <div className="p-5 bg-purple-500/20 rounded-full inline-block border border-purple-500/50">
                        <Percent className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">LP Tokens Received!</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        You now own a share of the XLM-USDC pool. Every time someone trades, you earn <b>0.3%</b>.
                    </p>
                </div>
            )}

        </div>
    );
}
