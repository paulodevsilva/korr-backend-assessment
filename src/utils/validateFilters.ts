import { ValidationError } from "./errors";

export function validateClaimFilters(filters: {
  memberId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { memberId, startDate, endDate } = filters;

  if (memberId !== undefined && memberId.trim() === "") {
    throw new ValidationError("memberId must not be empty");
  }

  if (startDate) {
    const sd = new Date(startDate);
    if (isNaN(sd.getTime())) {
      throw new ValidationError(
        "Invalid startDate format. Expected YYYY-MM-DD"
      );
    }
  }

  if (endDate) {
    const ed = new Date(endDate);
    if (isNaN(ed.getTime())) {
      throw new ValidationError("Invalid endDate format. Expected YYYY-MM-DD");
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      throw new ValidationError("startDate cannot be after endDate");
    }
  }
}
