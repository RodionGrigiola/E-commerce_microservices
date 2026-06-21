export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Operational errors: trusted errors (e.g. validation, wrong password).
    // If false, it's a programmatic bug (e.g. database failure, syntax error).
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
