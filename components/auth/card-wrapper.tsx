"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Terminal } from "@phosphor-icons/react/dist/ssr";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial
}: CardWrapperProps) => {
  return (
    <Card className="w-[460px] min-h-[500px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-0 bg-white/95 backdrop-blur-xl relative overflow-visible rounded-3xl transition-all ring-1 ring-black/5">
      
      <CardHeader className="pb-0 pt-8 relative z-10">
        <div className="w-full flex flex-col gap-y-3 items-center justify-center">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
             <div className="p-2 bg-black rounded-lg shadow-md shadow-black/20">
                <Terminal className="w-5 h-5 text-white" fill="currentColor" weight="fill" />
             </div>
             <span className="font-bold text-xl tracking-tighter text-zinc-900">ExamSim</span>
          </Link>
          <p className="text-zinc-500 text-xs font-medium">
            {headerLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-0">
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter>
        </CardFooter>
      )}
      <CardFooter className="pt-2 pb-6">
        <Button
          variant="ghost"
          className="w-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 font-medium rounded-full h-9 text-xs"
          size="sm"
          asChild
        >
          <Link href={backButtonHref}>
            {backButtonLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
