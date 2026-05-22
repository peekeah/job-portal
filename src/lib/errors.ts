export class CustomError extends Error {
  readonly status: number = 500;
  readonly message: string = 'Internal Server Error';

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
