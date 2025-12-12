"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, Spinner } from "@phosphor-icons/react";
import { updateProfilePicture } from "@/app/actions/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  userName?: string | null;
}

export function ProfilePictureUpload({ currentImage, userName }: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  // If currentImage is null (e.g. from session where base64 was stripped),
  // we fallback to our API route which reads from DB.
  // We use a timestamp query param to force refresh the image after upload.
  const [imageSrc, setImageSrc] = useState<string | null>(currentImage || "/api/user/avatar");
  const [imgKey, setImgKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // If the parent passes a new image (e.g. from Google login), update our state
  useEffect(() => {
    if (currentImage) {
      setImageSrc(currentImage);
    }
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size too large. Please select an image under 2MB.");
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview and upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Show immediate preview
        setImageSrc(base64String);

        const result = await updateProfilePicture(base64String);
        
        if (result.error) {
          alert(result.error);
          // Revert to original on error
          setImageSrc(currentImage || "/api/user/avatar");
        } else {
          // Success!
          router.refresh();
          
          // Force reload the API image by updating the key
          // This ensures that when the user comes back, the browser cache is invalidated
          // for the API route if they were using it.
          // Note: If they navigated away and back, the component remounts with 
          // imageSrc = "/api/user/avatar", which will fetch the new image from DB.
          setTimeout(() => {
             setImgKey(Date.now());
             // Ensure we are using the API route now, as the session won't have the image
             setImageSrc("/api/user/avatar");
          }, 500);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      setImageSrc(currentImage || null);
    }
  };

  return (
    <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileSelect}
      />
      
      <div className={cn(
        "w-32 h-32 rounded-3xl border-[4px] border-zinc-900 flex items-center justify-center text-white text-4xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 group-hover/avatar:scale-105 overflow-hidden relative",
        !imageSrc && "bg-gradient-to-br from-blue-400 to-indigo-600"
      )}>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            // If it's an API route, append timestamp to bust cache
            src={imageSrc.includes("/api/") ? `${imageSrc}?t=${imgKey}` : imageSrc} 
            alt="Profile" 
            className="w-full h-full object-cover" 
            onError={(e) => {
                // If API returns 404 or fails, hide the image and show initials
                setImageSrc(null);
            }}
          />
        ) : (
          userName?.charAt(0) || 'U'
        )}
        
        {/* Overlay for upload indication */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
           <Camera weight="bold" className="w-8 h-8 text-white" />
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <Spinner weight="bold" className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="absolute -bottom-3 -right-3 bg-white border-[3px] border-zinc-900 p-2.5 rounded-xl shadow-sm hover:scale-110 transition-transform hover:bg-zinc-50 z-10 pointer-events-none group-hover/avatar:scale-110">
        <User weight="bold" className="w-5 h-5 text-zinc-900" />
      </div>
    </div>
  );
}
