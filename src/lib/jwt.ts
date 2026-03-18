import jwt from "jsonwebtoken";

export const signToken = (payload: Record<string, string | number>) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  const token = jwt.sign({ data: payload }, secret, { expiresIn: "1h" });
  return token;
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  const decodedData = jwt.verify(token, secret);
  return decodedData;
};
