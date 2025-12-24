"use client";

import { useState, useRef, useEffect } from "react";
import { FilePdf, FileText, FileDoc, X, UploadSimple, CheckCircle, CloudArrowUp, File } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UploadAreaProps {
  onFilesChange?: (files: File[]) => void;
  triggerRef?: React.RefObject<HTMLDivElement | null>;
  colorVariant?: 'green' | 'orange';
}

export function UploadArea({ onFilesChange, triggerRef, colorVariant = 'orange' }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Color configurations based on variant
  const colors = colorVariant === 'green' ? {
    borderActive: 'border-emerald-400',
    bgActive: 'bg-emerald-50/50',
    borderHover: 'hover:border-emerald-400',
    bgHover: 'hover:bg-emerald-50/30',
    iconBgActive: 'bg-emerald-100 border-emerald-300',
    iconBgHover: 'group-hover:bg-emerald-100 group-hover:border-emerald-300',
    iconColorActive: 'text-emerald-600',
    iconColorHover: 'group-hover:text-emerald-600',
    footerHover: 'hover:from-emerald-50/50 hover:to-teal-50/50',
    textHover: 'group-hover:text-emerald-700',
  } : {
    borderActive: 'border-amber-400',
    bgActive: 'bg-amber-50/50',
    borderHover: 'hover:border-amber-400',
    bgHover: 'hover:bg-amber-50/30',
    iconBgActive: 'bg-amber-100 border-amber-300',
    iconBgHover: 'group-hover:bg-amber-100 group-hover:border-amber-300',
    iconColorActive: 'text-amber-600',
    iconColorHover: 'group-hover:text-amber-600',
    footerHover: 'hover:from-amber-50/50 hover:to-orange-50/50',
    textHover: 'group-hover:text-amber-700',
  };

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
      return <FilePdf weight="duotone" className="w-6 h-6 text-red-500" />;
    }
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return <FileDoc weight="duotone" className="w-6 h-6 text-blue-500" />;
    }
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      return <File weight="duotone" className="w-6 h-6 text-orange-500" />;
    }
    return <FileText weight="duotone" className="w-6 h-6 text-zinc-500" />;
  };

  const getFileColor = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return "border-red-200 bg-red-50";
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return "border-blue-200 bg-blue-50";
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return "border-orange-200 bg-orange-50";
    return "border-zinc-200 bg-zinc-50";
  };

  return (
    <div className="w-full h-full flex flex-col">
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
        ref={triggerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer transition-all duration-300 ease-out flex-1 flex flex-col",
          "rounded-xl border-2 border-dashed overflow-hidden h-full",
          isDragging
            ? `${colors.borderActive} ${colors.bgActive}`
            : files.length > 0
              ? "border-zinc-200 bg-zinc-50/30"
              : `border-zinc-300 ${colors.borderHover} bg-zinc-50/30 ${colors.bgHover}`
        )}
      >
        {files.length === 0 ? (
          // EMPTY STATE
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
                isDragging
                  ? `border-2 ${colors.iconBgActive}`
                  : `bg-zinc-100 border-2 border-zinc-200 ${colors.iconBgHover}`
              )}
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            >
              <CloudArrowUp
                weight={isDragging ? "fill" : "duotone"}
                className={cn(
                  "w-10 h-10 transition-colors",
                  isDragging ? colors.iconColorActive : `text-zinc-400 ${colors.iconColorHover}`
                )}
              />
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-bold text-zinc-900">
                {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-zinc-500 font-medium">
                PDF, DOCX, PPTX or TXT (max 10MB)
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
                <FilePdf weight="fill" className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-red-600">PDF</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                <FileDoc weight="fill" className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">DOCX</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                <File weight="fill" className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600">PPTX</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full border border-zinc-200">
                <FileText weight="fill" className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-600">TXT</span>
              </div>
            </div>
          </div>
        ) : (
          // FILE LIST STATE
          <div className="flex-1 flex flex-col w-full h-full">
            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all group/item"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "p-2.5 rounded-xl border",
                        getFileColor(file.name)
                      )}>
                        {getFileIcon(file.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate max-w-[220px]">{file.name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle weight="fill" className="w-5 h-5" />
                        <span className="text-xs font-semibold">Ready</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X weight="bold" className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer Prompt */}
            <div className={cn(
              "p-4 border-t border-zinc-200 bg-gradient-to-r from-zinc-50 to-slate-50 transition-colors flex items-center justify-center text-sm font-semibold text-zinc-500",
              colors.footerHover,
              colors.textHover
            )}>
              <UploadSimple className="w-5 h-5 mr-2" />
              Click or drag to add more files
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
