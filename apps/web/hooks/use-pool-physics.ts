import { useState, useEffect, useRef, useCallback } from 'react';

export interface Vector2 {
    x: number;
    y: number;
}

export interface Ball {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    type: 'cue' | 'solid' | 'stripe' | '8ball' | '9ball';
    potted: boolean;
    texture?: string; // For later
    number: number;
}

export interface TableConfig {
    width: number;
    height: number;
    pockets: Vector2[];
    cushionWidth: number;
}

const FRICTION = 0.99; // Less friction = longer roll
const WALL_ELASTICITY = 0.85; // Bouncier walls
const MIN_VELOCITY = 0.05;

export function usePoolPhysics(width: number, height: number) {
    const [balls, setBalls] = useState<Ball[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Physics State (Mutable for performance, synced to React state occasionally)
    const physicsState = useRef<{ balls: Ball[] }>({ balls: [] });

    // Initialize Table
    const TABLE: TableConfig = {
        width,
        height,
        cushionWidth: 20,
        pockets: [
            { x: 0, y: 0 }, { x: width / 2, y: 0 }, { x: width, y: 0 },
            { x: 0, y: height }, { x: width / 2, y: height }, { x: width, y: height }
        ]
    };

    // Helper: Distance squared
    const distSq = (v1: Vector2, v2: Vector2) => (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2;

    const [score, setScore] = useState(0);

    const updatePhysics = (dt: number) => {
        let moving = false;
        const state = physicsState.current;
        const balls = state.balls;

        const railSize = 20;
        const POCKET_RADIUS = 28; // Hitbox for potting
        const TABLE_WIDTH = TABLE.width;
        const TABLE_HEIGHT = TABLE.height;

        const pockets = [
            { x: railSize, y: railSize }, { x: TABLE_WIDTH - railSize, y: railSize }, // Top Corners
            { x: railSize, y: TABLE_HEIGHT - railSize }, { x: TABLE_WIDTH - railSize, y: TABLE_HEIGHT - railSize }, // Bottom Corners
            { x: railSize, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH - railSize, y: TABLE_HEIGHT / 2 } // Side Pockets
        ];

        // 1. Move & Apply Friction
        balls.forEach(ball => {
            if (ball.potted) return;

            // Apply Velocity
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Apply Friction
            ball.vx *= FRICTION;
            ball.vy *= FRICTION;

            if (Math.abs(ball.vx) < MIN_VELOCITY && Math.abs(ball.vy) < MIN_VELOCITY) {
                ball.vx = 0; ball.vy = 0;
            } else {
                moving = true;
            }
        });

        // 2. Pocket Detection (PRIORITY CHECK)
        // Check this BEFORE wall collisions to ensure balls entering pockets aren't bounced out
        let ballsPottedThisFrame = 0;

        balls.forEach(ball => {
            if (ball.potted) return;

            for (const pocket of pockets) {
                const dx = ball.x - pocket.x;
                const dy = ball.y - pocket.y;
                const distSq = dx * dx + dy * dy;

                // Check if inside pocket radius
                if (distSq < POCKET_RADIUS * POCKET_RADIUS) {
                    ball.potted = true;
                    ball.vx = 0;
                    ball.vy = 0;

                    if (ball.type !== 'cue') {
                        ballsPottedThisFrame++;
                    } else {
                        // Scratch handling
                        setTimeout(() => {
                            ball.potted = false;
                            ball.x = TABLE_WIDTH / 2;
                            ball.y = TABLE_HEIGHT * 0.75;
                            ball.vx = 0; ball.vy = 0;
                        }, 1000);
                    }
                    moving = true;
                    break;
                }
            }
        });

        if (ballsPottedThisFrame > 0) {
            setScore(prev => prev + ballsPottedThisFrame);
        }

        // 3. Wall Collisions
        // Only if NOT potted.
        const minX = TABLE.cushionWidth + balls[0].radius;
        const maxX = TABLE.width - TABLE.cushionWidth - balls[0].radius;
        const minY = TABLE.cushionWidth + balls[0].radius;
        const maxY = TABLE.height - TABLE.cushionWidth - balls[0].radius;

        balls.forEach(ball => {
            if (ball.potted) return;

            // If ball center is OUTSIDE the playable area, bounce.
            // But we must be careful NOT to bounce if it's "in the hole" zone (corners).
            // However, since we ALREADY checked pockets above, if it's here, it missed the pocket.
            // So we blindly bounce? 
            // NO. If it's entering the pocket, it might exceed minX/minY but simply be "falling in".
            // We need to check if the ball is in a "safe zone" (near a pocket) to ignore walls.

            let ignoreWalls = false;
            for (const p of pockets) {
                const dx = ball.x - p.x;
                const dy = ball.y - p.y;
                // If within 45px of a pocket center, disable walls to let it pass through visuals
                if (dx * dx + dy * dy < 45 * 45) {
                    ignoreWalls = true;
                    break;
                }
            }

            if (!ignoreWalls) {
                if (ball.x < minX) { ball.x = minX; ball.vx = -Math.abs(ball.vx) * WALL_ELASTICITY; } // Force positive X
                else if (ball.x > maxX) { ball.x = maxX; ball.vx = -Math.abs(ball.vx) * WALL_ELASTICITY; } // Force negative X

                if (ball.y < minY) { ball.y = minY; ball.vy = -Math.abs(ball.vy) * WALL_ELASTICITY; }
                else if (ball.y > maxY) { ball.y = maxY; ball.vy = -Math.abs(ball.vy) * WALL_ELASTICITY; }
            }
        });

        // 4. Ball-Ball Collisions
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const b1 = balls[i];
                const b2 = balls[j];

                if (b1.potted || b2.potted) continue;

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < b1.radius + b2.radius) {
                    // Overlap Resolution
                    const overlap = (b1.radius + b2.radius - dist) / 2;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    b1.x -= nx * overlap; b1.y -= ny * overlap;
                    b2.x += nx * overlap; b2.y += ny * overlap;

                    // Collision Physics
                    const tx = -ny, ty = nx;
                    const dpTan1 = b1.vx * tx + b1.vy * ty;
                    const dpTan2 = b2.vx * tx + b2.vy * ty;
                    const dpNorm1 = b1.vx * nx + b1.vy * ny;
                    const dpNorm2 = b2.vx * nx + b2.vy * ny;
                    b1.vx = tx * dpTan1 + nx * dpNorm2;
                    b1.vy = ty * dpTan1 + ny * dpNorm2;
                    b2.vx = tx * dpTan2 + nx * dpNorm1;
                    b2.vy = ty * dpTan2 + ny * dpNorm1;
                    moving = true;
                }
            }
        }

        setIsMoving(moving);
    };

    const gameLoop = (time: number) => {
        // limit frames/logic? For now strictly requestAnimationFrame
        updatePhysics(16); // assume 60fps roughly
        setBalls([...physicsState.current.balls]); // Trigger render
        if (physicsState.current.balls.some(b => Math.abs(b.vx) > 0 || Math.abs(b.vy) > 0)) {
            animationRef.current = requestAnimationFrame(gameLoop);
        } else {
            // Stop loop if static
            // But we might need loop for other things?
            // For now, keep it running if "isMoving" logic allows
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const shoot = (power: number, angle: number) => {
        const cueBall = physicsState.current.balls.find(b => b.type === 'cue');
        if (!cueBall) return;

        const maxSpeed = 45; // 50% more power
        const speed = power * maxSpeed;

        cueBall.vx = Math.cos(angle) * speed;
        cueBall.vy = Math.sin(angle) * speed;

        // Ensure loop is running
        if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    };

    // Setup initial rack 8-ball (Vertical Mode)
    const init8Ball = () => {
        const radius = 12; // Slightly larger for better mobile view
        // Vertical Layout: 0,0 is Top-Left. 
        // Rack at Top (y ~ height * 0.25), Cue Ball at Bottom (y ~ height * 0.75)

        const rackY = height * 0.25;
        const rackX = width / 2;

        const newBalls: Ball[] = [];

        // Cue Ball
        newBalls.push({
            id: 0, x: width / 2, y: height * 0.75, vx: 0, vy: 0, radius, color: '#ffffff', type: 'cue', potted: false, number: 0
        });

        // Rack (Simple Triangle for now)
        // Row 1 (1 ball)
        newBalls.push({ id: 1, x: rackX, y: rackY, vx: 0, vy: 0, radius, color: 'yellow', type: 'solid', potted: false, number: 1 });

        // Row 2 (2 balls) - Y decreases (goes up?) No, Y increases downwards.
        // If Rack is at Top, "Head" of rack faces Cue Ball (Bottom).
        // So Rack Triangle expands UPWARDS (Lower Y)? Or DOWNWARDS?
        // Standard: Triangle point faces the breaker.
        // Breaker is at Bottom. So Point is at Bottom (Higher Y).

        // Let's place Point at rackY.
        // Row 2 is 'behind' it (Smaller Y? No, further away from breaker).
        // If breaker is at Bottom (y=700), Rack Point is at y=200.
        // Behind the point is y=180 (Top).

        const rowHeight = radius * 1.732; // sqrt(3)
        const ballDiam = radius * 2; // slightly separated?

        // Row 2
        newBalls.push({ id: 2, x: rackX - radius - 1, y: rackY - rowHeight, vx: 0, vy: 0, radius, color: 'blue', type: 'solid', potted: false, number: 2 });
        newBalls.push({ id: 3, x: rackX + radius + 1, y: rackY - rowHeight, vx: 0, vy: 0, radius, color: 'red', type: 'solid', potted: false, number: 3 });

        // Row 3 (3 balls)
        newBalls.push({ id: 4, x: rackX - (radius * 2) - 2, y: rackY - (rowHeight * 2), vx: 0, vy: 0, radius, color: 'purple', type: 'solid', potted: false, number: 4 });
        newBalls.push({ id: 5, x: rackX, y: rackY - (rowHeight * 2), vx: 0, vy: 0, radius, color: 'black', type: '8ball', potted: false, number: 8 });
        newBalls.push({ id: 6, x: rackX + (radius * 2) + 2, y: rackY - (rowHeight * 2), vx: 0, vy: 0, radius, color: 'orange', type: 'solid', potted: false, number: 5 });

        physicsState.current.balls = newBalls;
        setBalls(newBalls);
        animationRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return {
        balls,
        init8Ball,
        shoot,
        isMoving,
        score
    };
}
