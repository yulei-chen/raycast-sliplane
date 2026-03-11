# CLAUDE.md

## Build & Dev

- `npm run dev` — Start extension in Raycast dev mode
- `npm run build` — Build the extension
- `npm run lint` — Run linter
- `npm run fix-lint` — Auto-fix lint issues

## Project Structure

```
src/
  types.ts              — TypeScript interfaces for API models
  api.ts                — API client (fetch wrapper + endpoint functions)
  search-services.tsx   — Main command: searchable list of services
  service-detail.tsx    — Detail view component pushed from the list
  search-blog.tsx       — No-view command: opens Sliplane blog with optional keyword search
package.json            — Extension config, preferences, and dependencies
```

## Architecture

- **API base URL:** `https://ctrl.sliplane.io`
- **Auth:** Bearer token via `Authorization` header (token format: `api_rw_org_xxx_secret`)
- **API endpoints used:** `GET /v0/projects`, `GET /v0/projects/{projectId}/services`
- **Data flow:** `getAllServices()` fetches all projects, then fetches services per project in parallel, returns a flat `ServiceWithProject[]` sorted by `createdAt` descending
- **Data fetching:** Uses `usePromise` from `@raycast/utils`
- **Pagination:** Client-side, 10 items per page with a "Show More" list item

## Key Types

- `Service` — Core service model with deployment, network, status
- `ServiceWithProject` — Extends `Service` with `projectName` for display
- `RepositoryDeployment` vs `ImageDeployment` — Two deployment types, distinguished by `isRepositoryDeployment()` type guard
- `ServiceStatus` — `"pending" | "live" | "failed" | "suspended" | "deleting"`

## Conventions

- Raycast extensions use React — components return Raycast UI primitives (`List`, `Detail`, `ActionPanel`, etc.)
- Preferences are defined in `package.json` under `preferences` and accessed via `getPreferenceValues<Preferences>()`
- Status colors: live=Green, pending=Yellow, failed=Red, suspended=Orange, deleting=SecondaryText
