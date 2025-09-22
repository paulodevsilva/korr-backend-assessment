import { InMemoryClaimsRepository } from "./in-memory-claim.repository";
import { MongoClaimsRepository } from "./mongo-claim.repository";

const isTest = process.env.NODE_ENV === "test";

export const repository = isTest
  ? new InMemoryClaimsRepository()
  : new MongoClaimsRepository();
