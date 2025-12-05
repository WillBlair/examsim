import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  current: number;
  previous: number;
  className?: string;
  label?: string;
  darkBackground?: boolean;
}

export function TrendIndicator({ current, previous, className, label = "vs last week", darkBackground = false }: TrendIndicatorProps) {
  const difference = current - previous;
  const percentage = previous === 0 
    ? (current > 0 ? 100 : 0) 
    : Math.round((difference / previous) * 100);
  
  const isPositive = difference > 0;
  const isNeutral = difference === 0;
  const isNegative = difference < 0;

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      {isPositive && <TrendUp className={cn("w-3 h-3", darkBackground ? "text-green-400" : "text-green-600")} />}
      {isNegative && <TrendDown className={cn("w-3 h-3", darkBackground ? "text-red-400" : "text-red-500")} />}
      {isNeutral && <Minus className={cn("w-3 h-3", darkBackground ? "text-zinc-400" : "text-zinc-400")} />}
      
      <span className={cn(
        isPositive ? (darkBackground ? "text-green-400" : "text-green-600") : 
        isNegative ? (darkBackground ? "text-red-400" : "text-red-500") : 
        (darkBackground ? "text-zinc-400" : "text-zinc-500")
      )}>
        {Math.abs(percentage)}%
      </span>
      <span className={cn(darkBackground ? "text-zinc-400/80" : "text-zinc-400")}>{label}</span>
    </div>
  );
}
