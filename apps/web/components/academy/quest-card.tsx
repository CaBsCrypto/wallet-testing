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
            className={`w-full text-left relative overflow-hidden rounded-none border-2 p-4 transition-all duration-100 group ${status === 'locked'
                ? 'bg-slate-900 border-slate-800 opacity-60 grayscale cursor-not-allowed'
                : status === 'completed'
                    ? 'bg-green-950/20 border-green-600 hover:bg-green-900/40 shadow-[2px_2px_0px_#15803d]'
                    : 'bg-black border-pink-600 hover:border-pink-400 hover:bg-pink-950/30 shadow-[4px_4px_0px_#be185d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#be185d]'
                }`}
        >
            <div className="flex items-start justify-between gap-4 font-mono">
                <div className={`p-2 border-2 ${status === 'locked' ? 'bg-slate-800 border-slate-700' : 'bg-transparent border-current text-inherit'
                    }`}>
                    <Icon className={`w-6 h-6 ${status === 'locked' ? 'text-slate-600' : 'text-inherit'
                        }`} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'locked' ? 'text-slate-600' : 'text-slate-500'}`}>
                            &gt; SECURITY_LVL_{tier}
                        </span>
                        {status === 'completed' && (
                            <span className="flex items-center text-[10px] font-bold text-green-400 bg-green-950 px-2 py-0 border border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" /> EXECUTED
                            </span>
                        )}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 uppercase tracking-tight ${status === 'locked' ? 'text-slate-600' : 'text-white'
                        }`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px', lineHeight: '1.5' }}>
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {status === 'locked' ? 'Access Restricted' : description}
                    </p>
                    <div className="flex items-center text-[10px] font-bold text-yellow-400 border border-yellow-600 px-2 py-1 w-fit bg-yellow-950/20">
                        {rewards}
                    </div>
                </div>

                <div className="self-center">
                    {status === 'locked' ? (
                        <Lock className="w-5 h-5 text-slate-700" />
                    ) : status === 'completed' ? (
                        <div className="w-8 h-8 border-2 border-green-500 flex items-center justify-center bg-green-500/10">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                    ) : (
                        <PlayCircle className="w-8 h-8 text-pink-500 group-hover:text-pink-400 group-hover:scale-110 transition-transform" />
                    )}
                </div>
            </div>
        </button>
    );
}
