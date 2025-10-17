import { NextApiRequest, NextApiResponse } from "next";
import student from "@/models/student";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ status: false, error: "Method Not Allowed" });

  try {
    const studentData = req.body.studentData;

    if (!studentData?._id) throw new CustomError("Student data missing", 400);

    const studentRecord = await student.findById(studentData._id).populate({
      path: "applied_jobs.job_id",
      populate: {
        path: "company",
        model: "company",
        select: "-password -applicants",
      },
    });

    res.status(200).json({ status: true, data: studentRecord?.applied_jobs });
  } catch (err) {
    errorHandler(err, res);
  }
}
