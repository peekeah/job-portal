"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { Button } from "./ui/button";

type Props = {
  fileUrl: string | null;
  onApply: () => Promise<void>;
  onClose: () => void;
  applying: boolean;
};

export default function EnhancedPreviewModal({ fileUrl, onApply, onClose, applying }: Props) {
  if (!fileUrl) return null;
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/60 p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full m-auto max-w-7xl shadow-xl">
        <div className="h-[75vh] border rounded overflow-hidden">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} />
          </Worker>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onApply} disabled={applying}>
            {applying ? "Applying..." : "Apply with this enhanced resume"}
          </Button>
        </div>
      </div>
    </div>
  );
}
