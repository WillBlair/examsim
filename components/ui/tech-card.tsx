import React from "react";
import { cn } from "@/lib/utils";

interface TechCardProps extends React.HTMLAttributes<HTMLDivElement> {
  footerText?: string;
  footerLabel?: string;
  accentColor?: string;
}

export const TechCard = React.forwardRef<HTMLDivElement, TechCardProps>(
  ({ className, children, footerText, footerLabel, accentColor = "#A3E635", style, ...props }, ref) => {
    // Corner cut size
    const cutSize = 40;

    return (
      <div
        ref={ref}
        className={cn("relative group isolate h-full", className)}
        style={style}
        {...props}
      >
        {/* Background Container with Clip Path */}
        <div
          className="absolute inset-0 bg-[#041D13] transition-colors duration-300 group-hover:bg-[#062318]"
          style={{
            clipPath: `polygon(
              0 0, 
              100% 0, 
              100% 100%, 
              ${cutSize}px 100%, 
              0 calc(100% - ${cutSize}px)
            )`,
          }}
        >
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}
          />
        </div>

        {/* SVG Border Overlay (Perfectly matches clip-path) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 20 }}
        >
          <path
            d={`
              M 0 0 
              H 100% 
              V 100% 
              H ${cutSize} 
              L 0 calc(100% - ${cutSize}) 
              Z
            `}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ color: accentColor } as React.CSSProperties}
            className="text-white/10 transition-colors duration-300 group-hover:text-current"
          />
          
          {/* Active Corner Accent (Bottom Left Cut) */}
          <path
            d={`M ${cutSize} 100% L 0 calc(100% - ${cutSize})`}
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </svg>

        {/* Content Container */}
        <div className="relative z-10 p-8 flex flex-col h-full">
            {/* Main Content */}
            <div className="flex-grow">
                {children}
            </div>

            {/* Footer Status Section */}
            <div className="mt-auto pt-12 flex items-end justify-between border-t border-dashed border-white/5 pb-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div 
                          className="w-1.5 h-1.5 rounded-full animate-pulse" 
                          style={{ backgroundColor: accentColor }}
                        />
                        <span 
                          className="font-mono text-[10px] tracking-[0.2em] uppercase"
                          style={{ color: accentColor }}
                        >
                            {footerText || "SYSTEM ACTIVE"}
                        </span>
                    </div>
                    {footerLabel && (
                        <span className="text-white/30 font-mono text-[10px] tracking-widest uppercase pl-3.5">
                            {footerLabel}
                        </span>
                    )}
                </div>
                
                {/* Decorative Tech Elements */}
                <div className="flex gap-1 opacity-30">
                    <div className="w-1 h-4 bg-current" />
                    <div className="w-1 h-2 bg-current mt-2" />
                    <div className="w-1 h-3 bg-current mt-1" />
                </div>
            </div>
        </div>
      </div>
    );
  }
);

TechCard.displayName = "TechCard";
