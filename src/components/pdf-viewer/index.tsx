"use client";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Viewer, Worker } from '@react-pdf-viewer/core';
import axios from 'axios';
import { useMemo, useState } from 'react'
import { Button } from '../ui/button';

const PDFViewer = () => {
    // For now, default to the uploaded resume in public/resumes. In production, pass as prop from profile.
    const defaultPdfFileUrl = "/resumes/c360c999-1dd4-4441-ad48-bf71025839f5-1765256527714-my-resume.pdf";

    const [aiProcessing, setAiProcessing] = useState(false);
    const [updatedPdfUrl, setUpdatedPdfUrl] = useState<string | null>(null);

    const fileUrlToShow = useMemo(() => updatedPdfUrl ?? defaultPdfFileUrl, [updatedPdfUrl, defaultPdfFileUrl]);

    const handleProcessPdfWithAI = async () => {
        setAiProcessing(true);
        try {
            // Fetch the currently displayed resume bytes
            const res = await fetch(fileUrlToShow);
            if (!res.ok) throw new Error("Failed to fetch resume");
            const pdfArrayBuffer = await res.arrayBuffer();

            // Send to backend for mocked AI processing
            const aiRes = await axios.post("/api/student/process-resume", pdfArrayBuffer, {
                headers: { "Content-Type": "application/pdf" },
                responseType: "arraybuffer",
            });
            const blob = new Blob([aiRes.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setUpdatedPdfUrl(url);
        } catch (err) {
            console.error(err);
            alert("Failed to process PDF with AI");
        } finally {
            setAiProcessing(false);
        }
    };

    return (
        <div className="border rounded-lg bg-white dark:bg-gray-900" style={{ height: '750px' }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer fileUrl={fileUrlToShow} />
            </Worker>
            <Button onClick={handleProcessPdfWithAI} disabled={aiProcessing} className="mt-4">
                {aiProcessing ? "Processing..." : "Process with AI (Mock)"}
            </Button>
        </div>
    );
}

export default PDFViewer