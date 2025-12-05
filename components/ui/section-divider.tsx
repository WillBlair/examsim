"use client";

import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion";

interface SectionDividerProps {
  scrollYProgress?: MotionValue<number>;
  color: string;
  type?: "curve" | "tilt" | "fade";
  position?: "top" | "bottom";
}

export function SectionDivider({ 
  scrollYProgress, 
  color, 
  type = "curve",
  position = "bottom"
}: SectionDividerProps) {
  
  // Optional: minimal parallax effect if scrollYProgress is provided
  const defaultMotionValue = useMotionValue(0);
  const y = useTransform(scrollYProgress || defaultMotionValue, [0, 1], [0, -20]);

  if (type === "fade") {
    return (
      <div 
        className={`absolute left-0 right-0 z-20 h-32 pointer-events-none ${
          position === "bottom" ? "bottom-0 bg-gradient-to-t" : "top-0 bg-gradient-to-b"
        }`}
        style={{ 
          // Gradient from the target color to transparent
          backgroundImage: `linear-gradient(to ${position === "top" ? "bottom" : "top"}, ${color}, transparent)` 
        }}
      />
    );
  }

  return (
    <div className={`absolute left-0 right-0 z-20 w-full overflow-hidden leading-[0] ${
      position === "bottom" ? "bottom-[-1px]" : "top-[-1px] rotate-180"
    }`}>
      <motion.div style={{ y: scrollYProgress ? y : 0 }}>
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {type === "curve" && (
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill={color}
            />
          )}
          
          {type === "tilt" && (
            <path 
              d="M1200 120L0 16.48V0h1200v120z" 
              fill={color} 
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}

