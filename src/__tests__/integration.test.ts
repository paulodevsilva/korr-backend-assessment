import request from "supertest";
import { createApp } from "../app";
import { repository } from "../repositories";

let app: any;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  app = await createApp();
});

beforeEach(() => {
  if ((repository as any).claimsMap) {
    (repository as any).claimsMap.clear();
  }
});

describe("Claims API Integration", () => {
  it("should ingest a valid CSV and return success", async () => {
    const csvContent =
      `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes\n` +
      `CLM001,MBR001,HealthCare Inc,2025-05-14,12500,R51;K21.9\n` +
      `CLM002,MBR002,Dr. Smith Clinic,2025-05-13,8999,R10.9\n`;

    const res = await request(app)
      .post("/claims")
      .attach("file", Buffer.from(csvContent), "claims.csv");

    expect(res.status).toBe(200);
    expect(res.body.successCount).toBe(2);
    expect(res.body.errorCount).toBe(0);

    const getRes = await request(app).get("/claims");
    expect(getRes.status).toBe(200);
    expect(getRes.body.claims).toHaveLength(2);
  });

  it("should reject invalid rows in CSV", async () => {
    const csvContent =
      `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes\n` +
      `CLM003,,Bad Provider,2025-05-14,12500,R51\n` +
      `CLM004,MBR004,Dr. Green Clinic,2025-05-15,-5000,R07.0\n`;

    const res = await request(app)
      .post("/claims")
      .attach("file", Buffer.from(csvContent), "claims.csv");

    expect(res.status).toBe(200);
    expect(res.body.successCount).toBe(0);
    expect(res.body.errorCount).toBeGreaterThan(0);
    expect(res.body.errors[0].message).toContain("memberId");
    expect(res.body.errors[1].message).toContain("totalAmount");
  });

  it("should reject duplicate claimId in the same CSV", async () => {
    const csvContent =
      `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes\n` +
      `CLM010,MBR010,Clinic A,2025-05-14,3000,R51\n` +
      `CLM010,MBR011,Clinic B,2025-05-15,4000,J06.9\n`;

    const res = await request(app)
      .post("/claims")
      .attach("file", Buffer.from(csvContent), "claims.csv");

    expect(res.status).toBe(200);
    expect(res.body.successCount).toBe(1);
    expect(res.body.errorCount).toBe(1);
    expect(res.body.errors[0].message).toContain("Duplicate claimId");
  });

  it("should reject duplicate claimId already in repository", async () => {
    const firstUpload =
      `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes\n` +
      `CLM020,MBR020,Clinic X,2025-05-14,2000,R51\n`;

    await request(app)
      .post("/claims")
      .attach("file", Buffer.from(firstUpload), "claims.csv");

    const secondUpload =
      `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes\n` +
      `CLM020,MBR021,Clinic Y,2025-05-15,2500,J06.9\n`;

    const res = await request(app)
      .post("/claims")
      .attach("file", Buffer.from(secondUpload), "claims.csv");

    expect(res.status).toBe(200);
    expect(res.body.successCount).toBe(0);
    expect(res.body.errorCount).toBe(1);
    expect(res.body.errors[0].message).toContain("already exists");
  });
});
