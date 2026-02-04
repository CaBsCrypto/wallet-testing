"use strict";
import { useEffect, useRef, useState } from 'react';
import { Ball } from '../hooks/use-pool-physics';

interface PoolCanvasProps {
    balls: Ball[];
    width: number;
    height: number;
    onShoot: (power: number, angle: number) => void;
    isMoving: boolean;
}

export function PoolCanvas({ balls, width, height, onShoot, isMoving }: PoolCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Table Felt
        ctx.fillStyle = '#1e5e2f'; // Pool Green
        ctx.fillRect(0, 0, width, height);

        // Draw Rails (Wood Frame)
        const railSize = 20;
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, 0, width, railSize); // Top
        ctx.fillRect(0, height - railSize, width, railSize); // Bottom
        ctx.fillRect(0, 0, railSize, height); // Left
        ctx.fillRect(width - railSize, 0, railSize, height); // Right

        // Draw Pockets (6 Holes)
        ctx.fillStyle = '#111';
        const pocketRadius = 22; // Just visual for now
        const pCoords = [
            { x: railSize, y: railSize }, { x: width - railSize, y: railSize }, // Top Corners
            { x: railSize, y: height - railSize }, { x: width - railSize, y: height - railSize }, // Bottom Corners
            { x: railSize, y: height / 2 }, { x: width - railSize, y: height / 2 } // Side Pockets
        ];

        pCoords.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, pocketRadius, 0, Math.PI * 2);
            ctx.fill();
            // Metallic rim
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw Balls
        balls.forEach(ball => {
            if (ball.potted) return;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();

            // Stripe
            if (ball.type === 'stripe') {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius - 2, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();

                ctx.beginPath();
                ctx.rect(ball.x - ball.radius, ball.y - 4, ball.radius * 2, 8);
                ctx.fillStyle = ball.color;
                ctx.fill();
            }

            // Shininess
            ctx.beginPath();
            ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            // Number (Circle background for readability)
            if (ball.number > 0) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fill();

                ctx.fillStyle = 'black';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(ball.number.toString(), ball.x, ball.y + 0.5);
            }
        });

        // Draw Cue Stick & Trajectory (if dragging)
        if (dragStart && dragCurrent && !isMoving) {
            const cueBall = balls.find(b => b.type === 'cue');
            if (cueBall && !cueBall.potted) {
                const dx = dragStart.x - dragCurrent.x;
                const dy = dragStart.y - dragCurrent.y;
                const angle = Math.atan2(dy, dx);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const MAX_PULL = 150;
                const power = Math.min(dist, MAX_PULL);

                // Stick Properties
                const stickLength = 300;
                const stickWidth = 8;
                const distanceFromBall = 20 + (power * 0.5); // Pull back animation

                // Trajectory Line
                ctx.save();
                ctx.translate(cueBall.x, cueBall.y);
                ctx.rotate(angle); // Positive X is the direction of the shot

                // Draw aiming line extending forward
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(800, 0); // Long line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.stroke();

                // Draw Stick
                // Position: Negative X is "behind" the ball because we are rotated to aim angle?
                // Wait.
                // Pulling mouse DOWN (positive Y) -> Aiming UP (Negative Y).
                // angle = atan2(dy, dx).
                // If I pull DOWN (dy > 0), angle is positive ~90deg.
                // Stick should be BEHIND the ball.
                // If I rotate by angle...
                // (0,0) is ball center.
                // Stick should be drawn at (-distance, 0) extending to (-distance - length, 0)?
                // Let's try drawing "behind" (negative x after rotation).

                const tipX = -distanceFromBall;
                const endX = -distanceFromBall - stickLength;

                // Stick Body (Wood Gradient)
                const grad = ctx.createLinearGradient(endX, -stickWidth / 2, endX, stickWidth / 2);
                grad.addColorStop(0, '#5c3a21'); // Dark wood
                grad.addColorStop(0.5, '#8b5a2b'); // Light wood highlight
                grad.addColorStop(1, '#3e2714'); // Dark shadow

                ctx.fillStyle = grad;
                // Tapered stick: Thicker at back, thinner at tip
                ctx.beginPath();
                ctx.moveTo(tipX, -3); // Tip radius 3
                ctx.lineTo(endX, -6); // Handle radius 6
                ctx.lineTo(endX, 6);
                ctx.lineTo(tipX, 3);
                ctx.fill();

                // Stick Tip (Blue Chalk & White Ferrule)
                // Ferrule (White part)
                ctx.fillStyle = '#ddd';
                ctx.fillRect(tipX - 10, -3, 10, 6);

                // Blue Chalk
                ctx.fillStyle = '#1e90ff';
                ctx.fillRect(tipX - 2, -3, 2, 6);

                ctx.restore();
            }
        }

    }, [balls, width, height, dragStart, dragCurrent, isMoving]);

    const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Scale coordinate system to internal resolution
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isMoving) return;
        const pos = getMousePos(e);

        // Check if clicking cue ball (or near it)
        const cueBall = balls.find(b => b.type === 'cue');
        if (cueBall) {
            const dist = Math.sqrt((pos.x - cueBall.x) ** 2 + (pos.y - cueBall.y) ** 2);
            if (dist < 40) { // Allow some margin
                setDragStart({ x: cueBall.x, y: cueBall.y }); // Drag logic relative to ball center essentially
                setDragCurrent(pos);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragStart) return;
        const pos = getMousePos(e);
        setDragCurrent(pos);
    };

    const handleMouseUp = () => {
        if (!dragStart || !dragCurrent) return;

        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;

        // Power calculation
        const dist = Math.sqrt(dx * dx + dy * dy);
        const MAX_PULL = 200;
        const power = Math.min(dist, MAX_PULL) / MAX_PULL; // 0.0 to 1.0

        if (power > 0.05) {
            const angle = Math.atan2(dy, dx);
            onShoot(power, angle);
        }

        setDragStart(null);
        setDragCurrent(null);
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto bg-slate-900 rounded-lg shadow-2xl cursor-crosshair touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setDragStart(null)}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        />
    );
}
