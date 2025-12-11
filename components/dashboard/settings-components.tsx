"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Moon, Sun, Desktop, Warning } from "@phosphor-icons/react";

interface NotificationSwitchProps {
  defaultEnabled?: boolean;
  label: string;
  description: string;
  color: string;
}

export function NotificationSwitch({ defaultEnabled = false, label, description, color }: NotificationSwitchProps) {
  const [enabled, setEnabled] = React.useState(defaultEnabled);

  return (
    <div 
      className="group/item flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 border-[3px] border-transparent hover:border-zinc-100 transition-all cursor-pointer"
      onClick={() => setEnabled(!enabled)}
    >
      <div>
        <p className="text-base font-bold text-zinc-900 group-hover/item:text-violet-600 transition-colors">{label}</p>
        <p className="text-xs text-zinc-500 font-semibold mt-0.5">{description}</p>
      </div>
      
      <div className="relative">
        <button 
          role="switch"
          aria-checked={enabled}
          className={cn(
            "relative h-8 w-14 rounded-full transition-all duration-300 border-[3px] focus:outline-none focus:ring-4 focus:ring-zinc-100",
            enabled ? `${color} border-zinc-900` : "bg-zinc-200 border-zinc-300"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setEnabled(!enabled);
          }}
        >
          <span className={cn(
            "absolute top-[2px] left-[2px] h-[22px] w-[22px] rounded-full bg-white border-[3px] border-zinc-900 shadow-sm transition-transform duration-300 flex items-center justify-center",
            enabled ? "translate-x-[24px]" : "translate-x-0"
          )}>
            <span className={cn(
              "transition-all duration-200 transform",
              enabled ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}>
              <Check weight="bold" className="w-3 h-3 text-zinc-900" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const [activeTheme, setActiveTheme] = React.useState("Light");
  
  const themes = [
    { name: "Light", icon: Sun, color: "bg-amber-100" },
    { name: "Dark", icon: Moon, color: "bg-zinc-800 text-white" },
    { name: "System", icon: Desktop, color: "bg-zinc-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 block flex items-center gap-2">
            Interface Theme
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
        </label>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setActiveTheme(theme.name)}
              className={cn(
                "py-4 rounded-xl border-[3px] font-bold text-sm transition-all relative overflow-hidden group hover:-translate-y-1 flex flex-col items-center gap-2",
                activeTheme === theme.name
                  ? "border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  : "border-zinc-200 hover:border-zinc-900 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                 activeTheme === theme.name && theme.name === 'Light' ? 'bg-white' : '',
                 activeTheme === theme.name && theme.name === 'Dark' ? 'bg-zinc-900 text-white' : '',
                 activeTheme !== theme.name ? 'bg-white text-zinc-500' : ''
              )}
            >
              <theme.icon weight={activeTheme === theme.name ? "fill" : "bold"} className="w-5 h-5" />
              {theme.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-5 bg-pink-50/50 rounded-xl border-[3px] border-pink-100 flex items-start gap-4">
        <div className="p-2 bg-pink-100 rounded-lg border-2 border-pink-200">
            <Warning weight="fill" className="w-5 h-5 text-pink-500" />
        </div>
        <div>
            <p className="text-sm font-bold text-zinc-900">Dark Mode Beta</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">
                We&apos;re still polishing the dark theme. Some elements might not look perfect yet, but we&apos;re working on it!
            </p>
        </div>
      </div>
    </div>
  );
}
