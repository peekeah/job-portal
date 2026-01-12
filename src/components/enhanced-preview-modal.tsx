"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import useSWRMutation from "swr/mutation"

import { Button } from "./ui/button";
import ResumeViewer from "./resume-viewer";
import { Spinner } from "./ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import axios from "axios";
import { useEffect } from "react";

type Props = {
  jobId: string;
  onCloseAction: () => void;
  onApplyAction: (jobId: string, resumeId: string) => {};
  applying: boolean;
};

const getEnhancedResume = async (url: string, { arg }: { arg: string }) => {
  const res = await axios.post(url + arg)
  return res.data
}

export default function EnhancedjobIdPreviewModal({ onApplyAction, onCloseAction, applying, jobId }: Props) {
  const { data: enhancedResumeRes, trigger: getEnhancedResumeAction, isMutating: isLoading } = useSWRMutation("/api/jobs/apply-enhanced/", getEnhancedResume)

  useEffect(() => {
    if (jobId) {
      getEnhancedResumeAction(jobId)
    }
  }, [])

  return (
    <Dialog open={true} >
      <DialogContent showCloseButton={false} className="overflow-auto min-w-4xl max-h-[90vh]">
        <DialogHeader className="hidden">
          <DialogTitle>title</DialogTitle>
        </DialogHeader>
        {
          isLoading ?
            <div className="flex justify-center items-center h-screen">
              <Spinner />
            </div> :
            <>
              <div>
                <ResumeViewer resume={enhancedResumeRes?.data} />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={onCloseAction}>Close</Button>
                <Button onClick={() => onApplyAction(jobId, enhancedResumeRes.id)} disabled={applying}>
                  {applying ? <Spinner /> : "Apply"}
                </Button>
              </div>
            </>
        }
      </DialogContent>
    </Dialog >
  );
}
