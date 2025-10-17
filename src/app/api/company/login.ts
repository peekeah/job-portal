import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import company from "@/models/company";
import { comparePassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) throw new CustomError("Email & password must be provided", 400);

    const existCompany = await company.findOne({ email });
    if (!existCompany) throw new CustomError("Company not found", 403);

    const isMatch = await comparePassword(password, existCompany.password);
    if (!isMatch) throw new CustomError("Password mismatch", 403);

    const token = jwt.sign({ email: existCompany.email }, process.env.JWT_SECRET || "secret");

    res.status(200).json({
      status: true,
      data: { token },
    });
  } catch (err) {
    errorHandler(err, res);
  }
}
