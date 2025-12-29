
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

export const ForensicRadar = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        let angle = 0;

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const radius = Math.min(cx, cy) - 20;

            // Radar background
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner circles
            [0.2, 0.5, 0.8].forEach(m => {
                ctx.beginPath();
                ctx.arc(cx, cy, radius * m, 0, Math.PI * 2);
                ctx.stroke();
            });

            // The sweep
            const gradient = ctx.createConicGradient(angle, cx, cy);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
            gradient.addColorStop(0.1, 'rgba(6, 182, 212, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + 0.5);
            ctx.closePath();
            ctx.fill();

            // Random blips
            if (Math.random() > 0.98) {
                // Persistent blip logic could go here
            }

            angle += 0.02;
            animationFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="forensic-radar-container">
            <div className="radar-label">FORENSIC_RADAR // B3_ACTIVE</div>
            <canvas ref={canvasRef} className="radar-canvas" />
            <div className="radar-stats">
                <div className="stat">SCANNING...</div>
                <div className="stat">THREAT_LEVEL: 0%</div>
            </div>
        </div>
    );
};
