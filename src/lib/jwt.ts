import jwt from "jsonwebtoken";
import { getEnv } from "./config";

export const signToken = (payload: Record<string, string | number>) => {
  const secret = getEnv("JWT_SECRET")
  const token = jwt.sign({ data: payload }, secret, { expiresIn: "1h" });
  return token;
};

export const verifyToken = (token: string) => {
  const secret = getEnv("JWT_SECRET")
  const decodedData = jwt.verify(token, secret);
  return decodedData;
};
