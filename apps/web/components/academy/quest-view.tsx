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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" /> {title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            {/* breadcrumbs */}
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'choice' ? 'bg-purple-500' : 'bg-green-500'}`} />
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'briefing' ? 'bg-purple-500' : step === 'choice' ? 'bg-slate-700' : 'bg-green-500'}`} />
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'quiz' ? 'bg-purple-500' : step === 'success' ? 'bg-green-500' : 'bg-slate-700'}`} />
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'success' ? 'bg-purple-500' : 'bg-slate-700'}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                    {/* CHOICE CHOICE SCREEN */}
                    {step === 'choice' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300 py-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">How would you like to proceed?</h3>
                                <p className="text-slate-400">You can learn the concepts first or jump straight to the challenge.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('briefing')}
                                    className="group relative p-6 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left space-y-3 shadow-lg hover:shadow-purple-500/20"
                                >
                                    <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                        <BookOpen className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white">Start Lesson</h4>
                                        <p className="text-sm text-slate-400">Read the briefing and master the concepts.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setStep('quiz')}
                                    className="group relative p-6 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-xl transition-all text-left space-y-3 shadow-lg hover:shadow-blue-500/20"
                                >
                                    <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <CheckCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white">Take Quiz</h4>
                                        <p className="text-sm text-slate-400">Skip the lesson and prove your knowledge.</p>
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
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center text-sm text-slate-400">
                                <span>Question {currentQuestion + 1} of {questions.length}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white">
                                {questions[currentQuestion].text}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOption === idx
                                            ? 'bg-purple-900/30 border-purple-500 text-purple-100'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-300'
                                            }`}
                                    >
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={selectedOption === null || isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                                >
                                    {isSubmitting ? (
                                        "Claiming Badge..."
                                    ) : currentQuestion === questions.length - 1 ? (
                                        "Submit & Claim"
                                    ) : (
                                        "Next Question"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 py-10 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                                <Award className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Quest Complete!</h2>
                                <p className="text-slate-400">You have mastered this skill and earned a Soulbound Badge.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
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
