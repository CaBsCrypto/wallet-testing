"use client";

import { useWallet } from "../hooks/use-wallet";
import { usePet } from "../hooks/use-pet";
import { useState, useEffect, useRef } from "react";
import { QuestCard } from "./academy/quest-card";
import { QuestView } from "./academy/quest-view";
import { claimBadge, getBadges } from "../lib/pet-contract";
import { PawPrint, Zap, Trophy, Crown, Dumbbell, Activity, Brain, ShoppingBag, Coins, Flame, Droplets, Leaf, Search, Gem, Skull, Wind, Grid3X3, Gamepad2, GraduationCap, Shield, PenTool } from "lucide-react";
import { Game2048 } from "./game-2048";
import { GamePool } from "./game-pool";
import { BadgeGallery } from "./badge-gallery";

export function GameDashboard() {
    const { isConnected, connect, address } = useWallet();
    const { pet, stats, isLoading, error, mint, trainAttribute, battle, hunt, evolve, buyEnergyPotion, buySmallEnergyPotion, release, submitScore } = usePet();
    const [petName, setPetName] = useState("");
    const [lastTx, setLastTx] = useState<string | null>(null);
    const [huntGrid, setHuntGrid] = useState<Array<{ revealed: boolean, selected: boolean, content: 'gem' | 'trap' | 'dust' | null }>>(Array(9).fill({ revealed: false, selected: false, content: null }));
    const [isHunting, setIsHunting] = useState(false);

    // Navigation State
    const [mainSection, setMainSection] = useState<'entertainment' | 'academy'>('entertainment');
    const [activeGame, setActiveGame] = useState<'arena' | 'hunt' | '2048' | 'pool'>('arena');
    const [activeAcademyTab, setActiveAcademyTab] = useState<'badges' | 'quests'>('badges');

    // Academy State
    const [activeQuest, setActiveQuest] = useState<string | null>(null);
    const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
    const [isLoadingBadges, setIsLoadingBadges] = useState(false);

    // Fetch badges on mount/update
    useEffect(() => {
        const fetchBadges = async () => {
            if (address && isConnected) {
                // setIsLoadingBadges(true);
                try {
                    const badges = await getBadges(address);
                    setOwnedBadges(badges);
                } catch (e) {
                    console.error("Failed to fetch badges", e);
                }
                // setIsLoadingBadges(false);
            }
        };
        fetchBadges();
    }, [address, isConnected, lastTx]);

    const QUESTS = [
        {
            id: "the_guard",
            title: "The Guard",
            description: "Learn the fundamentals of Wallet Security, Private Keys, and how to keep your assets safe from phishers.",
            tier: 1,
            rewards: "🛡️ Initiate Badge + 50 XP",
            icon: Shield,
            badgeId: "initiate",
            questions: [
                {
                    id: 1,
                    text: "What is a Private Key?",
                    options: [
                        "A public username anyone can see.",
                        "A secret code that grants total control over your funds.",
                        "A password you can reset via email.",
                    ],
                    correctIndex: 1
                },
                {
                    id: 2,
                    text: "You should share your Seed Phrase with:",
                    options: [
                        "Customer Support agents.",
                        "Websites asking to 'resync' your wallet.",
                        "Absolutely no one, ever.",
                    ],
                    correctIndex: 2
                },
                {
                    id: 3,
                    text: "What happens if you lose your Private Key?",
                    options: [
                        "You lose access to your funds forever.",
                        "You can recover it with your phone number.",
                        "The bank can restore it for you.",
                    ],
                    correctIndex: 0
                }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">
                        Welcome, Initiate. Your first step into Web3 is understanding <strong>Self-Custody</strong>.
                    </p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-purple-500">
                        <h4 className="font-bold text-white mb-2">Not Your Keys, Not Your Crypto</h4>
                        <p className="text-slate-400 text-sm">
                            Unlike a bank, a crypto wallet behaves like a digital safe. The <strong>Private Key</strong> (or Seed Phrase) is the only key to that safe.
                            If you lose it, your money is gone. If someone else steals it, your money is gone.
                        </p>
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Never share your seed phrase.</li>
                        <li>Don't store keys in screenshots or cloud notes.</li>
                        <li>Verify every site you connect to.</li>
                    </ul>
                </div>
            )
        },
        {
            id: "the_signer",
            title: "The Signer",
            description: "Understand how Digital Signatures prove ownership without revealing your private key.",
            tier: 1,
            rewards: "🖋️ Signer Badge + 50 XP",
            icon: PenTool,
            badgeId: "signer",
            questions: [
                {
                    id: 1,
                    text: "What does signing a transaction do?",
                    options: [
                        "It encrypts your password.",
                        "It proves you approved the action without revealing your key.",
                        "It sends your private key to the blockchain.",
                    ],
                    correctIndex: 1
                },
                {
                    id: 2,
                    text: "Can someone forge your signature without your private key?",
                    options: [
                        "Yes, if they have your public key.",
                        "No, it is mathematically impossible.",
                        "Maybe, if they guess your password.",
                    ],
                    correctIndex: 1
                }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">
                        You have the Key. Now, how do you use it?
                    </p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-pink-500">
                        <h4 className="font-bold text-white mb-2">Digital Signatures</h4>
                        <p className="text-slate-400 text-sm">
                            When you send crypto, you don't send your password. You <strong>sign</strong> the transaction.
                            This creates a unique mathematical proof that says "The owner of this wallet approved this specific action."
                        </p>
                    </div>
                    <p className="text-slate-400">
                        The magic is that anyone can verify the signature using your Public Key, but <strong>no one can create it</strong> without your Private Key.
                    </p>
                </div>
            )
        },
        {
            id: "gas_station",
            title: "Gas Station",
            description: "Why do transactions cost money? Learn about Network Fees and Gas.",
            tier: 2,
            rewards: "🧭 Explorer Badge + 50 XP",
            icon: Zap,
            badgeId: "explorer",
            questions: [
                {
                    id: 1,
                    text: "What is 'Gas' in Web3?",
                    options: [
                        "Fuel for your physical car.",
                        "A fee paid to validators to process your transaction.",
                        "The electricity cost of your computer.",
                    ],
                    correctIndex: 1
                },
                {
                    id: 2,
                    text: "Why do fees exist?",
                    options: [
                        "To prevent spam and pay for network security.",
                        "To make the developers rich.",
                        "It is a bank tax.",
                    ],
                    correctIndex: 0
                }
            ],
            content: (
                <div className="space-y-4">
                    <p className="text-lg text-slate-300">
                        Nothing moves for free. The blockchain is a shared computer, and "Gas" is the rent you pay to use it.
                    </p>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-green-500">
                        <h4 className="font-bold text-white mb-2">Limits & Spam</h4>
                        <p className="text-slate-400 text-sm">
                            If transactions were free, someone could spam the network with infinite junk, clogging it for everyone.
                            Fees ensure that every action has a cost, keeping the network efficient.
                        </p>
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>High traffic = Higher fees (usually).</li>
                        <li>Complex actions (like smart contracts) cost more gas.</li>
                    </ul>
                </div>
            )
        }
    ];

    const handleQuestComplete = async (badgeId: string) => {
        if (!address) return;
        const hash = await claimBadge(address, badgeId);
        if (hash) {
            setLastTx(hash);
        }
    };

    // ... rest of state
    const [selectedDesign, setSelectedDesign] = useState("dragon");
    const PetDesigns = ["dragon", "phoenix", "golem", "spirit"];


    const handleMint = async () => {
        const hash = await mint(petName);
        if (hash) setLastTx(hash);
    };

    // const handleTrain = async () => {
    //     const hash = await train();
    //     if (hash) setLastTx(hash);
    // };

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

    const MAX_SELECTION = 3;

    const handleGame2048Over = async (score: number) => {
        if (score === 0) return;

        if (stats && stats.energy < 20) {
            alert(`Game Over! Score: ${score}\n\n⚠️ Not enough Energy (20 required) to claim rewards.\nBuy a potion and try again!`);
            return;
        }

        const hash = await submitScore(score, "2048");
        if (hash) {
            setLastTx(hash);
            alert(`Game Over! Score: ${score}\n\nSubmitting to contract... Rewards will appear shortly!`);
        }
    };

    const toggleTileSelection = (index: number) => {
        if (isHunting || huntGrid[index].revealed) return;

        const newGrid = [...huntGrid];
        const isSelected = newGrid[index].selected;
        const currentSelected = newGrid.filter(c => c.selected).length;

        if (!isSelected && currentSelected >= MAX_SELECTION) {
            // Optional: Add a shake effect or toast here
            return;
        }

        const cell = { ...newGrid[index], selected: !isSelected };
        newGrid[index] = cell;
        setHuntGrid(newGrid);
    }

    // Calculate total energy cost based on selected tiles
    const selectedCount = huntGrid.filter(c => c.selected).length;
    const huntCost = selectedCount * 5;

    const handleBatchHunt = async () => {
        if (!stats) return;

        const selectedIndices = huntGrid.map((cell, idx) => cell.selected ? idx : -1).filter(idx => idx !== -1);
        console.log("Starting Batch Hunt with", selectedIndices);

        if (selectedIndices.length === 0) return;
        if (stats.energy < huntCost) {
            alert("Not enough energy!");
            return;
        }

        setIsHunting(true);

        try {
            // Call contract with array of indices
            console.log("Calling contract...");
            const hash = await hunt(selectedIndices);
            console.log("Tx Hash:", hash);

            if (hash) {
                setLastTx(hash);

                // Wait a moment for the chain to update, then fetch new stats
                // We need to wait because the node might be slightly behind the tx confirmation
                setTimeout(async () => {
                    // Fetch fresh stats to see the TRUE result
                    // We can't use the simple 'stats' variable here because it's from the render cycle
                    // We need to fetch from chain again. 
                    // However, usePet hook does this automatically every 4s, or we can trigger it.
                    // Let's rely on the fact that usePet will update 'stats' soon.
                    // But to show the IMMEDIATE summary, we must wait for that update.

                    // Actually, a safer way for the MVP is to just tell the user to check their balance,
                    // OR we can guess the visual but warn them it's a "simulation".

                    // BUT, the user explicitly complained about the mismatch.
                    // So we MUST NOT show a fake result that implies a specific reward.

                    // Alternative: Show "Result: Transaction Confirmed!" and reveal the tiles as "Mined" (generic),
                    // then let the balance update speak for itself.

                    // Better: Reveal "Unknown" or just "Revealed" until we can verify?
                    // No, that's boring.

                    // Let's try to simulate the result LOCALLY using the same math if possible?
                    // No, we don't have the Ledger Sequence.

                    // BEST UX: Assume the user wants to see *something*.
                    // We will show the "Simulated" results but add a disclaimer:
                    // "Network validating archeology results... Balance will update shortly."

                    // Wait! usage of `nativeToScVal` for the vector might have been the fix for functioning,
                    // but the "missing gold" is definitely the random mismatch.

                    // Let's calculate the result based on the stats difference if we can trigger a refetch.
                    // But we can't await strict refetch easily here in the event handler without exposing `fetchPet`.
                    // The `hunt` function in `usePet` calls `fetchPet` after 4000ms.

                    // Let's update the alert to be honest.
                    const newGrid = [...huntGrid];
                    selectedIndices.forEach(idx => {
                        // We genuinely don't know the result yet. 
                        // Show a question mark or a "checked" state? 
                        // Let's just randomize it but say "Possible result"
                        // OR, just simply don't show specific gems/traps, just "Revealed".
                        // This might be disappointing but accurate.

                        // Let's try the "Honest Delta" approach if we were inside the hook.
                        // Since we are outside, let's just show a successful "Dig" message.

                        // "Digging successful! Check your balance for Gems (Gold) or Dust (XP)."
                        newGrid[idx] = { ...newGrid[idx], revealed: true, selected: false, content: null };
                        // Content null removes the icon. use a new 'checked' content?
                    });
                    setHuntGrid(newGrid);

                    alert("Digging Successful!\n\nCheck your Gold and XP balance to see what you found!");
                }, 1000);

            } else {
                console.error("Hunt returned null hash");
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





    const handleEvolve = async (design: string) => {
        const hash = await evolve(design);
        if (hash) setLastTx(hash);
    };

    const handleRelease = async () => {
        if (!confirm("Are you sure you want to release your pet? This cannot be undone!")) return;
        const hash = await release();
        if (hash) setLastTx(hash);
    };


    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Welcome to Pet Legends
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center">
                    Connect your wallet to start your journey. Mint a pet, train it, and watch it evolve!
                </p>
                <button
                    onClick={connect}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8"
                >
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
            </div>
        );
    }

    if (isLoading && !pet) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-lg animate-pulse">Loading Pet Data...</p>
            </div>
        )
    }

    if (!pet) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto mt-10 p-6 bg-slate-900 border-slate-800">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold tracking-tight text-2xl">Create Your Companion</h3>
                    <p className="text-sm text-muted-foreground">You don't have a pet yet. Mint one to begin!</p>
                </div>
                <div className="p-6 pt-0">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Pet Name</label>
                            <input
                                id="name"
                                placeholder="Ex. Rocky"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0">
                    <button
                        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleMint}
                        disabled={!petName || isLoading}
                    >
                        {isLoading ? "Minting..." : "Mint Pet"}
                    </button>
                </div>
            </div>
        );
    }

    // Calculate generic progress for MVP (e.g. XP / 100)
    const progress = pet.xp;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Pet Status Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-2 bg-slate-900 border-slate-800">
                <div className="flex flex-col space-y-1.5 p-6 flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="font-semibold tracking-tight text-2xl">{pet.name}</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-lg px-3 py-1 text-slate-200 border-slate-700">
                        <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                        Lvl {pet.level}
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center space-y-6 py-4">
                        {/* Design / Avatar Placeholder */}
                        <div className="h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-float">
                            <span className="text-4xl">
                                {pet.design === "egg" ? "🥚" : "🐉"}
                            </span>
                        </div>

                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground text-slate-400">Experience</span>
                                <span className="font-bold text-slate-200">{pet.xp} / 100 XP</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full w-full flex-1 bg-indigo-500 transition-all" style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}></div>
                            </div>
                        </div>

                        {/* Stats & Energy */}
                        {stats && (
                            <div className="w-full space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs uppercase text-slate-400 font-bold">
                                        <span>Energy</span>
                                        <span className={stats.energy < 20 ? "text-red-500" : "text-green-400"}>{stats.energy} / 100</span>
                                    </div>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                        <div className="h-full w-full flex-1 bg-green-500 transition-all" style={{ transform: `translateX(-${100 - stats.energy}%)` }}></div>
                                    </div>
                                    <div className="flex items-center space-x-1 justify-end pt-1">
                                        <Coins className="h-4 w-4 text-yellow-500" />
                                        <span className="text-yellow-400 font-bold">{stats.gold} Gold</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Dumbbell className="h-4 w-4 text-red-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.strength}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">STR</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Activity className="h-4 w-4 text-blue-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.agility}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">AGI</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                                        <Brain className="h-4 w-4 text-purple-400 mb-1" />
                                        <span className="text-sm font-bold text-slate-200">{stats.intelligence}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">INT</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 px-1">
                                    <span>Wins: {stats.wins}</span>
                                    <span>Losses: {stats.losses}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center p-3 bg-slate-800 rounded-lg">
                                <span className="text-xs text-muted-foreground uppercase text-slate-400">Design</span>
                                <span className="font-semibold capitalize text-slate-200">{pet.design}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-slate-800 rounded-lg">
                                <span className="text-xs text-muted-foreground uppercase text-slate-400">Owner</span>
                                <span className="font-mono text-xs truncate max-w-[100px] text-slate-200">{pet.owner}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-slate-900 border-slate-800 h-fit">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold tracking-tight text-2xl">Actions</h3>
                    <p className="text-sm text-muted-foreground text-slate-400">Interact with your pet</p>
                </div>
                <div className="p-6 space-y-4 pt-0">
                    {/* Training Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("str")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Dumbbell className="h-5 w-5 mb-1 text-red-500" />
                            <span className="text-[10px] uppercase font-bold">Strength</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("agi")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Activity className="h-5 w-5 mb-1 text-blue-500" />
                            <span className="text-[10px] uppercase font-bold">Agility</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                        <button
                            className="inline-flex flex-col items-center justify-center p-2 rounded-md transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                            onClick={() => handleTrainStats("int")}
                            disabled={isLoading || (stats ? stats.energy < 10 : false)}
                        >
                            <Brain className="h-5 w-5 mb-1 text-purple-500" />
                            <span className="text-[10px] uppercase font-bold">Intellect</span>
                            <span className="text-[9px] text-slate-500">-10 Energy</span>
                        </button>
                    </div>

                    {/* MAIN NAVIGATION SWITCHER */}
                    <div className="flex p-1 bg-slate-900/50 rounded-xl border border-slate-800 mb-4">
                        <button
                            onClick={() => setMainSection('entertainment')}
                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${mainSection === 'entertainment'
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <Gamepad2 className="w-4 h-4" />
                            Entertainment
                        </button>
                        <button
                            onClick={() => setMainSection('academy')}
                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${mainSection === 'academy'
                                ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-white border border-purple-500/30 shadow-md'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Academy
                        </button>
                    </div>

                    {/* === ENTERTAINMENT SUB-TABS === */}
                    {mainSection === 'entertainment' && (
                        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg mb-4 overflow-x-auto">
                            <button
                                onClick={() => setActiveGame('arena')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-bold uppercase rounded-md transition-all ${activeGame === 'arena'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Trophy className="h-3 w-3 mr-1" />
                                Arena
                            </button>
                            <button
                                onClick={() => setActiveGame('hunt')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-bold uppercase rounded-md transition-all ${activeGame === 'hunt'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Search className="h-3 w-3 mr-1" />
                                Hunt
                            </button>
                            <button
                                onClick={() => setActiveGame('2048')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-bold uppercase rounded-md transition-all ${activeGame === '2048'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Grid3X3 className="h-3 w-3 mr-1" />
                                2048
                            </button>
                            <button
                                onClick={() => setActiveGame('pool')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-bold uppercase rounded-md transition-all ${activeGame === 'pool'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Zap className="h-3 w-3 mr-1" />
                                Pool
                            </button>
                        </div>
                    )}

                    {/* Pool Game */}
                    {mainSection === 'entertainment' && activeGame === 'pool' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <GamePool />
                        </div>
                    )}

                    {/* Academy Content */}
                    {mainSection === 'academy' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Web3 Academy
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    Master the blockchain arts and earn Soulbound Badges.
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-slate-900 to-purple-950/30 p-6 rounded-2xl border border-purple-500/20 text-center">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                    Web3 Academy
                                </h2>
                                <p className="text-slate-400 max-w-lg mx-auto">
                                    Journey through the 4 Tiers of Blockchain Mastery.
                                </p>
                            </div>

                            {/* Academy Sub-Tabs */}
                            <div className="flex border-b border-slate-800 mb-4">
                                <button
                                    onClick={() => setActiveAcademyTab('badges')}
                                    className={`px-6 py-2 text-sm font-bold border-b-2 transition-all ${activeAcademyTab === 'badges'
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    Badge Collection
                                </button>
                                <button
                                    onClick={() => setActiveAcademyTab('quests')}
                                    className={`px-6 py-2 text-sm font-bold border-b-2 transition-all ${activeAcademyTab === 'quests'
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    Active Quests
                                </button>
                            </div>

                            {activeAcademyTab === 'badges' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            Your Badge Collection
                                        </h3>
                                        <BadgeGallery />
                                    </div>
                                </div>
                            )}

                            {activeAcademyTab === 'quests' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="grid gap-4">
                                        {QUESTS.map((quest) => {
                                            // Handle potential type mismatch if ownedBadges assumes different format
                                            // Just strict string matching for now
                                            const isOwned = ownedBadges.some(b => b === quest.badgeId);
                                            return (
                                                <QuestCard
                                                    key={quest.id}
                                                    {...quest}
                                                    status={isOwned ? 'completed' : 'available'}
                                                    onClick={() => setActiveQuest(quest.id)}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Quest Modal */}
                                    {activeQuest && (
                                        <QuestView
                                            {...QUESTS.find(q => q.id === activeQuest)!}
                                            onClose={() => setActiveQuest(null)}
                                            isSubmitting={isLoading}
                                            onComplete={async () => {
                                                const q = QUESTS.find(q => q.id === activeQuest)!;
                                                await handleQuestComplete(q.badgeId);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2048 Game */}
                    {mainSection === 'entertainment' && activeGame === '2048' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-center mb-3">
                                <h4 className="text-sm font-semibold text-slate-300">2048 Puzzle</h4>
                                <p className="text-xs text-slate-500">Combine tiles to reach 2048! (Cost: 20 Energy)</p>
                            </div>
                            <Game2048 onGameOver={handleGame2048Over} isActive={activeGame === '2048'} />
                        </div>
                    )}

                    {/* Battle Arena */}
                    {mainSection === 'entertainment' && activeGame === 'arena' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-center mb-3">
                                <h4 className="text-sm font-semibold text-slate-300">Elemental Battle</h4>
                                <p className="text-xs text-slate-500">Choose your element to defeat the enemy!</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    className="inline-flex flex-col items-center justify-center p-3 rounded-md transition-colors bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-200 disabled:opacity-50"
                                    onClick={() => handleBattle("Fire")}
                                    disabled={isLoading || (stats ? stats.energy < 20 : false)}
                                >
                                    <Flame className="h-6 w-6 mb-2 text-red-500" />
                                    <span className="text-xs font-bold uppercase">Fire</span>
                                </button>
                                <button
                                    className="inline-flex flex-col items-center justify-center p-3 rounded-md transition-colors bg-blue-900/20 hover:bg-blue-900/40 border border-blue-900/50 text-blue-200 disabled:opacity-50"
                                    onClick={() => handleBattle("Water")}
                                    disabled={isLoading || (stats ? stats.energy < 20 : false)}
                                >
                                    <Droplets className="h-6 w-6 mb-2 text-blue-500" />
                                    <span className="text-xs font-bold uppercase">Water</span>
                                </button>
                                <button
                                    className="inline-flex flex-col items-center justify-center p-3 rounded-md transition-colors bg-green-900/20 hover:bg-green-900/40 border border-green-900/50 text-green-200 disabled:opacity-50"
                                    onClick={() => handleBattle("Grass")}
                                    disabled={isLoading || (stats ? stats.energy < 20 : false)}
                                >
                                    <Leaf className="h-6 w-6 mb-2 text-green-500" />
                                    <span className="text-xs font-bold uppercase">Grass</span>
                                </button>
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded">-20 Energy | Win: +25 Gold | Loss: +1 Gold | (Draw: Refund)</span>
                            </div>
                        </div>
                    )}

                    {/* Crypto Hunt Minigame */}
                    {mainSection === 'entertainment' && activeGame === 'hunt' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-300">Treasure Dig</h4>
                                    <p className="text-xs text-slate-500">Find gems, avoid traps!</p>
                                </div>
                                <button onClick={resetHunt} className="text-[10px] text-slate-500 hover:text-slate-300 underline">Reset Board</button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {huntGrid.map((cell, idx) => (
                                    <button
                                        key={idx}
                                        className={`h-12 rounded-md border flex items-center justify-center transition-all ${cell.revealed
                                            ? 'bg-slate-900 border-slate-800'
                                            : cell.selected
                                                ? 'bg-purple-900/50 border-purple-500' // Selected State
                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                                            }`}
                                        onClick={() => !cell.revealed && toggleTileSelection(idx)}
                                        disabled={isLoading || isHunting || cell.revealed}
                                    >
                                        {cell.revealed ? (
                                            <>
                                                {cell.content === 'gem' && <Gem className="h-5 w-5 text-cyan-400 animate-bounce" />}
                                                {cell.content === 'trap' && <Skull className="h-5 w-5 text-red-600 animate-pulse" />}
                                                {cell.content === 'dust' && <Wind className="h-5 w-5 text-slate-500" />}
                                            </>
                                        ) : cell.selected ? (
                                            <div className="h-4 w-4 rounded-full bg-purple-500 animate-pulse"></div>
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-slate-600/50"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded">
                                <span className="text-[10px] text-slate-400">Cost: {huntCost} Energy</span>
                                <button
                                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleBatchHunt}
                                    disabled={selectedCount === 0 || isLoading || isHunting || (stats ? stats.energy < huntCost : false)}
                                >
                                    {isLoading ? "Digging..." : `Reveal (${selectedCount})`}
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Shop - Only in Entertainment */}
                    {mainSection === 'entertainment' && stats && (
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center space-x-2 text-slate-300 mb-2">
                                <ShoppingBag className="h-4 w-4" />
                                <h4 className="text-sm font-semibold">Item Shop</h4>
                            </div>
                            <div className="space-y-2">
                                {/* Small Potion */}
                                <button
                                    className="inline-flex items-center justify-between w-full p-3 rounded-md bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors border text-slate-200 disabled:opacity-50"
                                    onClick={handleBuySmallPotion}
                                    disabled={isLoading || stats.gold < 10}
                                >
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-lg">🧉</div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Small Potion</span>
                                            <span className="text-[10px] text-slate-400">Restore 20 Energy</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-400 font-bold text-sm">
                                        10 G
                                    </div>
                                </button>

                                {/* Max Potion */}
                                <button
                                    className="inline-flex items-center justify-between w-full p-3 rounded-md bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors border text-slate-200 disabled:opacity-50"
                                    onClick={handleBuyPotion}
                                    disabled={isLoading || stats.gold < 50}
                                >
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3 text-lg">🧪</div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Max Potion</span>
                                            <span className="text-[10px] text-slate-400">Restore 100% Energy</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-400 font-bold text-sm">
                                        50 G
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Evolve Action - Only in Entertainment */}
                    {mainSection === 'entertainment' && pet.level >= 2 && PetDesigns.includes(pet.design) === false && (
                        <div className="space-y-2 mt-4">
                            <label className="text-sm font-medium text-slate-400">Select Evolution Form:</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                                onChange={(e) => setSelectedDesign(e.target.value)}
                            >
                                <option value="dragon">Dragon (Classic)</option>
                                <option value="phoenix">Phoenix (Fire)</option>
                                <option value="golem">Golem (Earth)</option>
                                <option value="spirit">Spirit (Water)</option>
                            </select>

                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full shadow-lg animate-pulse"
                                onClick={() => handleEvolve(selectedDesign || "dragon")}
                                disabled={isLoading}
                            >
                                <Crown className="mr-2 h-5 w-5 fill-yellow-300 text-yellow-100" />
                                Evolve!
                            </button>
                        </div>
                    )}

                    {/* Release Pet - Only in Entertainment */}
                    {mainSection === 'entertainment' && (
                        <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-900 bg-red-950/20 hover:bg-red-900/40 text-red-500 w-full mt-4"
                            onClick={handleRelease}
                            disabled={isLoading}
                        >
                            Release Pet (Reset)
                        </button>
                    )}

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                    {lastTx && (
                        <div className="mt-4 p-3 bg-green-900/50 border border-green-800 rounded text-sm text-green-200">
                            Success! View on Explorer:{" "}
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${lastTx}`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline font-bold"
                            >
                                View Transaction
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div >
    );
}
