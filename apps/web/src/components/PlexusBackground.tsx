/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PlexusBackgroundProps {
  /** Número de nós, ajustado para baixo em áreas pequenas. */
  maxNodes?: number;
}

/** Resolve uma cor CSS (incl. var(--token)) para "r, g, b" via um elemento fora de tela. */
function resolveRgb(value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color; // sempre normalizado como "rgb(r, g, b)"
  document.body.removeChild(probe);
  const match = rgb.match(/\d+/g);
  return match ? match.slice(0, 3).join(', ') : '255, 255, 255';
}

/**
 * Fundo decorativo de nós conectados por linhas (canvas 2D, com trilha de
 * desvanecimento), para seções escuras (var(--ink)) do design system.
 * Cores sempre via token: fundo/trilha em var(--ink), nós e linhas em
 * var(--on-ink-accent). Para com prefers-reduced-motion: só um quadro
 * estático, sem requestAnimationFrame.
 */
export default function PlexusBackground({ maxNodes = 50 }: PlexusBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !parent || !ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const linkDistance = 150;

    const trailRgb = resolveRgb('var(--ink)');
    const accentRgb = resolveRgb('var(--on-ink-accent)');

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(maxNodes, Math.max(14, Math.round((width * height) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
      // Primeiro quadro sem trilha (a tela começa vazia/transparente).
      ctx.clearRect(0, 0, width, height);
    };

    const drawFrame = () => {
      // Trilha: preenche com o próprio tom de fundo em baixa opacidade, em vez
      // de limpar o quadro — os nós deixam um rastro suave ao se mover.
      ctx.fillStyle = `rgba(${trailRgb}, 0.12)`;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb}, 0.6)`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          if (distance < linkDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${accentRgb}, ${0.3 - distance / 500})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const step = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        // Atravessa as bordas em vez de quicar, para um fluxo contínuo.
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
      }
      drawFrame();
      raf = requestAnimationFrame(step);
    };

    resize();
    drawFrame();
    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxNodes]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
