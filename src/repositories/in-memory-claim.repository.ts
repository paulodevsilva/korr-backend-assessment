import type { Claim } from "../types/claim";
import { DuplicateError } from "../utils/errors";
import { IClaimsRepository } from "./claim.repository";

export class InMemoryClaimsRepository implements IClaimsRepository {
  private claimsMap = new Map<string, Claim>();

  async save(claim: Claim): Promise<void> {
    const existing = await this.findById(claim.claimId);
    if (existing) {
      throw new DuplicateError(
        `Duplicate claimId '${claim.claimId}' already exists`
      );
    }

    this.claimsMap.set(claim.claimId, claim);
  }

  async findById(claimId: string): Promise<Claim | null> {
    return this.claimsMap.get(claimId) || null;
  }

  async findAll(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Claim[]> {
    let claims = Array.from(this.claimsMap.values());

    if (filters?.memberId) {
      claims = claims.filter((claim) => claim.memberId === filters.memberId);
    }
    if (filters?.startDate !== undefined) {
      claims = claims.filter(
        (claim) => claim.serviceDate >= filters.startDate!
      );
    }
    if (filters?.endDate !== undefined) {
      claims = claims.filter((claim) => claim.serviceDate <= filters.endDate!);
    }

    claims.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
    return claims;
  }
}
