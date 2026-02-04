"use client";

import { useEffect, useState } from 'react';
import { usePoolPhysics } from '../hooks/use-pool-physics';
import { PoolCanvas } from './pool-canvas';
import { Trophy, RotateCcw, Coins, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/use-wallet';
import { submitPoolScore } from '../lib/pet-contract';
import { toast } from 'sonner';

export function GamePool() {
    // Mobile Portrait Ratio (9:16 approx)
    const WIDTH = 360;
    const HEIGHT = 640;

    const physics = usePoolPhysics(WIDTH, HEIGHT);
    const { address } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto start on mount
    useEffect(() => {
        physics.init8Ball();
    }, []);

    const handleClaim = async () => {
        if (!address) {
            toast.error("Connect Wallet first!");
            return;
        }
        if (physics.score === 0) {
            toast.error("Score is 0!");
            return;
        }

        setIsSubmitting(true);
        try {
            toast.loading("Submitting Score...");
            await submitPoolScore(address, physics.score);
            toast.dismiss();
            toast.success(`Claimed! +${physics.score * 2} Gold`);
            physics.init8Ball(); // Reset game
        } catch (e) {
            toast.dismiss();
            console.error(e);
            toast.error("Failed to submit score");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
            <div className="flex justify-between w-full mb-2 px-4 items-center">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-200">🎱 8-Ball Pool</h2>
                    <span className="text-sm text-yellow-400 font-mono">Score: {physics.score}</span>
                </div>

                <div className="flex gap-2">
                    {physics.score > 0 && (
                        <button
                            onClick={handleClaim}
                            disabled={isSubmitting}
                            className="flex items-center text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-300 px-3 py-1 rounded-full animate-pulse"
                        >
                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Coins className="w-3 h-3 mr-1" />}
                            Claim
                        </button>
                    )}
                    <button
                        onClick={() => physics.init8Ball()}
                        className="flex items-center text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-full"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" /> Reset
                    </button>
                </div>
            </div>

            <div className="relative w-full border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl bg-black">
                <PoolCanvas
                    balls={physics.balls}
                    width={WIDTH}
                    height={HEIGHT}
                    onShoot={physics.shoot}
                    isMoving={physics.isMoving}
                />
            </div>

            <div className="mt-4 p-4 bg-slate-800 rounded-lg text-slate-300 text-sm text-center">
                <p>👆 <strong>Drag back</strong> from the Cue Ball (White) to aim and shoot!</p>
                <p className="text-xs text-slate-500 mt-1">Physics Engine Alpha 1.0 (Elastic Collisions + Friction)</p>
            </div>
        </div>
    );
}
