import student from "@/models/student";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/token"

export async function GET(req: NextRequest) {

  try {

    const token = await getToken(req)
    if (!token) throw new CustomError("unauthorized", 401)

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
