export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: any) {
    super(message, 422, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: any) {
    super(message, 404, details);
  }
}

export class DuplicateError extends AppError {
  constructor(message = "Duplicate resource", details?: any) {
    super(message, 409, details);
  }
}
