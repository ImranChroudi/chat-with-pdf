"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  X,
  ScanLine,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useUpload from "@/hooks/useUpload";
import { StatusText } from "@/hooks/useUpload";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 KB";
  const units = ["bytes", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

// Small registration-mark corner, echoes a scanner/intake stamp.
// Purely decorative — sits on top of the dropzone.
function CornerMark({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const styles: Record<string, string> = {
    tl: "top-3 left-3 border-t-2 border-l-2 rounded-tl-[6px]",
    tr: "top-3 right-3 border-t-2 border-r-2 rounded-tr-[6px]",
    bl: "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-[6px]",
    br: "bottom-3 right-3 border-b-2 border-r-2 rounded-br-[6px]",
  };
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-4 w-4 border-[#4F46E5]/0 transition-colors duration-300 group-hover:border-[#4F46E5]/40 [.is-active_&]:border-[#4F46E5] ${styles[position]}`}
    />
  );
}

function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  // useEffect(() => {
  //   if (status === StatusText.UPLOADED && fileId) {
  //     router.push(`/chat/${fileId}`);
  //   }
  // }, [status, fileId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    console.log("Dropped file:", file);
    if (file) {
      console.log("Uploading file:", file);
      await handleUpload(file);
    }
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const isUploading = status === StatusText.UPLOADING;
  const isGenerating = status === StatusText.GENERTATING;
  const isError = status === StatusText.SAVING;
  const isActive = isDragActive || isFocused;

  return (
    <div className="[font-family:var(--font-body)] flex min-h-auto flex-col items-center justify-center gap-8 px-6 py-10">
      <div className="text-center">
        <span className="[font-family:var(--font-mono)] inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#4F46E5]">
          <ScanLine className="h-3.5 w-3.5" aria-hidden />
          Upload a document
        </span>
        <h1 className="mt-3 [font-family:var(--font-display)] text-3xl font-medium tracking-tight text-[#14161F] md:text-4xl">
          Add a PDF to start chatting
        </h1>
        <p className="mt-2 text-sm text-[#4A4D57]">
          Drop in a single PDF and we&apos;ll get it ready for you.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`group relative flex w-full max-w-xl cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center shadow-sm transition-all duration-300 ease-out ${
          isActive ? "is-active" : ""
        } ${
          isDragActive
            ? "scale-[1.01] border-[#4F46E5] bg-[#EEF0FF] shadow-[0_0_0_4px_rgba(79,70,229,0.08)]"
            : isFocused
              ? "border-[#4F46E5] bg-[#F5F3EE]"
              : "border-[#E4E2DC] bg-[#F5F3EE] hover:border-[#4F46E5]/60 hover:bg-[#EEF0FF]/60"
        }`}
      >
        <input {...getInputProps()} />

        <CornerMark position="tl" />
        <CornerMark position="tr" />
        <CornerMark position="bl" />
        <CornerMark position="br" />

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
            isDragActive
              ? "scale-110 bg-[#4F46E5]"
              : "bg-[#14161F] group-hover:scale-105"
          }`}
        >
          <UploadCloud
            className={`h-6 w-6 text-[#FFE066] transition-transform duration-300 ${
              isDragActive ? "-translate-y-0.5" : ""
            }`}
          />
        </div>

        {isDragActive ? (
          <p className="text-[15px] font-medium text-[#14161F]">
            Drop it right here
          </p>
        ) : (
          <>
            <p className="text-[15px] font-medium text-[#14161F]">
              Drag &apos;n&apos; drop a PDF here
            </p>
            <p className="text-sm text-[#4A4D57]">
              or{" "}
              <span className="font-medium text-[#4F46E5] underline decoration-[#4F46E5]/30 underline-offset-4">
                click to browse
              </span>{" "}
              your files
            </p>
          </>
        )}
      </div>

      <div className="w-full max-w-xl">
        {isUploading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-[#4A4D57]">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" aria-hidden />
                Uploading&hellip;
              </span>
              <span className="[font-family:var(--font-mono)] tabular-nums text-[#14161F]">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E4E2DC]">
              <div
                className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {isGenerating && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#4A4D57]">
            <Sparkles className="h-4 w-4 animate-pulse text-[#4F46E5]" aria-hidden />
            <span>Getting your document ready&hellip;</span>
          </div>
        )}
        {isError && (
          <p className="flex items-center gap-2 text-sm text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            Error uploading file. Please try again.
          </p>
        )}
      </div>

      {files.length > 0 && (
        <aside className="w-full max-w-xl">
          <h4 className="[font-family:var(--font-mono)] mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#4A4D57]">
            {files.length} {files.length === 1 ? "file" : "files"} ready
          </h4>
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center gap-3 rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] px-4 py-3 transition-colors hover:border-[#4F46E5]/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#14161F]">
                  <FileText className="h-4 w-4 text-[#FFE066]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#14161F]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#4A4D57]">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="rounded-md p-1.5 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F]"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

export default FileUploader;