import { NextApiResponse } from "next";

export class CustomError extends Error {
   readonly status: number = 500;
   readonly message: string = 'Internal Server Error';

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export const errorHandler = (err: unknown, res:NextApiResponse) => {
    const response = {
        status: 500,
        message: 'Internal Server Error'
    }

    if (err instanceof CustomError) {
        response.message = err.message;
        response.status = err.status;
    }

    res.status(response.status).json({
        status: false,
        error: response.message
    });
}