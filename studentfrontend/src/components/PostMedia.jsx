import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
  Download,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import 'react-pdf/dist/Page/TextLayer.css';
import './PostMedia.css';

//react-pdf to preview and render the pdf assignment
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PostMedia = ({ type, url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fullUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const next = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const prev = () => setPageNumber((prev) => Math.max(prev - 1, 1));

  if (type === "photo") {
    return (
      <div className="media-wrapper photo-wrapper">
        <img
          src={fullUrl}
          alt="Post media"
          className="instagram-media"
          loading="lazy"
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="media-wrapper video-wrapper">
        <video controls className="instagram-media" preload="metadata">
          <source src={fullUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (type === "assignment" || url.endsWith(".pdf")) {
    return (
      <div className="media-wrapper pdf-wrapper">
        {isLoading && (
          <div className="pdf-loader">
            <Loader2 size={32} className="animate-spin" />
            <span>Loading Document...</span>
          </div>
        )}
        <div className="pdf-document-container">
          <Document
            file={fullUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              width={600}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page"
            />
          </Document>
        </div>

        {numPages && (
          <div className="pdf-controls">
            <button
              onClick={prev}
              disabled={pageNumber <= 1}
              className="pdf-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="pdf-page-indicator">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={next}
              disabled={pageNumber >= numPages}
              className="pdf-btn"
            >
              <ChevronRight size={20} />
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-action-btn"
            >
              <Maximize2 size={16} /> Open
            </a>
            <a href={fullUrl} download className="pdf-action-btn">
              <Download size={16} /> Save
            </a>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PostMedia;
