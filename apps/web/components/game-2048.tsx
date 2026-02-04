"use client";

import { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface Game2048Props {
    onGameOver: (score: number) => void;
    isActive: boolean;
}

export function Game2048({ onGameOver, isActive }: Game2048Props) {
    const [grid, setGrid] = useState<number[][]>(Array(4).fill(Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Initialize game
    useEffect(() => {
        if (isActive) {
            initGame();
        }
    }, [isActive]);

    const initGame = () => {
        const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
        addRandomTile(newGrid);
        addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
    };

    const addRandomTile = (currentGrid: number[][]) => {
        const emptyCells: { r: number, c: number }[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentGrid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    // Movement Logic
    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver) return;

        let moved = false;
        let newScore = score;
        const newGrid = grid.map(row => [...row]);

        const rotateLeft = (g: number[][]) => {
            const N = 4;
            const res = Array(4).fill(null).map(() => Array(4).fill(0));
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    res[N - 1 - c][r] = g[r][c];
                }
            }
            return res;
        };

        const rotateRight = (g: number[][]) => {
            const N = 4;
            const res = Array(4).fill(null).map(() => Array(4).fill(0));
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    res[c][N - 1 - r] = g[r][c];
                }
            }
            return res;
        };

        // Normalize everything to "Left" movement for simpler logic
        let workingGrid = newGrid;
        if (direction === 'UP') workingGrid = rotateLeft(workingGrid);
        if (direction === 'DOWN') workingGrid = rotateRight(workingGrid);
        if (direction === 'RIGHT') workingGrid = rotateLeft(rotateLeft(workingGrid));


        // Shift & Merge Left
        for (let r = 0; r < 4; r++) {
            let row = workingGrid[r].filter(val => val !== 0);
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    newScore += row[c];
                    row[c + 1] = 0;
                }
            }
            row = row.filter(val => val !== 0);
            while (row.length < 4) row.push(0);

            if (row.join(',') !== workingGrid[r].join(',')) {
                moved = true;
            }
            workingGrid[r] = row;
        }

        // Rotate back
        if (direction === 'UP') workingGrid = rotateRight(workingGrid);
        if (direction === 'DOWN') workingGrid = rotateLeft(workingGrid);
        if (direction === 'RIGHT') workingGrid = rotateLeft(rotateLeft(workingGrid));

        if (moved) {
            addRandomTile(workingGrid);
            setGrid(workingGrid);
            setScore(newScore);

            if (checkGameOver(workingGrid)) {
                setGameOver(true);
            }
        }
    }, [grid, score, gameOver]);

    const checkGameOver = (g: number[][]) => {
        // Check for empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (g[r][c] === 0) return false;
            }
        }
        // Check for merges
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (c < 3 && g[r][c] === g[r][c + 1]) return false;
                if (r < 3 && g[r][c] === g[r + 1][c]) return false;
            }
        }
        return true;
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isActive) return;
            switch (e.key) {
                case 'ArrowUp': move('UP'); break;
                case 'ArrowDown': move('DOWN'); break;
                case 'ArrowLeft': move('LEFT'); break;
                case 'ArrowRight': move('RIGHT'); break;
                default: return;
            }
            e.preventDefault();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move, isActive]);

    const getCellColor = (val: number) => {
        switch (val) {
            case 2: return 'bg-slate-700 text-slate-100';
            case 4: return 'bg-slate-600 text-slate-100';
            case 8: return 'bg-orange-700 text-white';
            case 16: return 'bg-orange-600 text-white';
            case 32: return 'bg-orange-500 text-white';
            case 64: return 'bg-orange-400 text-white shadow-lg shadow-orange-500/50';
            case 128: return 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50';
            case 256: return 'bg-yellow-500 text-white shadow-lg shadow-yellow-400/50';
            case 512: return 'bg-yellow-400 text-white shadow-xl shadow-yellow-300/50';
            case 1024: return 'bg-yellow-300 text-yellow-900 shadow-xl shadow-yellow-200/50';
            case 2048: return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-2xl animate-pulse';
            default: return 'bg-slate-800';
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between w-full mb-4 px-2">
                <div className="bg-slate-800 rounded p-2 text-center min-w-[80px]">
                    <span className="text-[10px] text-slate-400 uppercase block">Score</span>
                    <span className="text-xl font-bold text-white">{score}</span>
                </div>
                <div className="bg-slate-800 rounded p-2 text-center min-w-[80px]">
                    <span className="text-[10px] text-slate-400 uppercase block">Best</span>
                    <span className="text-xl font-bold text-slate-300">-</span>
                </div>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg relative">
                <div className="grid grid-cols-4 gap-2">
                    {grid.map((row, r) => (
                        row.map((val, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`h-14 w-14 sm:h-16 sm:w-16 rounded flex items-center justify-center font-bold text-lg sm:text-2xl transition-all duration-100 ${getCellColor(val)}`}
                            >
                                {val > 0 ? val : ''}
                            </div>
                        ))
                    ))}
                </div>

                {gameOver && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm z-10 p-4">
                        <span className="text-2xl font-bold text-white mb-2">Game Over!</span>
                        <span className="text-slate-300 mb-4">Final Score: {score}</span>
                        <button
                            onClick={() => onGameOver(score)}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow-lg animate-bounce"
                        >
                            <Trophy className="inline-block h-5 w-5 mr-1" />
                            Claim Rewards
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-[200px]">
                <div></div>
                <button onClick={() => move('UP')} className="p-3 bg-slate-700 rounded-lg active:bg-slate-600 flex justify-center"><span className="rotate-[-90deg]">▶</span></button>
                <div></div>
                <button onClick={() => move('LEFT')} className="p-3 bg-slate-700 rounded-lg active:bg-slate-600 flex justify-center"><span className="rotate-180">▶</span></button>
                <button onClick={() => move('DOWN')} className="p-3 bg-slate-700 rounded-lg active:bg-slate-600 flex justify-center"><span className="rotate-90">▶</span></button>
                <button onClick={() => move('RIGHT')} className="p-3 bg-slate-700 rounded-lg active:bg-slate-600 flex justify-center"><span>▶</span></button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Use Arrow Keys or Buttons</p>

            {!gameOver && (
                <button
                    className="mt-4 text-xs text-slate-400 hover:text-white underline flex items-center"
                    onClick={() => onGameOver(score)}
                >
                    <RefreshCw className="h-3 w-3 mr-1" /> End & Claim Now
                </button>
            )}
        </div>
    );
}
