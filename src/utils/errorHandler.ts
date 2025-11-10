import { Prisma } from "@/generated/prisma";
import { MongooseError } from "mongoose";
import { z, ZodError } from "zod";

export class CustomError extends Error {
  readonly status: number = 500;
  readonly message: string = 'Internal Server Error';

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message
  }
}

type Response = {
  status: number;
  message: string;
  error: any;
}

export const errorHandler = (err: unknown): [any, any] => {

  const response: Response = {
    status: 500,
    message: 'Internal Server Error',
    error: null,
  }

  if (err instanceof ZodError) {
    response.error = z.treeifyError(err);
    response.message = "validationErrors";
    response.status = 422;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    response.status = 400;
    response.error = err.meta;
    switch (err.code) {
      case "P2002":
        // Unique constraint failed
        response.message = "Unique constraint failed";
        break;
      case "P2003":
        // Foreign key constraint failed
        response.message = "Foreign key constraint failed";
        break
      case "P2025":
        // Record not found
        response.message = "Record not found";
      default:
        response.message = `Prisma error: ${err.code}`;
    }
  }

  if (err instanceof MongooseError) {
    response.message = err.message
    response.status = 400
  }

  if (err instanceof CustomError) {
    console.log("cust err", err.message, err.status)
    response.message = err.message;
    response.status = err.status;
  }

  return [
    {
      status: false,
      message: response.message,
      error: response.error,
    },
    { status: response.status }
  ]

}
