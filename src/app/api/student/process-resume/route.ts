import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    // Get PDF file from request
    const pdfBytes = await req.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get first page and add text (mock alteration)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    firstPage.drawText("[Mocked: Resume processed by NextHire]", {
      x: 50,
      y: 50,
      size: 16,
      font: helveticaFont,
      color: undefined, // default black
    });

    // Return updated PDF
    const updatedPdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(updatedPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (err) {
    return NextResponse.json({ status: false, error: "Failed to process PDF" }, { status: 500 });
  }
}
