/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

export default function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }

    let particles: Particle[] = [];

    // Scale particle count based on screen size
    const getParticleCount = (w: number) => {
      if (w < 640) return 40; // Mobile
      if (w < 1024) return 75; // Tablet
      return 110; // Desktop
    };

    const initParticles = () => {
      particles = [];
      const count = getParticleCount(width);
      const colors = [
        'rgba(56, 189, 248, 0.75)',  // sky-400
        'rgba(16, 185, 129, 0.75)',  // emerald-500
        'rgba(14, 165, 233, 0.65)',  // sky-500
        'rgba(255, 255, 255, 0.55)', // white/gray
      ];

      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 2 + 1;
        // Natural target speed based on size for parallax effect
        const baseSpeed = radius * 0.15 + 0.15; // 0.3 to 0.6 pixels per frame
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed,
          radius,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initParticles();
    };

    // Listen to changes in window size
    window.addEventListener('resize', handleResize);
    initParticles();

    // Track mouse coordinates over the hero zone
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Hook listeners to current parent or window
    const container = canvas.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Main render loops
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Connection threshold distance
      const connectionDist = 115;
      const mouseDist = 180;

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Particle to Mouse connection
        if (mouseRef.current.active) {
          const dx = p1.x - mouseRef.current.x;
          const dy = p1.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseDist) {
            const alpha = (1 - dist / mouseDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Attract slightly to mouse
            p1.vx += (dx / dist) * -0.005;
            p1.vy += (dy / dist) * -0.005;
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Draw a subtle dual color/gradient approximation
            ctx.strokeStyle = `rgba(100, 180, 240, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Restore / Cap speed smoothly so it is constantly animated
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const targetSpeed = p.radius * 0.15 + 0.15; // 0.3 to 0.6 natural flow speed

        if (speed > targetSpeed) {
          // Decay speed slowly back towards natural flow rate (when accelerated by mouse attraction)
          p.vx *= 0.97;
          p.vy *= 0.97;
        } else if (speed < targetSpeed * 0.8) {
          // Slowly accelerate back up to maintain continuous background animation
          p.vx *= 1.03;
          p.vy *= 1.03;
        }

        // Boundary checks
        if (p.x < 0 || p.x > width) {
          p.vx = -p.vx;
          p.x = Math.max(0, Math.min(width, p.x));
        }
        if (p.y < 0 || p.y > height) {
          p.vy = -p.vy;
          p.y = Math.max(0, Math.min(height, p.y));
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="plexus-procedural-canvas"
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-55 pointer-events-none"
    />
  );
}
