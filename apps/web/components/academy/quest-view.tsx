"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Award, ArrowRight, BookOpen, X, HelpCircle } from "lucide-react";

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
            setError("Incorrect answer. Check the briefing!");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Main Panel */}
            <div className="w-full max-w-3xl bg-[#1c2e4a] border-4 border-[#5d7599] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-[#0d1b2a] p-4 flex justify-between items-center border-b-4 border-[#1c2e4a]">
                    <h2 className="text-xl text-white font-heading uppercase tracking-wider pl-2">{title}</h2>
                    <button
                        onClick={onClose}
                        className="bg-[#ef233c] text-white p-2 rounded-xl border-b-4 border-[#d90429] active:border-b-0 active:translate-y-1 transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">

                    {/* CHOICE SCREEN */}
                    {step === 'choice' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-[#273e5d] rounded-full mx-auto flex items-center justify-center border-4 border-[#5d7599]">
                                    <HelpCircle size={40} className="text-[#ffb703]" />
                                </div>
                                <h3 className="text-3xl text-white font-heading">Choose Protocol</h3>
                                <p className="text-[#94a3b8]">Read the material or jump straight to the quiz?</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('briefing')}
                                    className="group bg-[#273e5d] border-b-[6px] border-[#0d1b2a] rounded-2xl p-6 text-left hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all"
                                >
                                    <h4 className="font-heading text-lg text-[#ffb703] uppercase mb-1">Study Material</h4>
                                    <p className="text-sm text-white opacity-80">Read the lesson first.</p>
                                </button>

                                <button
                                    onClick={() => setStep('quiz')}
                                    className="group bg-[#273e5d] border-b-[6px] border-[#0d1b2a] rounded-2xl p-6 text-left hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all"
                                >
                                    <h4 className="font-heading text-lg text-[#80ed99] uppercase mb-1">Attempt Quiz</h4>
                                    <p className="text-sm text-white opacity-80">Prove your knowledge.</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BRIEFING */}
                    {step === 'briefing' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="prose prose-invert prose-lg max-w-none text-[#f0f4f8]">
                                {content}
                            </div>
                            <div className="flex justify-end pt-8">
                                <button
                                    onClick={() => setStep('quiz')}
                                    className="btn-clash bg-[#ffb703] border-[#fb8500] text-[#0d1b2a] px-8 py-4 rounded-xl font-black text-lg flex items-center gap-2 hover:brightness-110"
                                >
                                    Start Quiz <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* QUIZ */}
                    {step === 'quiz' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <span className="bg-[#0d1b2a] text-[#80ed99] px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    Question {currentQuestion + 1} of {questions.length}
                                </span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                                {questions[currentQuestion].text}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-b-[4px] transition-all font-bold relative
                                            ${selectedOption === idx
                                                ? 'bg-[#ffe6a7] border-[#ffb703] text-[#0d1b2a] translate-y-1 border-b-0'
                                                : 'bg-[#273e5d] border-[#0d1b2a] text-white hover:brightness-110'
                                            }`}
                                    >
                                        <span className="opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-xl text-red-200 text-sm font-bold flex items-center gap-2 animate-shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t font-heading border-[#5d7599]/30">
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={selectedOption === null || isSubmitting}
                                    className="btn-clash bg-[#80ed99] border-[#22c55e] text-[#0d1b2a] px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Checking..." : currentQuestion === questions.length - 1 ? "Finish & Claim" : "Next Question"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 py-10 animate-in zoom-in duration-300">
                            <div className="w-32 h-32 mx-auto relative">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                                <Award className="w-32 h-32 text-[#ffb703] drop-shadow-lg animate-bounce" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-heading text-white mb-2">Quest Complete!</h2>
                                <p className="text-[#94a3b8]">You've earned a new badge.</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="btn-clash bg-[#273e5d] border-[#0d1b2a] text-white px-8 py-4 rounded-xl"
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
