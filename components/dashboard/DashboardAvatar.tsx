"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardAvatarProps {
  sessionImage?: string | null;
  name: string;
  className?: string;
}

export function DashboardAvatar({ sessionImage, name, className }: DashboardAvatarProps) {
  // Priority: sessionImage (from OAuth) > API route (for uploaded images) > fallback
  const [imageSrc, setImageSrc] = useState<string | null>(
    sessionImage || "/api/user/avatar"
  );
  const [hasError, setHasError] = useState(false);

  // If session image changes, update
  useEffect(() => {
    if (sessionImage) {
      setImageSrc(sessionImage);
      setHasError(false);
    } else {
      // No session image, try API route for uploaded images
      setImageSrc("/api/user/avatar");
      setHasError(false);
    }
  }, [sessionImage]);

  // Show fallback avatar (initial) if error loading image
  if (hasError) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center w-full h-full",
        className
      )}>
        <span className="text-white text-xl font-black">{name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc || ""}
      alt="Profile"
      className={cn("w-full h-full object-cover", className)}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
