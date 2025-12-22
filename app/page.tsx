import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
// Lazy load Features to optimize hydration
const Features = dynamic(() =>
  import("@/components/Features").then((mod) => mod.Features)
);

import { WhyChooseUs } from "@/components/WhyChooseUs";
// Lazy load FAQ to split Framer Motion from main bundle
import dynamic from "next/dynamic";
const FAQ = dynamic(() => import("@/components/FAQ").then((mod) => mod.FAQ));

import { Footer } from "@/components/Footer";

import { GridBackground } from "@/components/GridBackground";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-brand-orange/20 selection:text-brand-orange">
      <GridBackground />
      <Navbar />

      <div className="relative z-50">
        <Hero />
      </div>

      <div className="relative z-30">
        <Features />
      </div>



      <div className="relative z-0">
        <WhyChooseUs />
      </div>

      <div className="relative z-0">
        <FAQ />
      </div>

      <div className="relative z-0">
        <Footer />
      </div>
    </main>
  );
}
