"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Award, ArrowRight, BookOpen } from "lucide-react";

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

interface QuestViewProps {
    title: string;
    content: React.ReactNode;
    questions: Question[];
    onComplete: () => Promise<void>;
    onClose: () => void;
    isSubmitting?: boolean;
}

export function QuestView({ title, content, questions, onComplete, onClose, isSubmitting = false }: QuestViewProps) {
    const [step, setStep] = useState<'choice' | 'briefing' | 'quiz' | 'success'>('choice');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOptionSelect = (index: number) => {
        setSelectedOption(index);
        setError(null);
    };

    const handleNextQuestion = () => {
        if (selectedOption === null) return;

        if (selectedOption !== questions[currentQuestion].correctIndex) {
            setError("Incorrect answer. Review the briefing and try again!");
            return;
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(curr => curr + 1);
            setSelectedOption(null);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        try {
            await onComplete();
            setStep('success');
        } catch (e) {
            console.error("Quest completion failed", e);
            setError("Failed to claim reward. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-black border-4 border-green-600 rounded-none w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(22,163,74,0.2)] flex flex-col relative text-green-400">
                {/* Scanlines Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none z-50 bg-[length:100%_2px,3px_100%] opacity-20" />
                {/* Header */}
                <div className="p-4 border-b-2 border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10 font-mono">
                    <div>
                        <h2 className="text-lg font-bold text-green-400 flex items-center gap-2 uppercase tracking-wide">
                            <BookOpen className="w-5 h-5" /> TERMINAL :: {title}
                        </h2>
                        <div className="flex items-center gap-1 mt-2">
                            {/* breadcrumbs */}
                            <div className={`h-2 w-4 transition-colors border ${step === 'choice' ? 'bg-green-500 border-green-500' : 'border-slate-600'}`} />
                            <div className={`h-2 w-4 transition-colors border ${step === 'briefing' ? 'bg-green-500 border-green-500' : step === 'choice' ? 'border-slate-600' : 'bg-green-900 border-green-900'}`} />
                            <div className={`h-2 w-4 transition-colors border ${step === 'quiz' ? 'bg-green-500 border-green-500' : step === 'success' ? 'bg-green-900 border-green-900' : 'border-slate-600'}`} />
                            <div className={`h-2 w-4 transition-colors border ${step === 'success' ? 'bg-green-500 border-green-500' : 'border-slate-600'}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-green-600 hover:text-green-400 hover:bg-green-900/20 px-2 py-1 transition-colors border border-transparent hover:border-green-600">
                        [ ABORT ]
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                    {/* CHOICE CHOICE SCREEN */}
                    {step === 'choice' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300 py-6 font-mono">
                            <div className="text-center space-y-2 border-2 border-dashed border-slate-800 p-4">
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tighter" style={{ fontFamily: '"Press Start 2P"' }}>SELECT_MODE</h3>
                                <p className="text-green-500 text-xs uppercase">&gt; CHOOSE INSTRUCTION PROTOCOL...</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('briefing')}
                                    className="group relative p-6 bg-black border-2 border-purple-600 hover:bg-purple-900/20 rounded-none transition-all text-left space-y-3 hover:shadow-[4px_4px_0px_#9333ea]"
                                >
                                    <div className="w-12 h-12 border-2 border-purple-500 flex items-center justify-center bg-purple-900/20">
                                        <BookOpen className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-purple-400 uppercase">&gt; DATA_ARCHIVE</h4>
                                        <p className="text-[10px] text-purple-300/70 uppercase">Access Knowledge Database</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setStep('quiz')}
                                    className="group relative p-6 bg-black border-2 border-blue-600 hover:bg-blue-900/20 rounded-none transition-all text-left space-y-3 hover:shadow-[4px_4px_0px_#2563eb]"
                                >
                                    <div className="w-12 h-12 border-2 border-blue-500 flex items-center justify-center bg-blue-900/20">
                                        <CheckCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-blue-400 uppercase">&gt; SKILL_CHECK</h4>
                                        <p className="text-[10px] text-blue-300/70 uppercase">Execute Assessment Protocol</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'briefing' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="prose prose-invert prose-slate max-w-none">
                                {content}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep('quiz')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                                >
                                    Start Quiz <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 font-mono">
                            <div className="flex justify-between items-center text-xs text-green-700 uppercase tracking-widest border-b border-green-900/50 pb-2">
                                <span>&gt; QUERY_SEQUENCE: {currentQuestion + 1} / {questions.length}</span>
                            </div>

                            <h3 className="text-lg font-bold text-white leading-relaxed">
                                {questions[currentQuestion].text}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-4 border-2 transition-all font-mono text-sm relative overflow-hidden group ${selectedOption === idx
                                            ? 'bg-green-900/30 border-green-500 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                            : 'bg-black border-slate-800 hover:border-green-600 text-slate-300 hover:text-green-400'
                                            }`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${selectedOption === idx ? 'bg-green-500' : 'bg-transparent group-hover:bg-green-800'}`} />
                                        <span className="font-bold mr-3 opacity-50">&gt; OPT_{String.fromCharCode(65 + idx)}:</span> {option}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-950/30 border-l-4 border-red-500 text-red-400 text-xs font-mono flex items-center gap-2 animate-pulse">
                                    <AlertCircle className="w-4 h-4" />
                                    ERROR: {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-900">
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={selectedOption === null || isSubmitting}
                                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-black px-8 py-3 font-bold flex items-center gap-2 transition-all hover:shadow-[4px_4px_0px_#000] active:translate-y-1"
                                >
                                    {isSubmitting ? (
                                        "PROCESSING..."
                                    ) : currentQuestion === questions.length - 1 ? (
                                        "COMMIT_&_CLAIM"
                                    ) : (
                                        "CONTINUE_SEQUENCE"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 py-10 animate-in zoom-in duration-300 font-mono">
                            <div className="w-24 h-24 border-4 border-yellow-500 bg-yellow-500/10 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-bounce">
                                <Award className="w-12 h-12 text-yellow-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-yellow-400 mb-2 uppercase tracking-tight">Quest Complete!</h2>
                                <p className="text-green-500 text-sm uppercase">&gt; SKILL_ACQUIRED<br />&gt; SOULBOUND_BADGE_MINTED</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-slate-800 border-2 border-slate-600 hover:text-white hover:border-white text-slate-300 px-8 py-3 font-bold transition-all uppercase"
                            >
                                [ Return to Academy ]
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
