"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { checkAuth } from "@/app/actions/auth";

export function HeroCTAButton() {
  // Default to /register for fastest first paint, update if authenticated
  const [ctaHref, setCtaHref] = useState("/register");

  // Non-blocking auth check - runs after initial render
  useEffect(() => {
    checkAuth().then((isAuth) => {
      if (isAuth) setCtaHref("/dashboard/new");
    });
  }, []);

  return (
    <Link href={ctaHref}>
      <Button className="group h-14 md:h-16 px-6 md:px-10 rounded-lg bg-brand-orange text-zinc-900 hover:bg-brand-orange hover:opacity-90 font-black text-lg md:text-xl flex items-center gap-3 md:gap-4 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 ease-in-out w-full sm:w-auto justify-center">
        Generate My First Exam
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
  );
}

