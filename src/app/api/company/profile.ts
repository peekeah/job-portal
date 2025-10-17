import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import company from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new CustomError("Token missing", 401);

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (req.method === "GET") {
      // --- GET profile ---
      const companyData = await company.findOne({ email: decoded.email }).select("-password");
      if (!companyData) throw new CustomError("Company not found", 404);

      return res.status(200).json({
        status: true,
        data: companyData,
      });
    } 
    else if (req.method === "POST") {
      // --- UPDATE profile ---
      const body = req.body;

      // Restricted fields
      if (body.name) delete body.name;
      if (body.founding_year) delete body.founding_year;

      // Hash password if provided
      if (body.password) {
        body.password = await hashPassword(body.password);
      }

      const updated = await company.findOneAndUpdate(
        { email: decoded.email },
        body,
        { new: true }
      );

      return res.status(200).json({
        status: true,
        data: updated,
      });
    } 
    else {
      return res.status(405).json({ status: false, error: "Method Not Allowed" });
    }
  } catch (err) {
    return errorHandler(err, res);
  }
}
