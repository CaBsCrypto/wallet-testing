"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../../hooks/use-wallet";
import { useTransactionLogger } from "../../contexts/transaction-context";
import {
    approveToken,
    swapTokensOnly,
    getUSDCContractId,
    getNativeContractId,
    checkUSDCTrust,
    trustUSDC,
    getUSDCBalance,
    ROUTER_ADDRESS // Import Router Address
} from "../../lib/soroswap";
import { Loader2, Check, RefreshCw, Zap, ShieldCheck, Wallet, Coins, ExternalLink } from "lucide-react";

// ... (Rest of imports and RawButton)

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
    <div className="bg-blue-900/10 border border-blue-800/50 rounded-lg p-3 text-left">
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="w-4 h-4 text-blue-400" />}
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">{title}</h4>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
            {children}
        </p>
    </div>
);

export function SwapLab({ onComplete }: { onComplete: () => void }) {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();
    // Step 1: Trust, 2: Approve, 3: Swap, 4: Done
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [estimatedOut, setEstimatedOut] = useState("0.00");
    const [usdcBalance, setUsdcBalance] = useState("0.00");

    // ... (Existing state and effects)

    const refreshBalance = () => {
        if (address) {
            getUSDCBalance(address).then(setUsdcBalance);
        }
    };

    // Check Trust & Balance on Mount
    useEffect(() => {
        if (address) {
            refreshBalance();
            checkUSDCTrust(address).then(isTrusted => {
                if (isTrusted) {
                    console.log("USDC Trusted. Skipping Step 1.");
                    setStep(2); // Skip to Approve
                }
            });
        }
    }, [address]);

    // Estimate Output for Step 3
    useEffect(() => {
        if (address && step === 3) {
            import("../../lib/soroswap").then(m => {
                m.getEstimatedOutput(address, 10).then(setEstimatedOut);
            });
        }
    }, [address, step]);

    // Step 1: Trust USDC
    const handleTrust = async () => {
        if (!address) return;
        setIsLoading(true);
        addLog("info", "Enabling USDC", "Creating Trustline for USDC Asset...");
        try {
            await trustUSDC(address);
            addLog("success", "USDC Enabled!", "You can now hold USDC");
            setStep(2);
            setTimeout(refreshBalance, 2000);
        } catch (e: any) {
            addLog("error", "Trust Failed", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Approve
    const handleApprove = async () => {
        if (!address) return;
        setIsLoading(true);
        addLog("info", "Approving Router", "Allowing Soroswap to spend 10 XLM...");
        try {
            await approveToken(address, getNativeContractId(), 10);
            addLog("success", "Approved!", "Router can now spend your XLM");
            setStep(3);
        } catch (e: any) {
            // If error is "already approved", we could skip? But hard to detect reliably.
            addLog("error", "Approve Failed", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Swap
    const handleSwap = async () => {
        if (!address) return;
        setIsLoading(true);
        addLog("info", "Executing Swap", "Swapping 10 XLM -> USDC (Testnet)...");
        try {
            const usdcId = getUSDCContractId();
            const hash = await swapTokensOnly(address, getNativeContractId(), usdcId, 10);
            addLog("success", "Swap Complete!", "You traded XLM for USDC", hash);
            setTxHash(hash);
            setStep(4); // Victory
            setTimeout(() => {
                refreshBalance();
                onComplete();
            }, 2000); // Trigger quest completion
        } catch (e: any) {
            addLog("error", "Swap Failed", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-mono text-slate-400">
                            {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Not Connected'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i <= step ? (i < step || step === 4 ? "bg-green-500" : "bg-purple-500") : "bg-slate-800"}`} />
                    ))}
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-black border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Your USDC Balance</p>
                    <p className="text-2xl font-mono text-white tracking-widest">{usdcBalance}</p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-full">
                    <span className="text-2xl">💲</span>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="min-h-[220px] flex flex-col justify-center text-center space-y-4">

                {step === 1 && (
                    <div className="animate-in fade-in space-y-4">
                        <div className="p-4 bg-slate-800 rounded-full inline-block border border-slate-700">
                            <Coins className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Step 1: Enable USDC</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">
                            To swap for USDC, you must first enable "Trust" for the asset on your wallet.
                        </p>
                        <RawButton onClick={handleTrust} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                            Enable USDC Trading
                        </RawButton>
                        <InfoCard title="Why do I need to 'Trust'?" icon={ShieldCheck}>
                            Unlike Ethereum, Stellar requires you to explicitly <b>"Trust"</b> an asset before you can hold it. This prevents spam tokens from clogging your wallet and ensures you only receive assets you actually want.
                        </InfoCard>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in space-y-4">
                        <div className="p-4 bg-slate-800 rounded-full inline-block border border-slate-700">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Step 2: Approve Router</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">
                            Authorize the Soroswap Router to access 10 XLM from your wallet.
                        </p>
                        <RawButton onClick={handleApprove} disabled={isLoading} variant="start">
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            Approve 10 XLM
                        </RawButton>
                        <InfoCard title="Security Check: Allowances" icon={Zap}>
                            Smart Contracts cannot take your money without permission. You must sign an <b>"Approve"</b> transaction to let the Soroswap Router spend exactly 10 XLM. This protects the rest of your funds.
                        </InfoCard>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in space-y-4">
                        <div className="p-4 bg-slate-800 rounded-full inline-block border border-slate-700">
                            <RefreshCw className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Step 3: Swap</h3>



                        <div className="flex justify-center pb-2">
                            <span className="text-[10px] font-mono bg-yellow-900/40 text-yellow-500 border border-yellow-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Testnet Data
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">
                            Everything is ready. Execute the swap on the Soroswap Protocol.
                        </p>
                        <RawButton onClick={handleSwap} disabled={isLoading} variant="success">
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            Swap 10 XLM → {estimatedOut === "0.00" ? <span className="animate-pulse">Loading...</span> : `≈${estimatedOut} USDC`}
                        </RawButton>
                        <InfoCard title="How is price determined?" icon={RefreshCw}>
                            You are not trading with a person, but a <b>Liquidity Pool</b>. The protocol uses the formula <code>x * y = k</code> to automatically calculate the exchange rate based on supply and demand.
                        </InfoCard>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in zoom-in space-y-4">
                        <div className="p-5 bg-green-500/20 rounded-full inline-block border border-green-500/50">
                            <Check className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Swap Successful!</h3>
                        <p className="text-slate-400 text-sm">
                            You have completed the DeFi Trader module.
                        </p>
                        {txHash && (
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-4 text-xs font-mono text-green-400 underline hover:text-green-300 flex items-center justify-center gap-1"
                            >
                                <ExternalLink className="w-3 h-3" /> VERIFY ON SOROSWAP EXPLORER
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Protocol Verification Footer */}
            <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-600 uppercase font-mono mb-1">Passed via Soroswap Protocol</p>
                <code className="text-[10px] bg-black px-2 py-1 rounded text-purple-400 font-mono block truncate max-w-xs mx-auto border border-slate-800">
                    Router: {ROUTER_ADDRESS}
                </code>
            </div>
        </div >
    );
}
