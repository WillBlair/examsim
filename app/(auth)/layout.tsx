import React from "react";
import { GridBackground } from "@/components/GridBackground";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-zinc-50/50">
      <div className="absolute inset-0 z-0">
         {/* Use 'full' mask type to keep grid visible behind the card */}
         <GridBackground maskType="full" />
      </div>
      
      <div className="relative z-10 w-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
