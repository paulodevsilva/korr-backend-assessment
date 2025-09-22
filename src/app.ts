import express from "express";
import { connectMongo } from "./config/mongo";
import { errorHandler } from "./middleware/error";
import claimsRouter from "./routes/claim";

export async function createApp() {
  const app = express();

  app.use(express.json());

  if (process.env.NODE_ENV !== "test") {
    await connectMongo();
  }

  app.use("/claims", claimsRouter);

  app.use(errorHandler);

  return app;
}
