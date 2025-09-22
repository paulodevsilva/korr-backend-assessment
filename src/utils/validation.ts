export function validateClaimRow(row: any, rowIndex?: number) {
  const {
    claimId,
    memberId,
    provider,
    serviceDate,
    totalAmount,
    diagnosisCodes,
  } = row;

  const errors: string[] = [];

  if (!claimId?.trim()) errors.push("Missing claimId");
  if (!memberId?.trim()) errors.push("Missing memberId");
  if (!provider?.trim()) errors.push("Missing provider");
  if (!serviceDate?.trim()) errors.push("Missing serviceDate");
  if (totalAmount === undefined || totalAmount === null || totalAmount === "") {
    errors.push("Missing totalAmount");
  }

  if (serviceDate?.trim()) {
    const date = new Date(serviceDate);
    if (isNaN(date.getTime())) {
      errors.push("Invalid serviceDate format (expected YYYY-MM-DD)");
    } else if (date > new Date()) {
      errors.push("serviceDate cannot be in the future");
    }
  }

  if (totalAmount !== undefined && totalAmount !== null && totalAmount !== "") {
    const amount = parseInt(totalAmount, 10);
    if (isNaN(amount)) {
      errors.push("totalAmount must be a valid integer");
    } else if (amount <= 0) {
      errors.push("totalAmount must be positive");
    }
  }

  if (diagnosisCodes && typeof diagnosisCodes === "string") {
    const codes = diagnosisCodes
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean);

    if (codes.some((code) => code.length < 2)) {
      errors.push("diagnosisCodes must have valid format (e.g., R51;K31.7)");
    }
  }

  if (errors.length > 0) {
    const errorMessage = errors.join("; ");
    return {
      valid: false,
      error: rowIndex ? `Row ${rowIndex}: ${errorMessage}` : errorMessage,
    };
  }

  const date = new Date(serviceDate);
  const amount = parseInt(totalAmount, 10);

  const claim = {
    claimId: claimId.trim(),
    memberId: memberId.trim(),
    provider: provider.trim(),
    serviceDate: date.toISOString().split("T")[0],
    totalAmount: amount,
    diagnosisCodes: diagnosisCodes
      ? diagnosisCodes
          .split(";")
          .map((c: string) => c.trim())
          .filter(Boolean)
      : [],
  };

  return { valid: true, claim };
}
