import { Router } from "express";
import multer from "multer";
import {
  getClaimById,
  getClaims,
  ingestClaims,
} from "../services/claim.service";
import type {
  ClaimsListResponse,
  IngestionResult,
} from "../types/api-response";
import { ValidationError } from "../utils/errors";
import { validateClaimFilters } from "../utils/validateFilters";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  if (req.file.mimetype !== "text/csv") {
    throw new ValidationError(
      "Invalid file type. Only CSV files are allowed.",
      { mimetype: req.file.mimetype }
    );
  }

  try {
    const result: IngestionResult = await ingestClaims(req.file.buffer);
    return res.json(result);
  } catch (error: unknown) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { memberId, startDate, endDate } = req.query;

    const filters = {
      memberId: memberId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    validateClaimFilters(filters);

    const result: ClaimsListResponse = await getClaims(filters);

    res.json(result);
  } catch (error) {
    console.error("Error fetching claims:", error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const claim = await getClaimById(id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    res.json(claim);
  } catch (error) {
    next(error);
  }
});

export default router;
