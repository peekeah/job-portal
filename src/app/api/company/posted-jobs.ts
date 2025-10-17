import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import company from "@/models/company";
import job from "@/models/job";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: false, error: "Method Not Allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new CustomError("Token missing", 401);

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const existCompany = await company.findOne({ email: decoded.email });
    if (!existCompany) throw new CustomError("Company not found", 404);

    const result = await job.find({ company: existCompany._id }).populate("company");

    res.status(200).json({
      status: true,
      data: result,
    });
  } catch (err) {
    errorHandler(err, res);
  }
}
