"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Loader2Icon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

// react-pdf needs a worker script to parse PDFs off the main thread
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3));
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.4));
  }

  function rotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#E4E2DC] bg-[#FAFAF7] px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F] disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="min-w-[70px] text-center text-sm tabular-nums text-[#4A4D57]">
            {numPages ? `${pageNumber} / ${numPages}` : "—"}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F] disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F]"
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </button>

          <span className="min-w-[45px] text-center text-sm tabular-nums text-[#4A4D57]">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F]"
            aria-label="Zoom in"
          >
            <ZoomInIcon className="h-4 w-4" />
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F]"
            aria-label="Download PDF"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={rotate}
            className="rounded-md p-2 text-[#4A4D57] transition-colors hover:bg-[#F5F3EE] hover:text-[#14161F]"
            aria-label="Rotate"
          >
            <RotateCwIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex flex-1 justify-center overflow-auto bg-[#F5F3EE] py-6">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          
          loading={
            <div className="flex h-40 items-center justify-center">
              <Loader2Icon className="h-6 w-6 animate-spin text-[#4F46E5]" />
            </div>
          }
          error={
            <div className="p-4 text-sm text-[#DC2626]">
              Failed to load PDF{error ? `: ${error}` : ""}.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className="shadow-lg"
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>
    </div>
  );
}

export default PdfView;