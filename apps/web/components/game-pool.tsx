"use client";

import { useEffect, useState } from 'react';
import { usePoolPhysics } from '../hooks/use-pool-physics';
import { PoolCanvas } from './pool-canvas';
import { Trophy, RotateCcw } from 'lucide-react';

export function GamePool() {
    // Mobile Portrait Ratio (9:16 approx)
    const WIDTH = 360;
    const HEIGHT = 640;

    const physics = usePoolPhysics(WIDTH, HEIGHT);

    // Auto start on mount
    useEffect(() => {
        physics.init8Ball();
    }, []);

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
            <div className="flex justify-between w-full mb-2 px-4 items-center">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-200">🎱 8-Ball Pool Practice</h2>
                    <span className="text-sm text-yellow-400 font-mono">Score: {physics.score}</span>
                </div>
                <button
                    onClick={() => physics.init8Ball()}
                    className="flex items-center text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-full"
                >
                    <RotateCcw className="w-4 h-4 mr-1" /> Reset Rack
                </button>
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
