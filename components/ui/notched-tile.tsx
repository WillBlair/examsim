import React from "react";
import { cn } from "@/lib/utils";

export type NotchCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface NotchedTileProps extends React.HTMLAttributes<HTMLDivElement> {
  notchSize?: number;
  corner?: NotchCorner;
}

export const NotchedTile = React.forwardRef<HTMLDivElement, NotchedTileProps>(
  ({ className, children, notchSize = 40, corner = "top-left", style, ...props }, ref) => {
    
    // Calculate mask position based on corner
    const getMaskPosition = () => {
      switch (corner) {
        case "top-left": return "0 0";
        case "top-right": return "100% 0";
        case "bottom-left": return "0 100%";
        case "bottom-right": return "100% 100%";
        default: return "0 0";
      }
    };

    const maskPosition = getMaskPosition();

    const maskStyle = {
      maskImage: `radial-gradient(circle at ${maskPosition}, transparent 0, transparent ${notchSize}px, black ${notchSize + 0.5}px)`,
      WebkitMaskImage: `radial-gradient(circle at ${maskPosition}, transparent 0, transparent ${notchSize}px, black ${notchSize + 0.5}px)`,
    };

    // Border styles based on corner
    const renderBorders = () => {
      const commonBorderClass = "absolute bg-white/10 group-hover:bg-[#A3E635] transition-colors duration-300";
      const circleClass = "absolute rounded-full border border-white/10 group-hover:border-[#A3E635] transition-colors duration-300 box-border";

      // Top-Left Configuration
      if (corner === "top-left") {
        return (
          <>
             {/* Top Line (starts after notch) */}
            <div className={cn(commonBorderClass, "top-0 right-0 h-[1px]")} style={{ left: `${notchSize}px` }} />
             {/* Left Line (starts after notch) */}
            <div className={cn(commonBorderClass, "bottom-0 left-0 w-[1px]")} style={{ top: `${notchSize}px` }} />
             {/* Right Line */}
            <div className={cn(commonBorderClass, "top-0 bottom-0 right-0 w-[1px]")} />
             {/* Bottom Line */}
            <div className={cn(commonBorderClass, "bottom-0 left-0 right-0 h-[1px]")} />
             {/* Notch Arc */}
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${notchSize}px`, height: `${notchSize}px` }}>
              <div className={circleClass} style={{ width: `${notchSize * 2}px`, height: `${notchSize * 2}px`, top: `-${notchSize}px`, left: `-${notchSize}px` }} />
            </div>
          </>
        );
      }

      // Top-Right Configuration
      if (corner === "top-right") {
        return (
          <>
             {/* Top Line (ends before notch) */}
            <div className={cn(commonBorderClass, "top-0 left-0 h-[1px]")} style={{ right: `${notchSize}px` }} />
             {/* Left Line */}
            <div className={cn(commonBorderClass, "top-0 bottom-0 left-0 w-[1px]")} />
             {/* Right Line (starts after notch) */}
            <div className={cn(commonBorderClass, "bottom-0 right-0 w-[1px]")} style={{ top: `${notchSize}px` }} />
             {/* Bottom Line */}
            <div className={cn(commonBorderClass, "bottom-0 left-0 right-0 h-[1px]")} />
             {/* Notch Arc */}
            <div className="absolute top-0 right-0 overflow-hidden" style={{ width: `${notchSize}px`, height: `${notchSize}px` }}>
              <div className={circleClass} style={{ width: `${notchSize * 2}px`, height: `${notchSize * 2}px`, top: `-${notchSize}px`, right: `-${notchSize}px` }} />
            </div>
          </>
        );
      }

       // Bottom-Left Configuration
       if (corner === "bottom-left") {
        return (
          <>
             {/* Top Line */}
            <div className={cn(commonBorderClass, "top-0 left-0 right-0 h-[1px]")} />
             {/* Left Line (ends before notch) */}
            <div className={cn(commonBorderClass, "top-0 left-0 w-[1px]")} style={{ bottom: `${notchSize}px` }} />
             {/* Right Line */}
            <div className={cn(commonBorderClass, "top-0 bottom-0 right-0 w-[1px]")} />
             {/* Bottom Line (starts after notch) */}
            <div className={cn(commonBorderClass, "bottom-0 right-0 h-[1px]")} style={{ left: `${notchSize}px` }} />
             {/* Notch Arc */}
            <div className="absolute bottom-0 left-0 overflow-hidden" style={{ width: `${notchSize}px`, height: `${notchSize}px` }}>
              <div className={circleClass} style={{ width: `${notchSize * 2}px`, height: `${notchSize * 2}px`, bottom: `-${notchSize}px`, left: `-${notchSize}px` }} />
            </div>
          </>
        );
      }

      // Bottom-Right Configuration
      if (corner === "bottom-right") {
        return (
          <>
             {/* Top Line */}
            <div className={cn(commonBorderClass, "top-0 left-0 right-0 h-[1px]")} />
             {/* Left Line */}
            <div className={cn(commonBorderClass, "top-0 bottom-0 left-0 w-[1px]")} />
             {/* Right Line (ends before notch) */}
            <div className={cn(commonBorderClass, "top-0 right-0 w-[1px]")} style={{ bottom: `${notchSize}px` }} />
             {/* Bottom Line (ends before notch) */}
            <div className={cn(commonBorderClass, "bottom-0 left-0 h-[1px]")} style={{ right: `${notchSize}px` }} />
             {/* Notch Arc */}
            <div className="absolute bottom-0 right-0 overflow-hidden" style={{ width: `${notchSize}px`, height: `${notchSize}px` }}>
              <div className={circleClass} style={{ width: `${notchSize * 2}px`, height: `${notchSize * 2}px`, bottom: `-${notchSize}px`, right: `-${notchSize}px` }} />
            </div>
          </>
        );
      }
    };

    return (
      <div className="relative w-full h-full isolate group">
        {/* Background & Content with Mask */}
        <div
          ref={ref}
          className={cn(
            "relative h-full w-full bg-[#041D13]/80 backdrop-blur-sm transition-colors overflow-hidden",
            className
          )}
          style={{ ...style, ...maskStyle }}
          {...props}
        >
          {children}
        </div>

        {/* Borders Construction */}
        <div className="absolute inset-0 pointer-events-none z-20">
           {renderBorders()}
        </div>
      </div>
    );
  }
);

NotchedTile.displayName = "NotchedTile";
