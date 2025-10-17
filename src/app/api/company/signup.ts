import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import company from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method Not Allowed" });
  }

  try {
    const payload = req.body;

    if (!payload.email) throw new CustomError("email is required", 400);

    const existCompany = await company.findOne({ email: payload.email });
    if (existCompany) throw new CustomError("Company already exists", 403);

    if (!payload.password) throw new CustomError("password is required", 400);

    payload.password = await hashPassword(payload.password);
    await new company(payload).save();

    const token = jwt.sign({ email: payload.email }, process.env.JWT_SECRET || "secret");

    res.status(200).json({
      status: true,
      data: { token },
    });
  } catch (err) {
    errorHandler(err, res);
  }
}
