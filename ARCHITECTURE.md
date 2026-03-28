# Architecture Document

## 1. Solution Overview

QuickToCash Supplier Dashboard is a small full-stack application with an Angular frontend and a .NET Web API backend.

Flow:

1. The Angular app loads the Supplier Dashboard at `/dashboard`.
2. The frontend calls the backend invoice endpoints over HTTP.
3. The API controller delegates work to the service layer.
4. The service layer applies business rules such as early-payment eligibility checks.
5. The repository layer reads and writes in-memory invoice and early-payment request data.

High-level diagram:

```text
Angular UI
  -> InvoiceService
  -> HTTP /api/invoices/*
  -> InvoicesController
  -> IInvoiceService / InvoiceService
  -> IInvoiceRepository / InvoiceRepository
  -> In-memory data
```

The frontend and backend are intentionally decoupled through a small REST contract so the UI can evolve independently from the storage implementation.

## 2. Folder Structure Decisions

The repository is split into `frontend/` and `backend/` to keep framework concerns isolated and make each application easy to run independently.

Backend structure:

- `Controllers/`: HTTP entry points and status-code handling.
- `Services/`: business rules, including eligibility and early-payment request orchestration.
- `Repositories/`: in-memory persistence and lookup logic.
- `Models/` and `DTOs/`: API data contracts and response envelope types.

Frontend structure:

- `src/app/core/`: cross-cutting concerns such as the auth interceptor and alert service.
- `src/app/shared/`: reusable UI pieces, including global alerts.
- `src/app/features/supplier-dashboard/`: dashboard-specific module, routing, components, models, and services.

This layout keeps feature logic close together on the frontend, while the backend follows a layered architecture that makes service logic testable without controllers or HTTP.

## 3. Key Design Decisions

### Layered backend

The API uses a controller-service-repository split instead of putting logic directly in controllers. This keeps HTTP concerns separate from business rules and makes the eligibility logic easier to unit test. Dependency injection is used throughout so implementations can be swapped later without changing consumers.

### In-memory repository

The assignment explicitly avoids a real database, so the repository stores invoices and early-payment requests in memory. That keeps the project simple for a coding exercise while still preserving a realistic access layer boundary for future persistence changes.

### Consistent response envelope

API responses use a shared envelope with `success`, `data`, `message`, and `errors`. This gives the frontend a predictable contract for both happy-path and failure responses and keeps controller responses consistent across endpoints.

### Feature-module frontend

The Angular app uses a dedicated `supplier-dashboard` feature module with its own routing. This matches the assignment brief and keeps dashboard-specific code grouped together instead of spreading it across the application root.

### Reactive dashboard state

The dashboard uses reactive forms and observable composition for filtering and search state. The template consumes the view model with the `async` pipe, which reduces manual subscription management and keeps rendering aligned with Angular’s reactive patterns.

### Global user feedback

User-facing API feedback is handled through a lightweight global alert system instead of scattering success and error messages across individual pages. This provides more consistent UX for load failures, eligibility warnings, and request submission outcomes.

### UI choices

Angular Material is used as the single component library for consistency. Styling adds a finance-oriented visual layer on top of Material primitives while keeping layouts responsive for desktop and tablet use.

## 4. What I would do differently

If this moved beyond an exercise, I would make these upgrades:

- Replace the mock auth header with real authentication and role-aware authorization.
- Move from in-memory storage to a database-backed repository with migrations.
- Add pagination, sorting, and server-side filtering for larger invoice datasets.
- Add request/response logging, centralized exception handling, and stronger validation.
- Expand automated testing to include controller integration tests and frontend component tests around alerts and modal flows.
- Add environment-based API configuration instead of hardcoding localhost URLs in the frontend service.

The current solution is intentionally optimized for clarity, separation of concerns, and assignment fit rather than production completeness.
