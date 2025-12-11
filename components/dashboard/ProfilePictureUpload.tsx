"use client";

import { useState, useRef } from "react";
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
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreview(base64String);

        const result = await updateProfilePicture(base64String);
        
        if (result.error) {
          alert(result.error);
          setPreview(currentImage || null); // Revert
        } else {
          router.refresh();
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      setPreview(currentImage || null);
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
        !preview && "bg-gradient-to-br from-blue-400 to-indigo-600"
      )}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
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
