"use client";

import { useState, useEffect } from "react";
import { QuestCard } from "./quest-card";
import { QuestView } from "./quest-view";
import { SwapLab } from "./swap-lab";
import { LPLab } from "./lp-lab";
import { NFTCreator } from "./nft-creator";
import { VaultLab } from "./vault-lab";

import {
    Check,
    Lock,
    Play,
    HelpCircle,
    Shield,
    Zap,
    PenTool,
    Scale,
    Briefcase,
    Droplets,
    Wand2,
    Cloud,
    Star,
    ArrowDown
} from "lucide-react";
import { useWallet } from "../../hooks/use-wallet";
import { claimBadge, getBadges } from "../../lib/pet-contract";
import { useTransactionLogger } from "../../contexts/transaction-context";
import { KeypairGenerator, MessageSigner, PhishingDetector, ImpermanentLossSim } from "./interactive-lessons";
import { AlertCircle } from "lucide-react";

export interface QuestModule {
    title?: string;
    content?: React.ReactNode;
    quiz?: {
        id: number;
        text: string;
        options: string[];
        correctIndex: number;
    }[];
    component?: React.ReactNode; // Allow full component modules
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    tier: number;
    rewards: string;
    icon: any;
    badgeId: string;
    modules: QuestModule[];
    color?: string; // Optional for now, but will be populated
}

export function AcademyHub() {
    const { address } = useWallet();
    const { addLog } = useTransactionLogger();
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);


    // Fetch Badges to determine completion status
    useEffect(() => {
        if (address) {
            console.log("Fetching badges for Academy...");
            getBadges(address).then(badges => {
                console.log("Badges fetched:", badges);
                setOwnedBadges(badges);
            });
        }
    }, [address, refreshTrigger]);

    const handleQuestComplete = async () => {
        if (!selectedQuest || !address) return;

        addLog('info', 'Claiming Quest Rewards', `Badge: ${selectedQuest.badgeId}`);
        try {
            const hash = await claimBadge(address, selectedQuest.badgeId);
            addLog('success', 'Badge Claimed!', `You earned the ${selectedQuest.title} badge`, hash);
            setRefreshTrigger(p => p + 1); // Refresh badges
        } catch (e: any) {
            addLog('error', 'Claim Failed', e.message);
            throw e;
        }
    };

    // QUESTS DEFINITION (Now accessing closure)
    const QUESTS: Quest[] = [
        {
            id: "the_guard",
            title: "The Guard",
            description: "Learn fundamentals of Wallet Security & Keys.",
            tier: 1,
            rewards: "🛡️ Initiate Badge",
            icon: Shield,
            badgeId: "initiate",
            modules: [
                {
                    title: "Keys & Custody",
                    content: (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                Welcome, Initiate. To safely navigate the Void, you must understand your <strong>Keys</strong>.
                            </p>

                            <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-blue-500">
                                <h4 className="font-bold text-white mb-2">Key Concepts</h4>
                                <ul className="list-disc ml-4 space-y-2 text-slate-400 text-sm">
                                    <li><strong>Public Key:</strong> Your address. Like an email address, you share this so people can find you.</li>
                                    <li><strong>Private Key:</strong> Your signature. Like a password, but if lost, cannot be reset.</li>
                                </ul>
                            </div>

                            <p className="text-slate-300">
                                Try generating a pair now. Notice how they are always created together.
                            </p>

                            <KeypairGenerator />

                            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                    <AlertCircle size={18} />
                                    CRITICAL RULE
                                </div>
                                <p className="text-red-200 text-sm">
                                    "Not Your Keys, Not Your Crypto." If you leave your assets on an exchange, they own the keys, not you.
                                </p>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "Which key is safe to share with others?", options: ["Private Key", "Public Key", "Both", "Neither"], correctIndex: 1 },
                        { id: 2, text: "What happens if you lose your Private Key?", options: ["Support resets it", "You lose access forever", "Use email backup"], correctIndex: 1 }
                    ]
                }
            ]
        },
        {
            id: "the_signer",
            title: "The Signer",
            description: "Understand Multi-sig security.",
            tier: 1,
            rewards: "✍️ Signer Badge + 100 XP",
            icon: PenTool,
            badgeId: "signer",
            color: "amber", // Warning/Caution = Amber
            modules: [
                {
                    title: "The Power of Signatures",
                    content: (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                On the blockchain, you don't "log in". You <strong>prove identity</strong> by signing messages.
                            </p>

                            <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-purple-500">
                                <h4 className="font-bold text-white mb-2">How it works</h4>
                                <p className="text-slate-400 text-sm mb-2">
                                    1. You write a message (transaction).<br />
                                    2. You "Sign" it with your Private Key.<br />
                                    3. The network uses your Public Key to verify the signature matches.
                                </p>
                            </div>

                            <p className="text-slate-300">
                                Experiment below. See how changing the message completely changes the signature.
                            </p>

                            <MessageSigner />
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "A digital signature proves:", options: ["You know the password", "You possess the private key", "You are online"], correctIndex: 1 },
                        { id: 2, text: "Can a signature be forged without the private key?", options: ["Yes, easily", "No, it's mathematically impossible", "Maybe with a fast computer"], correctIndex: 1 }
                    ]
                }
            ]
        },
        {
            id: "the_guardian",
            title: "The Guardian",
            description: "Advanced Phishing Detection Lab.",
            tier: 4,
            rewards: "🛡️ Guardian Badge + 500 XP",
            icon: Shield,
            badgeId: "guardian_pro",
            color: "red", // High Security = Red
            modules: [
                {
                    title: "Phishing 101",
                    content: (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                Hackers don't break encryption. They <strong>trick you</strong> into signing bad transactions.
                            </p>
                            <PhishingDetector />
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "A website asks for your Seed Phrase to 'Verify' wallet.", options: ["Provide it", "Ignore it", "Report & Block"], correctIndex: 2 }
                    ]
                }
            ]
        },
        {
            id: "stellar_pilot",
            title: "Stellar Pilot",
            description: "Learn Path Payments & Gas.",
            tier: 1,
            rewards: "🚀 Pilot Badge + 100 XP",
            icon: Zap,
            badgeId: "pilot",
            color: "orange", // Speed/Energy = Orange
            modules: [
                {
                    title: "Path Payments",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">Stellar can swap assets <strong>while sending</strong> them.</p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-orange-500">
                                <h4 className="font-bold text-white">Send USDC, Receiver gets XLM</h4>
                                <p className="text-slate-400 text-sm">The DEX finds the best path automatically. No need to swap manually first.</p>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "Path Payment allows:", options: ["Sending gasless tx", "Auto-swap during send", "Free money"], correctIndex: 1 }
                    ]
                }
            ]
        },
        {
            id: "defi_strategist",
            title: "DeFi Strategist",
            description: "Advanced yield mechanics & risks.",
            tier: 4,
            rewards: "📈 Strategist Badge",
            icon: Scale,
            badgeId: "strategist",
            color: "indigo", // Strategy/Brain = Indigo
            modules: [
                {
                    title: "Impermanent Loss",
                    content: (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                High yield comes with risks. If prices move too much, your LP position loses value vs holding.
                            </p>
                            <ImpermanentLossSim />
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "When does IL happen?", options: ["Prices stable", "Prices diverge", "Fees are high"], correctIndex: 1 }
                    ]
                }
            ]
        },
        {
            id: "gas_station",
            title: "Gas Station",
            description: "Network Fees and Gas costs.",
            tier: 2,
            rewards: "🧭 Explorer Badge",
            icon: Zap,
            badgeId: "explorer",
            color: "yellow", // Gas/Fuel = Yellow
            modules: [
                {
                    title: "Gas Fundamentals",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">Blockchain space is limited. You pay rent (Gas) to use it.</p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-yellow-500">
                                <h4 className="font-bold text-white">Why Fees?</h4>
                                <ul className="list-disc ml-4 space-y-2 text-slate-400 text-sm">
                                    <li><strong>Spam Prevention:</strong> Costs prevent attackers from flooding the network.</li>
                                    <li><strong>Validator Incentive:</strong> Fees pay the machines ensuring security.</li>
                                </ul>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "What is Gas?", options: ["Fuel", "Network Fee", " Electricity"], correctIndex: 1 },
                        { id: 2, text: "Why fees?", options: ["Prevent Spam", "Profit", "Tax"], correctIndex: 0 }
                    ]
                }
            ]
        },

        {
            id: "the_vault",
            title: "The Vault",
            description: "Learn Lending Markets & Earn Yield.",
            tier: 3,
            rewards: "🛡️ Guardian Badge + 150 XP",
            icon: Lock,
            badgeId: "guardian",
            color: "emerald", // Money/Safe = Green
            modules: [
                {
                    title: "Lending Protocols",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">
                                DeFi banks don't have bankers. <strong>Smart Contracts</strong> manage deposits and loans automatically.
                            </p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-blue-500">
                                <h4 className="font-bold text-white">How it works?</h4>
                                <ul className="list-disc ml-4 space-y-2 text-slate-400 text-sm">
                                    <li><strong>Over-collateralization:</strong> Borrowers must deposit more value than they borrow (e.g., Deposit $150 ETH to borrow $100 USDC).</li>
                                    <li><strong>Liquidation:</strong> If collateral value drops, it's sold to pay the debt.</li>
                                    <li><strong>Yield:</strong> Interest paid by borrowers goes to depositors (You!).</li>
                                </ul>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "Where does the Yield come from?", options: ["The government", "Borrower interest", "Magic"], correctIndex: 1 },
                        { id: 2, text: "What happens if collateral drops too low?", options: ["Bank calls you", "Liquidation", "Nothing"], correctIndex: 1 }
                    ]
                },
                {
                    title: "Vault Lab",
                    component: <VaultLab onComplete={handleQuestComplete} />
                }
            ]
        },
        {
            id: "defi_trader",
            title: "The Trader",
            description: "Master Decentralized Exchanges (DEX).",
            tier: 3,
            rewards: "⚖️ Trader Badge + 100 XP",
            icon: Scale,
            badgeId: "trader",
            color: "cyan", // Tech/Trading = Cyan
            modules: [
                {
                    title: "DEX Mechanics",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">
                                Traditional exchanges use an <strong>Order Book</strong> (Buyers meet Sellers). DeFi uses <strong>Liquidity Pools</strong>.
                            </p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-cyan-500">
                                <h4 className="font-bold text-white">Automated Market Maker (AMM)</h4>
                                <p className="text-slate-400 text-sm">
                                    You trade against a valid pool of tokens. The price is set mathematically based on the ratio of tokens in the pool.
                                </p>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "Who sets the price on a DEX?", options: ["The CEO", "Mathematical Formula (AMM)", "Wall Street"], correctIndex: 1 }
                    ]
                },
                {
                    title: "Swap Lab",
                    component: <SwapLab onComplete={handleQuestComplete} />
                }
            ]
        },
        {
            id: "defi_lp",
            title: "Liquidity Provider",
            description: "Earn Trading Fees by providing capital.",
            tier: 3,
            rewards: "💧 Market Maker Badge + 200 XP",
            icon: Droplets,
            badgeId: "market_maker",
            color: "blue", // Water/Liquidity = Blue
            modules: [
                {
                    title: "Becoming the Bank",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">
                                Traders pay a 0.3% fee on every swap. This fee goes to <strong>Liquidity Providers (LPs)</strong>.
                            </p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-indigo-500">
                                <h4 className="font-bold text-white">The Rule of Two</h4>
                                <p className="text-slate-400 text-sm">
                                    To be an LP, you must deposit equal value of <strong>both tokens</strong> (e.g., $50 XLM + $50 USDC).
                                </p>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "Who earns the trading fees?", options: ["Miners", "Liquidity Providers", "Developers"], correctIndex: 1 },
                        { id: 2, text: "What must you deposit?", options: ["One token", "Equal value of both tokens", "Any amount"], correctIndex: 1 }
                    ]
                },
                {
                    title: "LP Lab",
                    component: <LPLab onComplete={handleQuestComplete} />
                }
            ]
        },
        {
            id: "nft_artist",
            title: "The Artist",
            description: "Create and Mint Digital Assets.",
            tier: 3,
            rewards: "🎨 Creator Badge + 500 XP",
            icon: Wand2,
            badgeId: "creator",
            color: "purple", // Creativity/Magic = Purple
            modules: [
                {
                    title: "NFT Standards",
                    content: (
                        <div className="space-y-4">
                            <p className="text-lg text-slate-300">
                                NFTs are unique tokens. On Stellar, they are just assets with <strong>Metadata</strong>.
                            </p>
                            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-purple-500">
                                <h4 className="font-bold text-white">Metadata?</h4>
                                <p className="text-slate-400 text-sm">
                                    It's a JSON file (Name, Description, Image URL) linked to the token. This proves what the token represents.
                                </p>
                            </div>
                        </div>
                    ),
                    quiz: [
                        { id: 1, text: "What makes an NFT unique?", options: ["Price", "Metadata", "Mining"], correctIndex: 1 }
                    ]
                },
                {
                    title: "NFT Studio",
                    component: <NFTCreator onComplete={handleQuestComplete} />
                }
            ]
        }
    ];

    // Progression Logic
    const getStatus = (quest: Quest, index: number, allQuests: Quest[]) => {
        if (ownedBadges.includes(quest.badgeId)) return 'completed';

        // Locked Logic:
        // 1. Tier 1 is always unlocked.
        if (quest.tier === 1) return 'available';

        // 2. Higher tiers require requirements
        // Simple check: Is the previous quest completed? 
        // We sort quests by tier roughly, but let's just say "Order Matters" in the list.
        const prevQuest = allQuests[index - 1];
        if (prevQuest && ownedBadges.includes(prevQuest.badgeId)) {
            return 'available';
        }

        return 'locked';
    };

    // Flatten and Sort Quests for Path
    const pathQuests = [...QUESTS].sort((a, b) => a.tier - b.tier);

    // Calculate SVG Path
    // Zig-zag pattern: Start Center -> Right -> Left -> Right...
    // We need a dynamic height based on number of quests.
    // Each quest takes roughly 160px vertical space. 
    const itemHeight = 160;
    const totalHeight = pathQuests.length * itemHeight + 200;

    // Function to generate the wavy path string
    const generatePath = () => {
        let d = `M 320 0 `; // Start top center (assuming 640px width container)

        pathQuests.forEach((_, index) => {
            const y = (index * itemHeight) + 100;
            const isRight = index % 2 === 0; // First item goes Right
            const x = isRight ? 480 : 160;   // Zig to 480 or Zag to 160

            // Simple curve? Quadratic bezier
            // Control points?
            const prevY = y - itemHeight;
            const prevX = index === 0 ? 320 : (isRight ? 160 : 480);

            // Just a simple S-curve to the target point
            // This is tricky without exact math, let's use a simpler "Center Line" with wide stroke for now, 
            // OR simulate it with absolute positioning like before but use an SVG to draw the line between nodes.
        });
        return d;
    };

    return (
        <div className="relative min-h-screen py-24 px-4 mx-auto overflow-hidden bg-[#1c2e4a]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(#ffffff 2px, transparent 2px)`,
                backgroundSize: '32px 32px'
            }} />

            {/* Floating Clouds (Decorative) */}
            <div className="absolute top-20 left-10 opacity-20 animate-pulse delay-700">
                <Cloud size={120} />
            </div>
            <div className="absolute top-60 right-20 opacity-10 animate-pulse delay-1000">
                <Cloud size={90} />
            </div>
            <div className="absolute bottom-40 left-1/4 opacity-15 animate-pulse">
                <Cloud size={150} />
            </div>

            {/* Header */}
            <div className="relative z-10 text-center mb-12 space-y-2">
                <h1 className="text-5xl font-heading text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wide">
                    STELLAR ACADEMY
                </h1>
                <p className="text-blue-200 font-heading text-xl uppercase tracking-widest">World 1: The Basics</p>
            </div>





            {/* Modal Logic */}
            {selectedQuest && (
                <QuestView
                    title={selectedQuest.title}
                    modules={selectedQuest.modules}
                    onClose={() => setSelectedQuest(null)}
                    onComplete={handleQuestComplete}
                    isSubmitting={false}
                />
            )}

            <div className="space-y-32 relative max-w-2xl mx-auto py-20">
                {/* Connecting Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-slate-800/50 -translate-x-1/2 -z-10 rounded-full border-2 border-slate-700/50 border-dashed" />

                {/* START MARKER (Now at top) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center animate-bounce -mt-10">
                    <p className="font-heading text-slate-500 uppercase tracking-widest mb-2 text-xs">Start</p>
                    <ArrowDown className="mx-auto text-slate-500" size={24} />
                </div>

                {pathQuests.map((quest, index) => {
                    const status = getStatus(quest, index, pathQuests);
                    const isLocked = status === 'locked';
                    const isCompleted = status === 'completed';
                    const isNext = status === 'available' && !pathQuests[index - 1]?.badgeId || (pathQuests[index - 1] && ownedBadges.includes(pathQuests[index - 1].badgeId) && !ownedBadges.includes(quest.badgeId));

                    // Zig-zag layout: Even = Left, Odd = Right
                    const isLeft = index % 2 === 0;

                    return (
                        <div
                            key={quest.id}
                            id={`quest-${quest.id}`}
                            className={`relative flex items-center ${isLeft ? 'justify-end md:pr-48' : 'justify-start md:pl-48'} w-full group py-4`}
                        >

                            {/* Quest Node (Center) */}
                            <div className={`absolute left-1/2 -translate-x-1/2 z-10 group ${isNext ? 'scale-110' : ''}`}>
                                <button
                                    onClick={() => !isLocked && setSelectedQuest(quest)}
                                    disabled={isLocked}
                                    className={`
                                        w-28 h-28 rounded-[2.5rem] flex items-center justify-center border-b-[8px] transition-all duration-150 active:border-b-0 active:translate-y-2 relative 
                                        ${isCompleted ? 'bg-yellow-400 border-yellow-600 text-black shadow-[0_8px_0_rgb(202,138,4)]' :
                                            isLocked ? 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed shadow-[0_8px_0_rgb(30,41,59)]' :
                                                // Dynamic Color Logic:
                                                `bg-${quest.color}-500 border-${quest.color}-700 shadow-[0_8px_0_rgba(0,0,0,0.3)] text-white hover:brightness-110`
                                        }
                                        ${isNext ? 'animate-bounce-slow ring-4 ring-white ring-offset-4 ring-offset-slate-900' : ''}
                                    `}
                                >
                                    {/* Shimmer Effect for Active Quests */}
                                    {!isLocked && !isCompleted && (
                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite] rounded-[2.5rem]" />
                                    )}

                                    {isCompleted ? <Check size={40} strokeWidth={4} className="animate-in zoom-in spin-in duration-500 relative z-10" /> :
                                        isLocked ? <Lock size={28} className="relative z-10 opacity-50" /> :
                                            <quest.icon size={36} strokeWidth={2.5} className="group-hover:scale-125 transition-transform duration-300 relative z-10 animate-[bounce_3s_infinite]" />}

                                    {/* Star Rating for Tier 4 */}
                                    {quest.tier === 4 && !isLocked && (
                                        <div className="absolute -top-4 -right-4 text-yellow-400 animate-pulse z-20">
                                            <Star size={36} fill="currentColor" className="drop-shadow-lg" />
                                        </div>
                                    )}

                                    {/* INTEGRATED LABEL (Pill Style) */}
                                    <div className={`
                                        absolute -bottom-5 left-1/2 -translate-x-1/2 
                                        bg-white text-slate-900 border-4 border-slate-200 
                                        px-3 py-1 rounded-full whitespace-nowrap z-20 shadow-md
                                        flex flex-col items-center justify-center
                                        transition-transform duration-300 group-hover:scale-105
                                        ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}
                                    `}>
                                        <span className="text-xs font-heading font-black uppercase tracking-wider">{quest.title}</span>
                                    </div>
                                </button>
                            </div>

                            {/* Decorative Elements on Sides */}
                            <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-10' : 'right-10'} opacity-20 transform ${isLeft ? '-rotate-12' : 'rotate-12'}`}>
                                {isLocked ? <Lock size={80} /> : <quest.icon size={80} className={`text-${quest.color}-400`} />}
                            </div>

                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-20 space-y-4 pb-20">
                <Cloud className="inline-block text-slate-700 opacity-50 animate-bounce" size={64} />
                <p className="text-slate-500 font-heading uppercase tracking-widest text-sm">More Worlds Coming Soon...</p>
            </div>
        </div>
    );
}
