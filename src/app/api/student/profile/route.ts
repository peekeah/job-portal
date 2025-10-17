import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import student from "@/models/student";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new CustomError("Token missing", 401);

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (req.method === "GET") {
      // GET student profile
      const studentData = await student.findOne({ email: decoded.email }).select("-password");
      if (!studentData) throw new CustomError("Student not found", 404);

      return res.status(200).json({ status: true, data: studentData });
    }

    else if (req.method === "POST") {
      // UPDATE student profile
      const body = req.body;

      if (body.password) {
        body.password = await hashPassword(body.password);
      }

      const updated = await student.findOneAndUpdate({ email: decoded.email }, body, { new: true });

      return res.status(200).json({ status: true, data: updated });
    }

    else {
      return res.status(405).json({ status: false, error: "Method Not Allowed" });
    }
  } catch (err) {
    errorHandler(err, res);
  }
}
