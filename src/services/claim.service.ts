import csv from "csv-parser";
import { Readable } from "stream";
import { repository } from "../repositories";
import type {
  ClaimsListResponse,
  IngestionResult,
} from "../types/api-response";
import type { Claim } from "../types/claim";
import { NotFoundError, ValidationError } from "../utils/errors";
import { validateClaimRow } from "../utils/validation";

export async function ingestClaim(claim: Claim) {
  const existing = await repository.findById(claim.claimId);

  if (existing) {
    throw new Error(`Duplicate claimId '${claim.claimId}' already exists`);
  }

  await repository.save(claim);
}

export async function ingestClaims(
  fileBuffer: Buffer
): Promise<IngestionResult> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    let rowIndex = 0;

    console.log("Ingesting claims from, size:", fileBuffer.length, "bytes");

    Readable.from(fileBuffer.toString("utf8"))
      .pipe(csv())
      .on("headers", (headers: string[]) => {
        const expected = [
          "claimId",
          "memberId",
          "provider",
          "serviceDate",
          "totalAmount",
          "diagnosisCodes",
        ];

        const missing = expected.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          reject(
            new ValidationError(
              `Invalid CSV headers. Missing: ${missing.join(", ")}`
            )
          );
          return;
        }
      })
      .on("data", (row) => {
        rowIndex++;

        const validation = validateClaimRow(row, rowIndex);

        if (validation.valid) {
          results.push(validation.claim);
        } else {
          errors.push({
            row: rowIndex,
            message: validation.error ?? "Unknown validation error",
          });
        }
      })
      .on("end", async () => {
        let successCount = 0;
        for (const claim of results) {
          try {
            await ingestClaim(claim);
            successCount++;
          } catch (err: any) {
            errors.push({
              row: 0,
              message: `Failed to save claim ${claim.claimId}: ${err.message}`,
            });
          }
        }

        resolve({
          successCount,
          errorCount: errors.length,
          errors,
        });
      })
      .on("error", reject);
  });
}

export async function getClaims(filters: {
  memberId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ClaimsListResponse> {
  const claims = await repository.findAll(filters);

  return {
    claims,
    count: claims.length,
    totalAmount: claims.reduce((sum, claim) => sum + claim.totalAmount, 0),
  };
}

export async function getClaimById(id: string) {
  const claim = await repository.findById(id);

  if (!claim) {
    throw new NotFoundError(`Claim with id '${id}' not found`);
  }

  return claim;
}
