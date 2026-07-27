"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 KB";
  const units = ["bytes", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div className="[font-family:var(--font-body)] flex min-h-auto flex-col items-center justify-center gap-8  px-6 py-10">
      <div className="text-center">
        <span className="[font-family:var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[#4F46E5]">
          Upload a document
        </span>
        <h1 className="mt-3 [font-family:var(--font-display)] text-3xl font-medium text-[#14161F] md:text-4xl">
          Add a PDF to start chatting
        </h1>
      </div>

      <div
        {...getRootProps()}
        className={`flex w-full max-w-xl cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-[#4F46E5] bg-[#EEF0FF]"
            : isFocused
              ? "border-[#4F46E5] bg-[#F5F3EE]"
              : "border-[#E4E2DC] bg-[#F5F3EE] hover:border-[#4F46E5]/60 hover:bg-[#EEF0FF]/60"
        }`}
      >
        <input {...getInputProps()} />
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isDragActive ? "bg-[#4F46E5]" : "bg-[#14161F]"
          }`}
        >
          <UploadCloud className="h-6 w-6 text-[#FFE066]" />
        </div>

        {isDragActive ? (
          <p className="text-[15px] font-medium text-[#14161F]">Drop it right here</p>
        ) : (
          <>
            <p className="text-[15px] font-medium text-[#14161F]">
              Drag &apos;n&apos; drop a PDF here
            </p>
            <p className="text-sm text-[#4A4D57]">
              or <span className="font-medium text-[#4F46E5]">click to browse</span> your files
            </p>
          </>
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
                className="flex items-center gap-3 rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#14161F]">
                  <FileText className="h-4 w-4 text-[#FFE066]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#14161F]">{file.name}</p>
                  <p className="text-xs text-[#4A4D57]">{formatBytes(file.size)}</p>
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