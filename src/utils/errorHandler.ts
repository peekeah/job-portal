import { MongooseError } from "mongoose";

export class CustomError extends Error {
  readonly status: number = 500;
  readonly message: string = 'Internal Server Error';

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message
  }
}

export const errorHandler = (err: unknown): [any, any] => {

  console.log("err:", err)

  const response = {
    status: 500,
    message: 'Internal Server Error'
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
      error: response.message,
    },
    { status: response.status }
  ]

}
