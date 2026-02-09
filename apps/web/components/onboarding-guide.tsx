"use client";

import { useEffect, useState } from "react";
import { usePet } from "../hooks/use-pet";
import { Zap, ArrowUpCircle, X } from "lucide-react";
import { Pet } from "../lib/pet-contract";

export function OnboardingGuide() {
    const { pet, stats, evolve, gainXp, isLoading } = usePet();
    const [showEvolutionModal, setShowEvolutionModal] = useState(false);
    const [showTrainTip, setShowTrainTip] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileMotto, setProfileMotto] = useState("");

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Save to local storage for now (or contract if we had fields)
        if (typeof window !== 'undefined') {
            localStorage.setItem("trainer_profile", JSON.stringify({ name: profileName, twitter: profileMotto }));
        }

        // Grant XP to reach level 2 (100 XP)
        const xpNeeded = 100 - (pet?.xp || 0);
        if (xpNeeded > 0) {
            await gainXp(xpNeeded, "Profile Completion");
        }
        setShowProfileModal(false);
    };

    // Monitor State for Triggers
    useEffect(() => {
        if (!pet) return;

        // 1. Profile / Egg cracking tip (Level 1, Egg Design)
        if (pet.design === "egg" && pet.level < 2) {
            // Show tip to open profile
            setShowTrainTip(true);
        } else {
            setShowTrainTip(false);
        }

        // 2. Evolution Ready (Level >= 2, Egg Design)
        if (pet.design === "egg" && pet.level >= 2) {
            setShowEvolutionModal(true);
            setShowProfileModal(false); // Close profile if open
        } else {
            // Auto-close if they evolved (design changed)
            setShowEvolutionModal(false);
        }
    }, [pet]);

    const handleEvolve = async (design: string) => {
        await evolve(design);
        // Modal closes automatically via useEffect when pet.design changes
    };

    if (!pet) return null;

    return (
        <>
            {/* TRAINING TIP TOAST */}
            {showTrainTip && !showProfileModal && (
                <div className="fixed bottom-24 right-4 md:right-8 bg-blue-600 text-white p-4 rounded-xl shadow-xl shadow-blue-900/50 border-2 border-blue-400 animate-bounce max-w-xs z-40 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setShowProfileModal(true)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowTrainTip(false); }}
                        className="absolute -top-2 -right-2 bg-blue-800 rounded-full p-1 border border-blue-400"
                    >
                        <X size={12} />
                    </button>
                    <div className="flex gap-3 items-start">
                        <Zap className="shrink-0 text-yellow-300 fill-current" />
                        <div>
                            <p className="font-bold text-sm uppercase">¡Evolución Rápida!</p>
                            <p className="text-xs text-blue-100 mt-1">
                                Haz clic aquí para completar tu <strong>Perfil de Entrenador</strong> y verificar tu licencia instantáneamente (Nivel 2).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* PROFILE MODAL */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1c2e4a] border-4 border-[#5d7599] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white uppercase font-heading">Licencia de Entrenador</h2>
                            <p className="text-slate-400 text-xs">Regístrate para acceder a tecnología de evolución avanzada.</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Nombre de Entrenador</label>
                                <input
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="w-full bg-[#0d1b2a] border-2 border-[#5d7599] rounded-xl p-3 text-white focus:border-blue-400 outline-none"
                                    placeholder="Ash Ketchum"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Usuario de X (Twitter)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                    <input
                                        value={profileMotto}
                                        onChange={(e) => setProfileMotto(e.target.value.replace('@', ''))}
                                        className="w-full bg-[#0d1b2a] border-2 border-[#5d7599] rounded-xl p-3 pl-8 text-white focus:border-blue-400 outline-none"
                                        placeholder="usuario"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Conectaremos tu perfil para futuras recompensas.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? "Verificando..." : "REGISTRAR Y SUBIR NIVEL"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EVOLUTION MODAL */}
            {showEvolutionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
                    <div className="bg-[#1c2e4a] border-4 border-purple-500 rounded-3xl max-w-2xl w-full p-8 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-in zoom-in-95 duration-500">

                        {/* Background FX */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 to-transparent pointer-events-none"></div>

                        <div className="text-center space-y-4 mb-8 relative z-10">
                            <div className="w-24 h-24 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto border-2 border-purple-400 animate-pulse">
                                <span className="text-6xl">🥚</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-heading text-white uppercase drop-shadow-lg">It's Hatching!</h2>
                            <p className="text-purple-200 text-lg">Your companion is ready to take form. Choose your destiny.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            {[
                                { id: 'dragon', icon: '🐉', label: 'Dragon Class', desc: 'Balanced Power' },
                                { id: 'phoenix', icon: '🦅', label: 'Phoenix Class', desc: 'High Agility' },
                                { id: 'golem', icon: '🦁', label: 'Golem Class', desc: 'High Defense' }, // Using Lion for Golem for now
                                { id: 'spirit', icon: '👻', label: 'Spirit Class', desc: 'High Intellect' }
                            ].map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleEvolve(cls.id)}
                                    className="group relative bg-slate-900/50 border-2 border-slate-700 hover:border-purple-400 hover:bg-purple-900/30 rounded-xl p-4 transition-all text-left flex items-center gap-4"
                                    disabled={isLoading}
                                >
                                    <div className="text-4xl group-hover:scale-125 transition-transform">{cls.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-white uppercase">{cls.label}</h3>
                                        <p className="text-xs text-slate-400 group-hover:text-purple-300">{cls.desc}</p>
                                    </div>
                                    {isLoading && <div className="absolute inset-0 bg-black/50 rounded-xl cursor-wait" />}
                                </button>
                            ))}
                        </div>

                        <p className="text-center text-xs text-slate-500 mt-8 font-mono relative z-10">
                            Confirming selection will consume energy and evolve your pet permanently.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
