import { ClaimModel, IClaim } from "../models/claim.model";
import type { Claim } from "../types/claim";
import { IClaimsRepository } from "./claim.repository";

export class MongoClaimsRepository implements IClaimsRepository {
  async save(claim: Claim): Promise<void> {
    await ClaimModel.create(claim);
  }

  async findById(claimId: string): Promise<Claim | null> {
    const claim = await ClaimModel.findOne({ claimId })
      .select("-_id -__v -createdAt -updatedAt")
      .lean<IClaim | null>();
    if (!claim) return null;
    return {
      ...claim,
      serviceDate:
        claim.serviceDate instanceof Date
          ? claim.serviceDate.toISOString()
          : claim.serviceDate,
    };
  }

  async findAll(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Claim[]> {
    const query: any = {};

    if (filters?.memberId) {
      query.memberId = filters.memberId;
    }

    if (filters?.startDate || filters?.endDate) {
      query.serviceDate = {};
      if (filters.startDate)
        query.serviceDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.serviceDate.$lte = new Date(filters.endDate);
    }

    const claims = await ClaimModel.find(query)
      .sort({ serviceDate: -1 })
      .select("-_id -__v -createdAt -updatedAt")
      .lean<IClaim[]>();
    return claims.map((claim) => ({
      ...claim,
      serviceDate:
        claim.serviceDate instanceof Date
          ? claim.serviceDate.toISOString()
          : claim.serviceDate,
    }));
  }
}
