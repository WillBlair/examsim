import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Footer } from "@/components/Footer";
import { GridBackground } from "@/components/GridBackground";

// Lazy load below-the-fold components to reduce initial JS bundle
const Features = dynamic(() =>
  import("@/components/Features").then((mod) => mod.Features),
  { loading: () => <FeaturesSkeleton /> }
);

// Lazy load FAQ to split Framer Motion from main bundle  
const FAQ = dynamic(
  () => import("@/components/FAQ").then((mod) => mod.FAQ),
  { loading: () => <FAQSkeleton /> }
);

// Minimal skeleton placeholders to prevent layout shift
function FeaturesSkeleton() {
  return (
    <section className="pt-32 pb-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto">
        <div className="h-32 bg-zinc-100 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

function FAQSkeleton() {
  return (
    <section className="py-24 bg-transparent">
      <div className="container max-w-4xl px-4 md:px-6 mx-auto">
        <div className="h-96 bg-zinc-100 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

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
