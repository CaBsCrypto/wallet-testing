"use client";

import { useState, useEffect } from "react";
import { QuestCard } from "./quest-card";
import { QuestView } from "./quest-view";
import { SwapLab } from "./swap-lab";
import { LPLab } from "./lp-lab";
import { NFTCreator } from "./nft-creator";
import { Shield, Zap, PenTool, BookOpen, Lock, Star, ChevronRight, Scale, Droplets, Wand2 } from "lucide-react";
import { useWallet } from "../../hooks/use-wallet";
import { claimBadge, getBadges } from "../../lib/pet-contract";
import { useTransactionLogger } from "../../contexts/transaction-context";

export interface Quest {
    id: string;
    title: string;
    description: string;
    tier: number;
    rewards: string;
    icon: any;
    badgeId: string;
    questions: any[];
    content: React.ReactNode;
    component?: React.ReactNode; // For interactive quests
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
            questions: [
                { id: 1, text: "What is a Private Key?", options: ["Public username", "Secret code for total control", "Email password"], correctIndex: 1 },
                { id: 2, text: "Share Seed Phrase with:", options: ["Support", "Websites", "No one"], correctIndex: 2 },
                { id: 3, text: "Lost Key means:", options: ["Lost Funds", "Recover via SMS", "Bank reset"], correctIndex: 0 }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">Welcome, Initiate. Rule #1: <strong>Self-Custody</strong>.</p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-purple-500">
                        <h4 className="font-bold text-white">Not Your Keys, Not Your Crypto</h4>
                        <p className="text-slate-400 text-sm">Your Private Key is the only way to access your funds. Lose it, and it's gone forever.</p>
                    </div>
                </div>
            )
        },
        {
            id: "the_signer",
            title: "The Signer",
            description: "How Digital Signatures work.",
            tier: 1,
            rewards: "🖋️ Signer Badge",
            icon: PenTool,
            badgeId: "signer",
            questions: [
                { id: 1, text: "Signing proves:", options: ["You know the password", "Ownership without revealing key", "Nothing"], correctIndex: 1 },
                { id: 2, text: "Can signatures be forged?", options: ["Yes", "Mathematically Impossible", "Maybe"], correctIndex: 1 }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">You don't send passwords. You <strong>sign</strong> transactions.</p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-pink-500">
                        <h4 className="font-bold text-white">Math Magic</h4>
                        <p className="text-slate-400 text-sm">Signatures prove you approved an action without showing your private key.</p>
                    </div>
                </div>
            )
        },
        {
            id: "gas_station",
            title: "Gas Station",
            description: "Network Fees and Gas costs.",
            tier: 2,
            rewards: "🧭 Explorer Badge",
            icon: Zap,
            badgeId: "explorer",
            questions: [
                { id: 1, text: "What is Gas?", options: ["Fuel", "Network Fee", " Electricity"], correctIndex: 1 },
                { id: 2, text: "Why fees?", options: ["Prevent Spam", "Profit", "Tax"], correctIndex: 0 }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">Blockchain space is limited. You pay rent (Gas) to use it.</p>
                </div>
            )
        },
        {
            id: "defi_101",
            title: "Liquidity 101",
            description: "AMMs, Pools, and Swaps explained.",
            tier: 2,
            rewards: "🎓 Scholar Badge",
            icon: BookOpen,
            badgeId: "scholar",
            questions: [
                { id: 1, text: "Liquidiy Pool is:", options: ["Water", "Smart Contract with Tokens", "Bank"], correctIndex: 1 },
                { id: 2, text: "Price determined by:", options: ["CEO", "Math (x*y=k)", "Stock Market"], correctIndex: 1 }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">DeFi uses <strong>AMMs</strong> instead of Order Books.</p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-cyan-500">
                        <h4 className="font-bold text-white">Robotic Trading</h4>
                        <p className="text-slate-400 text-sm">You trade against a pool of tokens. Math sets the price based on ratio.</p>
                    </div>
                </div>
            )
        },
        {
            id: "defi_trader",
            title: "The Trader",
            description: "Interactive Lab: Approve and Swap XLM for USDC on Soroswap.",
            tier: 3,
            rewards: "⚖️ Trader Badge + 100 XP",
            icon: Scale,
            badgeId: "trader",
            questions: [], // Interactive
            content: null,
            component: <SwapLab onComplete={handleQuestComplete} />
        },
        {
            id: "defi_lp",
            title: "Liquidity Provider",
            description: "Interactive Lab: Provide 50/50 Liquidity to earn fees.",
            tier: 3,
            rewards: "💧 Market Maker Badge + 200 XP",
            icon: Droplets,
            badgeId: "market_maker",
            questions: [],
            content: null,
            component: <LPLab onComplete={handleQuestComplete} />
        },
        {
            id: "nft_artist",
            title: "The Artist",
            description: "Gen AI Lab: Create and Mint your own Art Assets.",
            tier: 3,
            rewards: "🎨 Creator Badge + 500 XP",
            icon: Wand2,
            badgeId: "creator",
            questions: [],
            content: null,
            component: <NFTCreator onComplete={handleQuestComplete} />
        }
    ];

    const getStatus = (quest: Quest) => {
        if (ownedBadges.includes(quest.badgeId)) return 'completed';
        // Simple progression logic: 
        // Tier 1 always available.
        // Tier 2 needs at least 1 Tier 1 badge? (optional, for now all available)
        return 'available';
    };

    const tier1 = QUESTS.filter(q => q.tier === 1);
    const tier2 = QUESTS.filter(q => q.tier === 2);
    const tier3 = QUESTS.filter(q => q.tier === 3);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4 border-b-2 border-slate-800 pb-8">
                <h2 className="text-3xl font-bold text-white inline-flex items-center gap-3 font-mono tracking-tighter" style={{ fontFamily: '"Press Start 2P"' }}>
                    <BookOpen className="w-8 h-8 text-green-500" /> KNOWLEDGE_BASE
                </h2>
                <p className="text-green-600 max-w-2xl mx-auto font-mono text-sm">
                    &gt; ACCESSING ARCHIVE... <br />
                    &gt; COMPLETE MODULES TO DECRYPT DATA AND EARN SOULBOUND BADGES.
                </p>
            </div>

            {/* Tier 1 */}
            <TierSection title="LEVEL_01: INITIATE" sub="FUNDAMENTAL_PROTOCOLS" icon={Lock} quests={tier1} getStatus={getStatus} onClick={setSelectedQuest} color="green" />

            {/* Tier 2 */}
            <TierSection title="LEVEL_02: EXPLORER" sub="NETWORK_TOPOLOGY" icon={Star} quests={tier2} getStatus={getStatus} onClick={setSelectedQuest} color="cyan" />

            {/* Tier 3 */}
            <TierSection title="LEVEL_03: TRADER" sub="DECENTRALIZED_OPERATIONS" icon={Scale} quests={tier3} getStatus={getStatus} onClick={setSelectedQuest} color="pink" />

            {/* Coming Soon */}
            {/* <div className="opacity-50 text-center text-slate-500 text-sm">More tiers coming soon...</div> */}

            {/* Modal Logic */}
            {selectedQuest && (
                selectedQuest.component ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-2xl relative">
                            <button
                                onClick={() => setSelectedQuest(null)}
                                className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                Close Lab ✕
                            </button>
                            {selectedQuest.component}
                        </div>
                    </div>
                ) : (
                    <QuestView
                        title={selectedQuest.title}
                        content={selectedQuest.content}
                        questions={selectedQuest.questions}
                        onClose={() => setSelectedQuest(null)}
                        onComplete={handleQuestComplete}
                        isSubmitting={false}
                    />
                )
            )}
        </div>
    );
}

// Helper Component for Tier Sections to reduce duplication
// Helper Component for Tier Sections to reduce duplication
function TierSection({ title, sub, icon: Icon, quests, getStatus, onClick, color = "green" }: any) {
    const colorClasses: any = {
        green: "text-green-500 border-green-900",
        cyan: "text-cyan-500 border-cyan-900",
        pink: "text-pink-500 border-pink-900"
    };

    return (
        <div className="space-y-6">
            <div className={`flex items-center gap-4 border-b-2 ${colorClasses[color].split(' ')[1]} pb-2`}>
                <div className={`p-2 border-2 ${colorClasses[color]} bg-black`}>
                    <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
                </div>
                <div>
                    <h3 className={`text-xl font-bold ${colorClasses[color].split(' ')[0]} font-mono tracking-wider`}>{title}</h3>
                    <p className="text-slate-500 text-xs uppercase font-mono tracking-widest">&gt; {sub}</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.map((quest: Quest) => (
                    <QuestCard
                        key={quest.id}
                        id={quest.id}
                        tier={quest.tier}
                        title={quest.title}
                        description={quest.description}
                        rewards={quest.rewards}
                        icon={quest.icon}
                        status={getStatus(quest)}
                        onClick={() => onClick(quest)}
                    />
                ))}
            </div>
        </div>
    );
}
