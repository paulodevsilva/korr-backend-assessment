import { Claim } from "../types/claim";

export interface IClaimsRepository {
  save(claim: Claim): Promise<void>;
  findById(claimId: string): Promise<Claim | null>;
  findAll(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Claim[]>;
}
