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
            className={`min-w-[160px] w-[160px] text-left relative overflow-hidden rounded-2xl border-b-4 transition-all duration-100 group h-full flex flex-col snap-start
                ${isLocked
                    ? 'bg-[#1c2e4a] border-[#0d1b2a] opacity-60 cursor-not-allowed'
                    : isCompleted
                        ? 'bg-[#273e5d] border-[#1c2e4a] opacity-80'
                        : 'bg-[#273e5d] border-[#5d7599] hover:translate-y-1 hover:border-b-0 active:translate-y-2'
                }
            `}
        >
            {/* Header / Icon Area */}
            <div className={`p-3 w-full flex justify-between items-start 
                ${isLocked ? 'bg-[#152238]' : isCompleted ? 'bg-[#1e3a8a]' : 'bg-[#355070]'}`
            }>
                <div className={`p-2 rounded-xl shadow-inner
                    ${isLocked ? 'bg-[#0d1b2a] text-[#5d7599]' : 'bg-[#ffb703] text-[#0d1b2a]'}
                `}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>

                {isCompleted && <div className="bg-[#80ed99] text-[#0d1b2a] px-1.5 py-0.5 rounded-md font-bold text-[8px] uppercase">Done</div>}
                {isLocked && <Lock size={14} className="text-[#5d7599]" />}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1 gap-1">
                <div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${isLocked ? 'text-[#5d7599]' : 'text-[#80ed99]'}`}>
                        Lvl {tier}
                    </span>
                    <h3 className={`text-xs leading-tight font-heading uppercase text-white drop-shadow-sm mt-0.5 line-clamp-2 h-8`}>
                        {title}
                    </h3>
                </div>

                {/* <p className="text-[10px] text-[#94a3b8] leading-snug line-clamp-2 hidden">
                    {description}
                </p> */}

                <div className="mt-auto pt-2 flex items-center gap-1">
                    <div className="bg-[#0d1b2a] rounded-md px-1.5 py-0.5 flex items-center gap-1 border border-[#1c2e4a]">
                        <Gift size={10} className="text-[#ffb703]" />
                        <span className="text-[8px] font-bold text-[#ffb703] uppercase truncate max-w-[80px]">{rewards.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
