"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Viewer, Worker } from '@react-pdf-viewer/core';

type Props = {
  resumeUrl: string;
  onClose: () => void;
}

const PDFViewer = ({ resumeUrl, onClose }: Props) => {
  return (
    <div className="relative border rounded-lg bg-white dark:bg-gray-900" style={{ height: '750px' }}>
      <button
        onClick={() => onClose()}
        className="cursor-pointer absolute z-10 top-0 right-8">X
      </button>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={resumeUrl} />
      </Worker>
    </div>
  );
}

export default PDFViewer
