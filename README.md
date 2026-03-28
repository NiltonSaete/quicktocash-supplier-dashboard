# QuickToCash Supplier Dashboard

QuickToCash Supplier Dashboard is a small full-stack application for viewing supplier invoices, checking early-payment eligibility, and submitting early-payment requests.

The repository contains:

- a .NET Web API with in-memory data
- an Angular frontend for the supplier dashboard UI

## Tech Stack

- Backend: ASP.NET Core (`net10.0`)
- Frontend: Angular 21
- UI: Angular Material
- Tests: xUnit and Moq on the backend

## Repository Structure

```text
backend/
  QuickToCash.API/        Web API
  QuickToCash.Tests/      Unit tests
frontend/                 Angular application
ARCHITECTURE.md           Architecture document
README.md                 Setup and run instructions
```

## Prerequisites

- .NET SDK 10
- Node.js
- npm

## Backend Setup

From the repository root:

```bash
cd backend/QuickToCash.API
dotnet restore
dotnet run
```

The API runs on:

- `http://localhost:5196`
- `https://localhost:7193`

Useful endpoints:

- `GET /api/invoices?supplierId=sup-001`
- `GET /api/invoices/{id}`
- `GET /api/invoices/{id}/early-payment-eligibility`
- `POST /api/invoices/{id}/early-payment-request`

OpenAPI/Scalar is enabled by the API for local inspection.

## Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

The Angular app runs at:

- `http://localhost:4200`

The dashboard is available at:

- `http://localhost:4200/dashboard`

## Running Tests

Backend tests:

```bash
cd backend
dotnet test
```

Frontend build:

```bash
cd frontend
npm run build
```

Frontend unit tests:

```bash
cd frontend
npm test
```

## Assumptions

- Authentication is mocked on the frontend through an interceptor that adds an authorization header.
- The backend uses in-memory data only; no database is configured.
- The frontend currently requests data from `http://localhost:5196`.
- The main demo supplier is `sup-001`.
- Early-payment eligibility is calculated in the backend service layer and returned to the UI.

## Key Features

- Supplier dashboard route at `/dashboard`
- Invoice table with search and status filtering
- Summary strip for invoice status counts
- Invoice detail modal centered on screen
- Early-payment eligibility lookup
- Early-payment confirmation flow
- Global alert messages for success, warning, and error states
- Feature-module Angular structure for the supplier dashboard

## Notes

- The frontend README inside `frontend/` is the default Angular CLI README and is not the primary project guide.
- The main design and architecture notes for this submission are in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
