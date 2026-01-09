"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Button } from "./ui/button";
import { useEffect } from "react";
import axios from "axios";

type Props = {
  onApply: () => Promise<void>;
  onClose: () => void;
  applying: boolean;
};

export default function EnhancedPreviewModal({ onApply, onClose, applying }: Props) {
  useEffect(() => {
    try {
      const jobId = '28a0d5ef-4d32-4644-93c7-ca6beeb359b8'
      const res = axios.post("/api/jobs/apply-enhanced/" + jobId)
      console.log("rrs:", res)
    } catch (err) {
      console.log("err:", err)
    }
  }, [])

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/60 p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full m-auto max-w-7xl shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-32 text-3xl">
            Hello world!
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onApply()} disabled={applying}>
            {applying ? "Applying..." : "Apply with edits"}
          </Button>
        </div>
      </div>
    </div>
  );
}
