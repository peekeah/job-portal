"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import ResumeViewer from "./resume-viewer";
import { Resume, resumeMock } from "@/mock/resume";

type Props = {
  jobId: string;
  onApply: () => Promise<void>;
  onClose: () => void;
  applying: boolean;
};

export default function EnhancedPreviewModal({ jobId, onApply, onClose, applying }: Props) {
  const [resume, setResume] = useState<Resume>(resumeMock)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.post("/api/jobs/apply-enhanced/" + jobId)
      setResume(res.data.data)
    } catch (err) {
      alert(err)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/60 p-4 z-50 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full m-auto max-w-4xl shadow-xl">
        <div>
          <ResumeViewer data={resume}/>
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
