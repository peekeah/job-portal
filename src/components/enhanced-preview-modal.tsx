"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Button } from "./ui/button";
import ResumeViewer from "./resume-viewer";
import { Resume } from "@/mock/resume";

type Props = {
  jobId: string;
  resume: Resume;
  onApply: () => Promise<void>;
  onClose: () => void;
  applying: boolean;
  isLoading: boolean;
};

export default function EnhancedjobIdPreviewModal({ isLoading, onApply, onClose, applying, resume }: Props) {

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/60 p-4 z-50 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full m-auto max-w-4xl shadow-xl">
        {
          isLoading ?
            <div>...loading</div> :
            <>
              <div>
                <ResumeViewer data={resume} />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => onApply()} disabled={applying}>
                  {applying ? "Applying..." : "Apply with edits"}
                </Button>
              </div>
            </>
        }
      </div>
    </div>
  );
}
