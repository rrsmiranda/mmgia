/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: ReactNode;
  /** Atraso em segundos, para revelar itens em sequência. */
  delay?: number;
  /** Distância em px do deslocamento vertical inicial. */
  y?: number;
  className?: string;
}

/** Revela o conteúdo com fade + leve deslocamento quando entra na tela. Respeita prefers-reduced-motion. */
export default function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
