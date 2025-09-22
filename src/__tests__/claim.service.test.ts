import { validateClaimRow } from "../utils/validation";

describe("Claim Validation", () => {
  it("should validate correct claim data", () => {
    const validRow = {
      claimId: "CLM001",
      memberId: "MBR001",
      provider: "Test Provider",
      serviceDate: "2025-05-14",
      totalAmount: "12500",
      diagnosisCodes: "R51;K21.9",
    };

    const result = validateClaimRow(validRow, 1);
    expect(result.valid).toBe(true);
    expect(result.claim).toBeDefined();
  });

  it("should reject missing memberId", () => {
    const invalidRow = {
      claimId: "CLM002",
      memberId: "",
      provider: "Test Provider",
      serviceDate: "2025-05-14",
      totalAmount: "12500",
    };

    const result = validateClaimRow(invalidRow, 2);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("memberId");
  });

  it("should reject non-positive totalAmount", () => {
    const invalidRow = {
      claimId: "CLM003",
      memberId: "MBR002",
      provider: "Test Provider",
      serviceDate: "2025-05-14",
      totalAmount: "-5000",
    };

    const result = validateClaimRow(invalidRow, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("totalAmount");
  });

  it("should reject future service dates", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const invalidRow = {
      claimId: "CLM004",
      memberId: "MBR003",
      provider: "Test Provider",
      serviceDate: futureDate.toISOString().split("T")[0],
      totalAmount: "12500",
    };

    const result = validateClaimRow(invalidRow, 4);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("future");
  });

  it("should handle multiple diagnosis codes split by semicolon", () => {
    const validRow = {
      claimId: "CLM005",
      memberId: "MBR004",
      provider: "Test Provider",
      serviceDate: "2025-05-14",
      totalAmount: "1000",
      diagnosisCodes: "R51;M54.5;K21.9",
    };

    const result = validateClaimRow(validRow, 5);
    expect(result.valid).toBe(true);
    expect(result.claim?.diagnosisCodes).toEqual(["R51", "M54.5", "K21.9"]);
  });
});
