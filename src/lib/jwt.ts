import jwt from "jsonwebtoken";

export const signToken = (payload: any) => {
  try {
    const secret = process.env.JWT_SECRET || "some-random-password";
    const token = jwt.sign(
      {
        data: payload,
      },
      secret,
      { expiresIn: "1h" }
    );
    return token;
  } catch (err) {
    throw err
  }
};

export const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || "some-random-password";
    const decodedData = jwt.verify(token, secret)
    return decodedData
  } catch (err) {
    throw err;
  }
};
