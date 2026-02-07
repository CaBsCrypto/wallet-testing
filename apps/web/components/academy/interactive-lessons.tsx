"use client";

import { useState } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import { RefreshCw, Lock, Unlock, Copy, Check, PenTool, Hash, Scale } from 'lucide-react';

export function KeypairGenerator() {
    const [keypair, setKeypair] = useState<{ pub: string, sec: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const kp = Keypair.random();
        setKeypair({
            pub: kp.publicKey(),
            sec: kp.secret()
        });
    };

    const copySecret = () => {
        if (keypair) {
            navigator.clipboard.writeText(keypair.sec);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                        <Lock size={20} />
                    </span>
                    Keypair Generator
                </h3>
                <button
                    onClick={generate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <RefreshCw size={16} /> Generate New
                </button>
            </div>

            {!keypair ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
                    Click generate to create a fresh identity
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    {/* Public Key */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-bold uppercase tracking-wider">
                            <Unlock size={14} /> Public Key (Username)
                        </div>
                        <div className="bg-black p-3 rounded border border-green-900/50 break-all font-mono text-green-100 text-xs">
                            {keypair.pub}
                        </div>
                        <p className="text-[10px] text-slate-400">Safe to share. People use this to send you money.</p>
                    </div>

                    {/* Secret Key */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider">
                            <Lock size={14} /> Private Key (Password)
                        </div>
                        <div className="bg-red-950/20 p-3 rounded border border-red-900/50 flex justify-between items-center gap-2 group">
                            <span className="break-all font-mono text-red-200 text-xs blur-[2px] group-hover:blur-0 transition-all select-all">
                                {keypair.sec}
                            </span>
                            <button
                                onClick={copySecret}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Copy Secret"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-red-400 font-bold">
                            NEVER SHARE THIS. Access to this key = Total control of funds.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function MessageSigner() {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');

    const sign = () => {
        if (!message) return;
        // Mock SHA-256 like signature for visual demo
        // In real app we would use Keypair.sign()
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const mockSig = "SIG_" + Math.abs(hash).toString(16) + "x" + Date.now().toString(36).toUpperCase();
        setSignature(mockSig);
    };

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                    <PenTool size={20} />
                </span>
                <h3 className="text-white font-bold text-lg">Digital Signer</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Message to Sign</label>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setSignature(''); // Reset on change
                        }}
                        placeholder="e.g., Pay 10 XLM to Alice"
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={sign}
                        disabled={!message}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold transition-all"
                    >
                        Sign Message
                    </button>
                </div>

                {signature && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                        <label className="text-slate-400 text-xs uppercase font-bold flex items-center gap-2">
                            <Hash size={12} /> Generated Signature
                        </label>
                        <div className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-lg font-mono text-purple-300 break-all text-sm">
                            {signature}
                        </div>
                        <p className="text-[10px] text-slate-500">
                            This signature is unique to the message. Changing even one letter will produce a completely different signature.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function PhishingDetector() {
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [currentCase, setCurrentCase] = useState(0);
    const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

    const cases = [
        { url: "stellar.org", isSafe: true, reason: "Official Domain" },
        { url: "ste11ar.org", isSafe: false, reason: "Homoglyph Attack (1 instead of l)" },
        { url: "lobster.co", isSafe: false, reason: "Unofficial TLD (Real is .id or app)" },
        { url: "my-wallet-verify.com", isSafe: false, reason: "Generic phishing keywords" },
        { url: "soroban.stellar.org", isSafe: true, reason: "Valid Subdomain" }
    ];

    const check = (isSafeGuess: boolean) => {
        const actual = cases[currentCase].isSafe;
        if (isSafeGuess === actual) {
            setScore(s => s + 1);
            setShowResult('correct');
        } else {
            setShowResult('wrong');
        }
        setAttempts(a => a + 1);

        setTimeout(() => {
            setShowResult(null);
            if (currentCase < cases.length - 1) {
                setCurrentCase(c => c + 1);
            } else {
                // End of game logic could go here
            }
        }, 1500);
    };

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="bg-red-500/20 text-red-400 p-2 rounded-lg">
                        <Lock size={20} />
                    </span>
                    Phishing Detector v1.0
                </h3>
                <div className="text-xs font-mono text-slate-400">
                    Score: {score}/{cases.length}
                </div>
            </div>

            {currentCase < cases.length ? (
                <div className="space-y-6 text-center py-4">
                    <div className="text-sm text-slate-400 uppercase tracking-widest">Analyze this URL</div>

                    <div className="bg-black p-6 rounded-2xl border-2 border-slate-700 shadow-inner">
                        <code className="text-2xl text-white font-mono">{cases[currentCase].url}</code>
                    </div>

                    {showResult ? (
                        <div className={`p-4 rounded-xl font-bold animate-in zoom-in ${showResult === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {showResult === 'correct' ? "✅ Correct Analysis!" : "❌ Incorrect!"}
                            <p className="text-xs mt-1 text-slate-300">{cases[currentCase].reason}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => check(true)}
                                className="bg-green-900/30 hover:bg-green-900/50 border border-green-500/50 text-green-400 py-4 rounded-xl font-bold transition-all hover:scale-105"
                            >
                                ✅ Looks Safe
                            </button>
                            <button
                                onClick={() => check(false)}
                                className="bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 text-red-400 py-4 rounded-xl font-bold transition-all hover:scale-105"
                            >
                                ⚠️ Suspicious
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 space-y-4">
                    <h4 className="text-2xl text-white font-bold">Training Complete</h4>
                    <p className="text-slate-400">You identified {score} out of {cases.length} threats correctly.</p>
                    <button
                        onClick={() => { setCurrentCase(0); setScore(0); setAttempts(0); }}
                        className="text-blue-400 hover:text-white underline"
                    >
                        Restart Training
                    </button>
                </div>
            )}
        </div>
    );
}

export function ImpermanentLossSim() {
    const [priceChange, setPriceChange] = useState(0); // Percentage change

    // Simplify IL formula for 50/50 pool: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
    const calculateIL = (percent: number) => {
        const ratio = (100 + percent) / 100;
        if (ratio <= 0) return -100;
        const il = (2 * Math.sqrt(ratio) / (1 + ratio)) - 1;
        return (il * 100).toFixed(2);
    };

    const ilValue = calculateIL(priceChange);

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg">
                    <Scale size={20} />
                </span>
                <h3 className="text-white font-bold text-lg">Impermanent Loss Simulator</h3>
            </div>

            <div className="space-y-8">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Token Price Change</span>
                        <span className={`font-bold ${priceChange > 0 ? 'text-green-400' : priceChange < 0 ? 'text-red-400' : 'text-white'}`}>
                            {priceChange > 0 ? '+' : ''}{priceChange}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-90"
                        max="500"
                        value={priceChange}
                        onChange={(e) => setPriceChange(Number(e.target.value))}
                        className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                        <span>-90%</span>
                        <span>0%</span>
                        <span>+500%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-4 rounded-xl border border-slate-800 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Held in Wallet</div>
                        <div className="text-xl text-white font-mono">
                            {priceChange === 0 ? "$1000" : "Varies"}
                        </div>
                    </div>
                    <div className="bg-black p-4 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Held in LP</div>
                        <div className={`text-xl font-mono font-bold ${Number(ilValue) < -5 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                            {ilValue}%
                        </div>
                        <div className="text-[10px] text-red-400 mt-1">vs Holding</div>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-300">
                    <p>
                        <strong>Insight:</strong> If the price of one token changes significantly relative to the other, you lose money compared to just holding the tokens.
                    </p>
                </div>
            </div>
        </div>
    );
}
