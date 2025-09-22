import { AppError } from "../utils/errors";

export function errorHandler(err: any, req: any, res: any, next: any) {
  if (err instanceof AppError) {
    console.warn(`Handled AppError: ${err.message}`, err.details);

    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details || null,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === 11000) {
    console.warn("Duplicate claimId detected");
    return res.status(409).json({
      error: "Duplicate claimId",
      details: err.keyValue,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  console.error("Unhandled error", err);
  res.status(500).json({
    error: "Internal Server Error",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}
