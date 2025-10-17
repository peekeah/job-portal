import { NextApiRequest, NextApiResponse } from "next";
import job from "@/models/job";
import student from "@/models/student";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ status: false, error: "Method Not Allowed" });

  try {
    const jobId = req.query.id as string;
    const studentData = req.body.studentData;

    if (!jobId) throw new CustomError("Job id missing", 400);
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

    res.status(200).json({ status: true, data: "successfully applied for the job" });
  } catch (err) {
    errorHandler(err, res);
  }
}
