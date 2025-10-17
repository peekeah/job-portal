import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import student from "@/models/student";
import { comparePassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Student login API called");
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) throw new CustomError("Email & password must be provided", 400);

    const existStudent = await student.findOne({ email });
    if (!existStudent) throw new CustomError("Student not found", 403);

    const isMatch = await comparePassword(password, existStudent.password);
    if (!isMatch) throw new CustomError("Password mismatch", 403);

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret");

    res.status(200).json({ status: true, data: { token } });
  } catch (err) {
    errorHandler(err, res);
  }
}
