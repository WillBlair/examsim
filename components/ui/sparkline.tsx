import React from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  fill?: boolean; // Optional fill
}

export function Sparkline({
  data,
  width = 100,
  height = 40,
  color = "currentColor",
  className,
  fill = true, // Default to filled for better look
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const strokeWidth = 2;
  // Increased padding to prevent clipping at top/bottom
  const padding = 8; 
  const availableHeight = height - padding * 2;

  // Helper to get Y coordinate
  const getY = (value: number) => {
     const normalizedValue = (value - min) / range;
     // Y=0 is top. So max value -> padding. min value -> height - padding.
     return (height - padding) - normalizedValue * availableHeight;
  };

  // Calculate points for the line
  const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = getY(value);
      return `${x},${y}`;
  });
  
  // Construct area path
  // Start from bottom-left (first point x, bottom y) -> line points -> bottom-right (last point x, bottom y)
  const firstX = 0;
  const lastX = width;
  const bottomY = height; // Fill to the very bottom of the SVG
  
  // For area, we want to close the shape.
  // Move to first point. Line to others. Line to bottom right. Line to bottom left. Close.
  // The 'points' array is "x,y". For <path d="..."> syntax is "M x y L x y ...".
  const pathD = `M ${points[0].replace(",", " ")} ` + 
                points.slice(1).map(p => `L ${p.replace(",", " ")}`).join(" ") +
                (fill ? ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z` : "");
  
  // For just the line (stroke), we use the same points but don't close.
  const strokeD = `M ${points[0].replace(",", " ")} ` + 
                points.slice(1).map(p => `L ${p.replace(",", " ")}`).join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      {/* Fill Area */}
      {fill && (
        <path 
            d={pathD} 
            fill={color} 
            fillOpacity="0.2" 
            stroke="none" 
        />
      )}
      
      {/* Stroke Line */}
      <path
        d={strokeD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
