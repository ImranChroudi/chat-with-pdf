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
      <div className="flex items-center justify-between gap-2 border-b bg-white px-3 py-2 sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="text-sm text-gray-600 min-w-[70px] text-center">
            {numPages ? `${pageNumber} / ${numPages}` : "—"}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </button>

          <span className="text-sm text-gray-600 min-w-[45px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Zoom in"
          >
            <ZoomInIcon className="h-4 w-4" />
          </button>

          <button
            
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Zoom in"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="h-4 w-4" />
            </a>
          </button>

         
          <button
            onClick={rotate}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Rotate"
          >
            <RotateCwIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-6">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          
          loading={
            <div className="flex items-center justify-center h-40">
              <Loader2Icon className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          }
          error={
            <div className="text-red-500 text-sm p-4">
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