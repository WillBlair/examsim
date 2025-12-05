"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

import { GridBackground } from "@/components/GridBackground";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900">
      <GridBackground />
      <Navbar />
      
      <div className="relative z-50">
        <Hero />
      </div>
      
      <div className="relative z-30">
        <Features />
      </div>
      
      <div className="relative z-20">
        <WhyChooseUs />
      </div>

      <div className="relative z-10">
        <Testimonials />
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
