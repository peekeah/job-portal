import student from "@/models/student";
import { errorHandler } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/token"

export async function GET(req: NextRequest) {

  try {

    const token = await authMiddleware(req, "student")
    const studentData = await student.findOne({ email: token.email });

    const studentRecord = await student.findById(studentData._id).populate({
      path: "applied_jobs.job_id",
      populate: {
        path: "company",
        model: "company",
        select: "-password -applicants",
      },
    });

    return NextResponse.json({ status: true, data: studentRecord?.applied_jobs });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}
