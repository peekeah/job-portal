import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import student from "@/models/student";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method Not Allowed" });
  }

  try {
    const { email, password, ...rest } = req.body;

    if (!email) throw new CustomError("Email is required", 400);
    if (!password) throw new CustomError("Password is required", 400);

    const existStudent = await student.findOne({ email });
    if (existStudent) throw new CustomError("Student already exists", 403);

    const hashedPassword = await hashPassword(password);

    const response = new student({ email, password: hashedPassword, ...rest });
    await response.save();

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret");

    res.status(200).json({ status: true, data: { token } });
  } catch (err) {
    errorHandler(err, res);
  }
}
