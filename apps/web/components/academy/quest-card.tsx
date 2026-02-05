import { LucideIcon, CheckCircle, Lock, Play, Gift } from "lucide-react";

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
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`w-full text-left relative overflow-hidden rounded-3xl border-b-[6px] transition-all duration-100 group h-full flex flex-col
                ${isLocked
                    ? 'bg-[#1c2e4a] border-[#0d1b2a] opacity-60 cursor-not-allowed'
                    : isCompleted
                        ? 'bg-[#273e5d] border-[#1c2e4a] opacity-80'
                        : 'bg-[#273e5d] border-[#5d7599] hover:translate-y-1 hover:border-b-0 active:translate-y-2'
                }
            `}
        >
            {/* Header / Icon Area */}
            <div className={`p-4 w-full flex justify-between items-start 
                ${isLocked ? 'bg-[#152238]' : isCompleted ? 'bg-[#1e3a8a]' : 'bg-[#355070]'}`
            }>
                <div className={`p-3 rounded-2xl shadow-inner
                    ${isLocked ? 'bg-[#0d1b2a] text-[#5d7599]' : 'bg-[#ffb703] text-[#0d1b2a]'}
                `}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>

                {isCompleted && <div className="bg-[#80ed99] text-[#0d1b2a] px-2 py-1 rounded-lg font-bold text-[10px] uppercase">Completed</div>}
                {isLocked && <Lock className="text-[#5d7599]" />}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isLocked ? 'text-[#5d7599]' : 'text-[#80ed99]'}`}>
                        Level {tier}
                    </span>
                    <h3 className={`text-lg leading-tight font-heading uppercase text-white drop-shadow-sm`}>
                        {title}
                    </h3>
                </div>

                <p className="text-sm text-[#94a3b8] leading-snug line-clamp-2">
                    {description}
                </p>

                <div className="mt-auto pt-4 flex items-center gap-2">
                    <div className="bg-[#0d1b2a] rounded-lg px-2 py-1 flex items-center gap-1.5 border border-[#1c2e4a]">
                        <Gift size={12} className="text-[#ffb703]" />
                        <span className="text-[10px] font-bold text-[#ffb703] uppercase">{rewards.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
