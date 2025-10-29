import job from "@/models/job";
import student from "@/models/student";
import { CustomError, errorHandler } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

const selectCandidates = async (req: NextRequest) => {

  try {
    const { jobId, studentId, applicantStatus } = await req.json()

    if (!jobId || !studentId || !applicantStatus) throw new CustomError("Missing mandatory field", 400);
    if (!["applied", "shortlisted", "hired"].includes(applicantStatus))
      throw new CustomError("Wrong value for applicantStatus", 400);

    const found = await job.findOne({
      _id: jobId,
      $or: [
        { "applicants.applied": { $in: studentId } },
        { "applicants.shortlisted": { $in: studentId } },
        { "applicants.hired": { $in: studentId } },
      ],
    });

    if (!found) throw new CustomError("Candidate not found", 403);

    // Remove student from all lists first
    await job.updateOne(
      { _id: jobId },
      {
        $pull: {
          "applicants.applied": studentId,
          "applicants.shortlisted": studentId,
          "applicants.hired": studentId,
        },
      }
    );

    // Push into correct status
    const schemaField = `applicants.${applicantStatus}`;
    await job.findByIdAndUpdate(jobId, { $push: { [schemaField]: studentId } });

    // Update student's applied_jobs status
    await student.findOneAndUpdate(
      { _id: studentId, "applied_jobs.job_id": jobId },
      { $set: { "applied_jobs.$.status": applicantStatus } },
      { new: true }
    );

    return NextResponse.json({ status: true, data: "successfully updated status" })

  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export const POST = selectCandidates;
