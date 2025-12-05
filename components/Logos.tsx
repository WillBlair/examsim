"use client";

import Image from "next/image";

export function Logos() {
  // Placeholder logos - using text for now or generic SVGs
  const logos = [
    { name: "Company 1", icon: "https://placehold.co/100x30/e2e8f0/475569?text=Logo+1" },
    { name: "Company 2", icon: "https://placehold.co/100x30/e2e8f0/475569?text=Logo+2" },
    { name: "Company 3", icon: "https://placehold.co/100x30/e2e8f0/475569?text=Logo+3" },
    { name: "Company 4", icon: "https://placehold.co/100x30/e2e8f0/475569?text=Logo+4" },
    { name: "Company 5", icon: "https://placehold.co/100x30/e2e8f0/475569?text=Logo+5" },
  ];

  return (
    <section className="py-12 bg-zinc-50 border-b border-zinc-100">
      <div className="container px-4 md:px-6 mx-auto text-center">
        <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-8">
          Trusted by students from top universities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Using simple text placeholders for logos if images aren't available, 
              but simulating the layout with divs */}
           {logos.map((logo, i) => (
             <div key={i} className="h-8 w-32 bg-zinc-300 rounded flex items-center justify-center text-xs font-bold text-zinc-500">
                {logo.name}
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

