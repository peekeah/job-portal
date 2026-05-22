import { 
  PrismaClientKnownRequestError, 
  PrismaClientUnknownRequestError, 
  PrismaClientValidationError 
} from '@prisma/client/runtime/library';
import { treeifyError, ZodError } from 'zod';
import { CustomError } from './errors';

type Response = {
  status: number;
  message: string;
  error: unknown;
};

type ResponseOut = {
  status: boolean;
  message: string;
  error: unknown;
};

type Status = {
  status: number;
};

export const errorHandler = (err: unknown): [ResponseOut, Status] => {
  const response: Response = {
    status: 500,
    message: 'Internal Server Error',
    error: null,
  };

  if (err instanceof ZodError) {
    response.error = treeifyError(err);
    response.message = 'validationErrors';
    response.status = 422;
  } else if (err instanceof PrismaClientKnownRequestError) {
    response.status = 400;
    response.error = err.meta;
    switch (err.code) {
      case 'P2002':
        // Unique constraint failed
        response.message = 'Unique constraint failed';
        break;
      case 'P2003':
        // Foreign key constraint failed
        response.message = 'Foreign key constraint failed';
        break;
      case 'P2025':
        // Record not found
        response.message = 'Record not found';
        break;
      default:
        response.message = `Prisma error: ${err.code}`;
    }
  } else if (err instanceof PrismaClientValidationError) {
    response.status = 400;
    response.message = 'Database validation error';
    response.error = err.message;
  } else if (err instanceof PrismaClientUnknownRequestError) {
    response.status = 500;
    response.message = 'Database unknown error';
    response.error = err.message;
  } else if (err instanceof CustomError) {
    response.message = err.message;
    response.status = err.status;
  } else if (err instanceof Error) {
    response.message = err.message;
    response.error = err.stack;
  }

  /* eslint-disable no-console */
  console.error('Error handled by errorHandler:', err);

  return [
    {
      status: false,
      message: response.message,
      error: response.error,
    },
    { status: response.status },
  ];
};
