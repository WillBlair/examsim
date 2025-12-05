"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface SectionBevelProps {
  scrollYProgress: MotionValue<number>;
  color: string;
  showHighlight?: boolean;
}

export function SectionBevel({ scrollYProgress, color, showHighlight = false }: SectionBevelProps) {
  // Parallax the bevel up as we scroll
  const y = useTransform(scrollYProgress, [0.8, 1], [100, 0]);
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-[100px] overflow-hidden pointer-events-none">
      <motion.div 
        style={{ y }}
        className="relative w-full h-full"
      >
        {/* The Bevel Shape */}
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100 L 1440 100 L 1440 0 L 0 100 Z"
            fill={color}
          />
          
          {showHighlight && (
            <path
              d="M0 100 L 1440 0"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="1"
              fill="none"
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}

