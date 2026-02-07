"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Award, ArrowRight, X, HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { QuestModule } from "./academy-hub";

interface QuestViewProps {
    title: string;
    modules: QuestModule[]; // New structure
    onComplete: () => Promise<void>;
    onClose: () => void;
    isSubmitting?: boolean;
}

export function QuestView({ title, modules, onComplete, onClose, isSubmitting = false }: QuestViewProps) {
    // Progression State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [mode, setMode] = useState<'intro' | 'learn' | 'quiz' | 'success'>('intro');

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentModule = modules[currentModuleIndex] || modules[0]; // Fallback
    const currentQuestion = currentModule.quiz ? currentModule.quiz[currentQuestionIndex] : null;

    const handleStartModule = () => {
        setMode('learn');
    };

    const handleStartQuiz = () => {
        setMode('quiz');
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setError(null);
    };

    const handleOptionSelect = (index: number) => {
        setSelectedOption(index);
        setError(null);
    };

    const handleNextQuestion = () => {
        if (selectedOption === null || !currentModule.quiz) return;

        if (selectedOption !== currentQuestion!.correctIndex) {
            setError("Incorrect answer. Review the material if needed.");
            return;
        }

        if (currentQuestionIndex < currentModule.quiz.length - 1) {
            // Next Question in same module
            setCurrentQuestionIndex(curr => curr + 1);
            setSelectedOption(null);
        } else {
            // Module Complete
            if (currentModuleIndex < modules.length - 1) {
                // Next Module
                setCurrentModuleIndex(curr => curr + 1);
                setMode('learn'); // Go back to learning for next module
            } else {
                // All Modules Complete
                handleComplete();
            }
        }
    };

    const handleComplete = async () => {
        try {
            await onComplete();
            setMode('success');
        } catch (e) {
            console.error("Quest completion failed", e);
            setError("Failed to claim reward. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            {/* Main Panel */}
            <div className="w-full max-w-4xl bg-[#1c2e4a] border-4 border-[#5d7599] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-[#0d1b2a] p-4 flex justify-between items-center border-b-4 border-[#1c2e4a] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#273e5d] p-2 rounded-lg">
                            <BookOpen size={20} className="text-[#ffb703]" />
                        </div>
                        <div>
                            <h2 className="text-xl text-white font-heading uppercase tracking-wider">{title}</h2>
                            <p className="text-xs text-slate-400 font-mono">Module {currentModuleIndex + 1} of {modules.length}: {currentModule.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-[#ef233c] text-white p-2 rounded-xl border-b-4 border-[#d90429] active:border-b-0 active:translate-y-1 transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#1c2e4a]">

                    {/* INTRO SCREEN */}
                    {mode === 'intro' && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-[#273e5d] rounded-full flex items-center justify-center border-4 border-[#5d7599] mb-4">
                                <HelpCircle size={48} className="text-[#ffb703]" />
                            </div>
                            <h3 className="text-3xl text-white font-heading">Ready to Learn?</h3>
                            <p className="text-slate-300 max-w-md">
                                This quest consists of {modules.length} modules. You must complete the reading and pass the quiz for each module to earn your badge.
                            </p>
                            <button
                                onClick={handleStartModule}
                                className="bg-[#ffb703] text-[#0d1b2a] px-8 py-4 rounded-xl font-black text-xl hover:brightness-110 shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
                            >
                                Start First Module <ArrowRight />
                            </button>
                        </div>
                    )}

                    {/* LEARNING MODE */}
                    {mode === 'learn' && (
                        <div className="p-6 md:p-8 space-y-8 animate-in slide-in-from-right-8 duration-300">
                            {currentModule.component ? (
                                <div className="w-full">
                                    {currentModule.component}
                                </div>
                            ) : (
                                <>
                                    <div className="prose prose-invert prose-lg max-w-none">
                                        <h2 className="text-[#ffb703]">{currentModule.title}</h2>
                                        {currentModule.content}
                                    </div>

                                    <div className="pt-8 border-t border-slate-700 flex justify-end">
                                        <button
                                            onClick={handleStartQuiz}
                                            className="bg-[#80ed99] text-[#0d1b2a] px-8 py-3 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                                        >
                                            Take Quiz <ChevronRight />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* QUIZ MODE */}
                    {mode === 'quiz' && currentModule.quiz && currentQuestion && (
                        <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <span className="bg-[#0d1b2a] text-[#80ed99] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#80ed99]/30">
                                    Quiz: Question {currentQuestionIndex + 1} / {currentModule.quiz.length}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white leading-relaxed">
                                {currentQuestion.text}
                            </h3>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold relative group
                                            ${selectedOption === idx
                                                ? 'bg-[#ffe6a7] border-[#ffb703] text-[#0d1b2a] shadow-md'
                                                : 'bg-[#273e5d] border-[#0d1b2a] text-white hover:bg-[#355070]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                                                ${selectedOption === idx ? 'border-[#0d1b2a] bg-[#ffb703]' : 'border-slate-500 text-slate-400'}
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            {option}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-xl text-red-200 text-sm font-bold flex items-center gap-2 animate-shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between pt-8 border-t border-slate-700">
                                <button
                                    onClick={() => setMode('learn')} // Go back to review
                                    className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-1"
                                >
                                    ← Review Material
                                </button>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={selectedOption === null || isSubmitting}
                                    className="bg-[#80ed99] text-[#0d1b2a] px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    {isSubmitting ? "Checking..." :
                                        (currentQuestionIndex === currentModule.quiz.length - 1 && currentModuleIndex === modules.length - 1)
                                            ? "Finish Quest"
                                            : "Next Question"} <ChevronRight />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {mode === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full animate-pulse"></div>
                                <Award className="w-40 h-40 text-[#ffb703] drop-shadow-2xl animate-bounce relative z-10" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-heading text-white">Quest Complete!</h2>
                                <p className="text-xl text-[#94a3b8] max-w-lg mx-auto">
                                    You have mastered the material and earned your badge.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-[#273e5d] border-b-4 border-[#0d1b2a] text-white px-10 py-4 rounded-2xl font-bold text-xl hover:translate-y-1 hover:border-b-0 transition-all"
                            >
                                Return to Academy
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
