# Korr Backend – Home Assessment

## This is a backend API for **uploading, validating, and querying healthcare claims** from CSV files.

## Getting Started

### 1. Requirements

- **Node.js** v20+
- **pnpm** (or npm/yarn)
- **Docker + Docker Compose**

### 2. Environment Variables

Rename the `.env.example` file to `.env` in the project root and update the values as needed for example:

```env
PORT=3000
NODE_ENV=development

MONGO_URI=mongodb://mongo:27017/korrdb
MONGO_DB_NAME=korrdb
MONGO_PORT=27017
```

### 3. Running Locally (InMemory Mode)

By default, when `NODE_ENV=test`, the app runs using the **InMemoryClaimsRepository**.
This means no MongoDB is required → great for development and testing.

```bash
pnpm install
NODE_ENV=test pnpm dev       # run API in-memory
pnpm test                    # run unit + integration tests
```

### 4. Running with Docker (Mongo Mode)

If you want to run against a real MongoDB instance:

```bash
docker compose --env-file .env up --build
```

This will start up:

- **app** → Express API connected to MongoDB
- **mongo** → MongoDB database with a persistent volume

---

## 📂 Project Structure

```
src/
├── app.ts                  # Express setup
├── server.ts               # Entry point
├── config/                 # Env & db config
├── middleware/             # Global middlewares (errors, etc.)
├── models/                 # Mongo schemas
├── repositories/           # Persistence layer
│   ├── claim.repository.ts # Contract
│   ├── in-memory-claim.repository.ts # Implementation
│   └── mongo-claim.repository.ts #Implementation
├── routes/                 # REST routes
├── services/               # Business logic
├── types/                  # Shared types
├── utils/                  # Errors & validation helpers
└── __tests__/              # Jest + Supertest
```

---

## Validations

**CSV Upload**

- Must be `text/csv`
- File must have a `.csv` extension

**Claim fields**

- `claimId`: required, globally unique
- `memberId`: required
- `totalAmount`: must be numeric & > 0
- `serviceDate`: required, cannot be in the future
- `diagnosisCodes`: split by `;`

**Filters in GET /claims**

- `memberId`: filters by member
- `startDate` / `endDate`: range must be valid
- Always sorted by `serviceDate` (newest first)

---

## Architecture decisions

- **Repository pattern** → decouples persistence from business logic.
  Mongo is used in production, InMemory repo for tests/dev.

- Mongo was chosen because simplifies storage and queries without the extra complexity of relational schemas and joins.

- **Validation** → `validateClaimRow.ts` checks CSV rows, `validateFilters.ts` checks API params.

- **Centralized error handling** → middleware returns consistent JSON errors:

  ```json
  {
    "error": "ValidationError",
    "details": "...",
    "path": "...",
    "timestamp": "..."
  }
  ```

- **Testing** →
  - Unit tests for validation/repositories/errors
  - Integration tests for `POST /claims`, `GET /claims`, duplicate handling
  - Runs without Mongo (without external dependency)

---

## Improvements

- Add pagination for `/claims` (to handle large result sets)
- Async ingestion (e.g. BullMQ, SQS) for large CSVs with background workers;
- Observability (structured logs, metrics, tracing) (parse it into some log aggregator like ELK stack);
- E2E tests with `MongoMemoryServer` to hit the real database layer;

---

## Endpoints

### **POST /claims**

Upload a CSV (`multipart/form-data`, field = `file`)

**Sample CSV**

```
claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,HealthCare Inc,2025-05-14,12500,R51;K21.9
CLM002,MBR002,Dr. Smith Clinic,2025-05-13,8999,R10.9
CLM003,MBR001,City Hospital,2025-05-30,30000,M54.5
CLM004,MBR003,QuickMed Urgent Care,2025-05-13,7550,
CLM005,,Sunrise Medical Group,2025-05-13,11200,J06.9
CLM006,MBR004,Dr. Green Clinic,2025-05-15,-5000,R07.0
CLM007,MBR005,WellCare Plus,2025-05-16,22000,M25.5
```

cURL Example:

```
curl -X POST http://localhost:3000/claims \
  -H "Content-Type: multipart/form-data" \
  -F "file=@claims.csv"
```

**Example response:**

```json
{
  "successCount": 2,
  "errorCount": 1,
  "errors": [{ "row": 5, "message": "Missing memberId" }]
}
```

### **GET /claims**

Supports filtering & aggregation.

**Query params:** `memberId`, `startDate`, `endDate`

**cURL Example:**

```
curl "http://localhost:3000/claims?memberId=MBR001&startDate=2025-05-01&endDate=2025-08-01"
```

**Example response:**

```json
{
  "count": 2,
  "totalAmount": 21500,
  "claims": [
    {
      "claimId": "CLM001",
      "memberId": "MBR001",
      "provider": "HealthCare Inc",
      "serviceDate": "2025-05-14",
      "totalAmount": 12500,
      "diagnosisCodes": ["R51", "K21.9"]
    }
  ]
}
```

**Example error response: (422 Unprocessable entity)**

```json
{
  "error": "memberId must not be empty",
  "details": null,
  "path": "/claims?memberId=&startDate=2025-05-14&endDate=2025-05-16",
  "timestamp": "2025-09-22T21:14:15.511Z"
}
```

### **GET /claims/:id**

Retrieve a single claim by its claimId.

**cURL Example:**

```
curl "http://localhost:3000/claims/CLM001"
```

**Example response:**

```json
{
  "claimId": "CLM001",
  "memberId": "MBR001",
  "provider": "HealthCare Inc",
  "serviceDate": "2025-05-14",
  "totalAmount": 12500,
  "diagnosisCodes": ["R51", "K21.9"]
}
```

**Example error response: (404 Not Found)**

```json
{
  "error": "Claim with id 'CLM000' not found",
  "details": null,
  "path": "/claims/CLM000",
  "timestamp": "2025-09-22T21:12:53.535Z"
}
```
