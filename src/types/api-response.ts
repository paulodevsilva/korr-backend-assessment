import type { Claim } from "./claim";

export interface IngestionResult {
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface ClaimsListResponse {
  claims: Claim[];
  totalAmount?: number;
  count: number;
}
