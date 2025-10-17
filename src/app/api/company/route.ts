import company from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    try {
      const payload = await req.body().json();
      if (!payload.email) throw new Error("email is required");

      const existCompany = await company.findOne({ email: payload.email });

      if (existCompany) throw new Error("Company already exists");

      if (!payload.password) new CustomError("password is required", 401);

      payload.password = await hashPassword(payload.password);

      await new company(req.body).save();

      const token = jwt.sign(
        { email: payload.email },
        process.env.JWT_SECRET || "secret"
      );

      Response.json({
        status: true,
        data: { token },
      });
    } catch (err) {
      errorHandler(err, res);
    }
  }
}
