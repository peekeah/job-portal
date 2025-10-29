import job from "@/models/job";
import student from "@/models/student";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/token"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const jobId = params.id;
    if (!jobId) throw new CustomError("Job id missing", 400);

    const token = await authMiddleware(req, "student");

    const studentData = await student.findOne({ email: token?.email })

    if (!studentData) {
      throw new CustomError("student not found", 403)
    }

    if (!jobId) {
      throw new CustomError("Job id missing", 400);
    }

    if (!studentData?._id) throw new CustomError("Student data missing", 400);

    const found = await job.findOne({
      _id: jobId,
      $or: [
        { "applicants.applied": { $in: studentData._id } },
        { "applicants.shortlisted": { $in: studentData._id } },
        { "applicants.hired": { $in: studentData._id } },
      ],
    });

    if (found) throw new CustomError("You already applied for this job", 403);

    await job.findByIdAndUpdate(jobId, { $push: { "applicants.applied": studentData._id } });
    await student.findByIdAndUpdate(studentData._id, { $push: { applied_jobs: { job_id: jobId } } });

    return NextResponse.json({ status: true, data: "successfully applied for the job" });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}


