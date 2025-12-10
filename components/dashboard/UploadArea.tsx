"use client";

import { useState, useRef, useEffect } from "react";
import { FilePdf, FileText, FileDoc, X, UploadSimple, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UploadAreaProps {
  onFilesChange?: (files: File[]) => void;
}

export function UploadArea({ onFilesChange }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files);
    }
  }, [files, onFilesChange]);

  const updateNativeInput = (currentFiles: File[]) => {
    if (nativeInputRef.current) {
      const dataTransfer = new DataTransfer();
      currentFiles.forEach(file => dataTransfer.items.add(file));
      nativeInputRef.current.files = dataTransfer.files;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => {
        const updated = [...prev, ...newFiles];
        updateNativeInput(updated);
        return updated;
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => {
        const updated = [...prev, ...newFiles];
        updateNativeInput(updated);
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      updateNativeInput(updated);
      return updated;
    });
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
      return <FilePdf weight="duotone" className="w-5 h-5 text-red-500" />;
    }
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return <FileDoc weight="duotone" className="w-5 h-5 text-blue-500" />;
    }
    return <FileText weight="duotone" className="w-5 h-5 text-zinc-500" />;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden inputs */}
      <input
        type="file"
        name="files"
        multiple
        className="hidden"
        ref={nativeInputRef}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".pdf,.docx,.pptx,.txt"
        onChange={handleFileSelect}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer transition-all duration-300 ease-out",
          "h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-8 bg-white",
          isDragging
            ? "border-accent-purple bg-accent-purple/5"
            : "border-zinc-200 hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all"
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
          isDragging && "bg-accent-purple/10"
        )}>
          <UploadSimple 
            weight={isDragging ? "fill" : "regular"}
            className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-accent-purple" : "text-zinc-400 group-hover:text-accent-purple"
            )} 
          />
        </div>
        
        <div className="space-y-1">
            <p className="text-base font-semibold text-zinc-900">
                Click to upload or drag and drop
            </p>
            <p className="text-sm text-zinc-500">
                PDF, DOCX, PPTX or TXT (max 10MB)
            </p>
        </div>
      </div>

      {/* File List - Ultra Clean */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-lg shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-zinc-50 rounded-md">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <X weight="bold" className="w-4 h-4" />
                    </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
