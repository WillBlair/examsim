"use client";

import { useState, useRef, useEffect } from "react";
import { FilePdf, FileText, FileDoc, X, FolderSimplePlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadAreaProps {
  onFilesChange?: (files: File[]) => void;
}

export function UploadArea({ onFilesChange }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hidden native file input to attach to the form submission
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
      return <FilePdf weight="duotone" className="w-8 h-8 text-red-500" />;
    }
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return <FileDoc weight="duotone" className="w-8 h-8 text-blue-600" />;
    }
    return <FileText weight="duotone" className="w-8 h-8 text-zinc-400" />;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Hidden inputs for form submission */}
      <input
        type="file"
        name="files"
        multiple
        className="hidden"
        ref={nativeInputRef}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 relative overflow-hidden border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer group isolate",
          isDragging
            ? "border-brand-orange bg-brand-orange/10 scale-[0.99]"
            : "border-zinc-300 hover:border-brand-orange/50 bg-zinc-50/50 hover:bg-zinc-50"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Diagonal Stripe Pattern Background */}
        <div className="absolute inset-0 -z-10 opacity-[0.6] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #d4d4d8 0, #d4d4d8 1px, transparent 0, transparent 10px)`
          }}
        />

        {/* Gradient Blur Spot */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-white/80" />
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-orange/5 blur-3xl rounded-full transition-opacity duration-500",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )} />

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleFileSelect}
        />

        <div className={cn(
          "relative w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2",
        )}>
          {/* Icon Container */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300",
            isDragging ? "bg-brand-orange rotate-3 scale-110 shadow-brand-orange/30" : "bg-white shadow-zinc-200 group-hover:shadow-2xl group-hover:shadow-zinc-200/50"
          )}>
            <FolderSimplePlus
              weight={isDragging ? "fill" : "duotone"}
              className={cn(
                "w-7 h-7 transition-colors duration-300",
                isDragging ? "text-zinc-900" : "text-brand-orange"
              )}
            />
          </div>

          {/* Floating Elements Decoration */}
          <div className={cn("absolute -right-4 -top-2 p-2 bg-white rounded-lg shadow-lg transition-all duration-500 delay-75", isDragging ? "translate-x-2 -translate-y-2 rotate-12 scale-110" : "translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0")}>
            <FilePdf weight="duotone" className="w-6 h-6 text-red-500" />
          </div>
          <div className={cn("absolute -left-4 top-12 p-2 bg-white rounded-lg shadow-lg transition-all duration-500 delay-100", isDragging ? "-translate-x-2 translate-y-2 -rotate-12 scale-110" : "-translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0")}>
            <FileText weight="duotone" className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">
          Upload your course materials
        </h3>
        <p className="text-zinc-400 font-medium mb-4 max-w-sm mx-auto text-xs leading-relaxed">
          Drag and drop your syllabus, slides, or notes here to start generating your exam.
        </p>

        <Button type="button" className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm hover:shadow-md transition-all">
          Select Files
        </Button>

        <div className="flex items-center gap-2 mt-4 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
          <div className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
            <FilePdf weight="duotone" className="w-5 h-5 text-red-500" />
          </div>
          <div className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
            <FileDoc weight="duotone" className="w-5 h-5 text-blue-500" />
          </div>
          <div className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
            <FileText weight="duotone" className="w-5 h-5 text-zinc-500" />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          PDF • DOCX • TXT • PPTX
        </p>
      </div>

      {/* File List Preview */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            <span>Attached Files ({files.length})</span>
            <button onClick={() => setFiles([])} className="text-red-500 hover:text-red-600 transition-colors">Clear All</button>
          </div>
          <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, index) => (
              <div key={index} className="group flex items-center justify-between p-4 bg-white border border-zinc-100 hover:border-brand-orange/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-zinc-100 group-hover:bg-brand-orange/10 transition-colors">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate pr-4 group-hover:text-orange-700 transition-colors">{file.name}</div>
                    <div className="text-xs text-zinc-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
