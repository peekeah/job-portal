import { NextApiRequest, NextApiResponse } from "next";
import job from "@/models/job";
import company from "@/models/company";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET all jobs
    if (req.method === "GET") {
      const jobs = await job.find().populate("company", "-password");
      return res.status(200).json({ status: true, data: jobs });
    }

    // POST new job (company only)
    else if (req.method === "POST") {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new CustomError("Token missing", 401);
      const token = authHeader.split(" ")[1];
      const decoded: any = require("jsonwebtoken").verify(token, process.env.JWT_SECRET || "secret");

      const companyData = await company.findOne({ email: decoded.email });
      if (!companyData) throw new CustomError("Company not found", 403);

      req.body.company = companyData._id;
      await new job(req.body).save();

      return res.status(200).json({ status: true, data: "successfully posted job" });
    }
    else {
      return res.status(405).json({ status: false, error: "Method Not Allowed" });
    }
  } catch (err) {
    errorHandler(err);
  }
}
