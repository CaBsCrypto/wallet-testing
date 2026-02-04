import { LucideIcon, CheckCircle, Lock, PlayCircle } from "lucide-react";

interface QuestCardProps {
    id: string;
    title: string;
    description: string;
    tier: number;
    rewards: string;
    icon: LucideIcon;
    status: 'locked' | 'available' | 'completed';
    onClick: () => void;
}

export function QuestCard({ title, description, tier, rewards, icon: Icon, status, onClick }: QuestCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={status === 'locked'}
            className={`w-full text-left relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${status === 'locked'
                    ? 'bg-slate-900/50 border-slate-800 opacity-60 grayscale cursor-not-allowed'
                    : status === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-900/40'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className={`p-3 rounded-lg ${status === 'locked' ? 'bg-slate-800' : 'bg-gradient-to-br from-purple-900 to-indigo-900'
                    }`}>
                    <Icon className={`w-6 h-6 ${status === 'locked' ? 'text-slate-600' : 'text-purple-300'
                        }`} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Tier {tier}
                        </span>
                        {status === 'completed' && (
                            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </span>
                        )}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${status === 'locked' ? 'text-slate-500' : 'text-slate-200'
                        }`}>
                        {title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                        {description}
                    </p>
                    <div className="flex items-center text-xs font-mono text-yellow-500 bg-yellow-950/30 px-2 py-1 rounded w-fit border border-yellow-700/30">
                        {rewards}
                    </div>
                </div>

                <div className="self-center">
                    {status === 'locked' ? (
                        <Lock className="w-5 h-5 text-slate-600" />
                    ) : status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    ) : (
                        <PlayCircle className="w-8 h-8 text-purple-400 animate-pulse" />
                    )}
                </div>
            </div>
        </button>
    );
}
