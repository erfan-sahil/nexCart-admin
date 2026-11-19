# NexCart Admin

Single-page admin dashboard for platform operations: users, catalog approval, orders, finance, marketing, and site content.

## Stack

- **Vite 6**
- **React 19** + TypeScript
- **React Router 8**
- **Tailwind CSS v4** + shadcn/ui
- **TanStack Query** + Table, **axios**
- **React Hook Form** + Zod

## Prerequisites

- Node.js **≥ 20**
- [NexCart API](../../backend/nexCart-backend/README.md) with an admin account (`npm run seed:admin` in the backend)

## Getting started

```bash
cp .env.example .env   # if not present
npm install
npm run dev
```

Open **http://localhost:5174**.

### Environment

`.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Scripts

| Script                            | Description                   |
| --------------------------------- | ----------------------------- |
| `npm run dev`                     | Dev server (port **5174**)    |
| `npm run build`                   | Typecheck + production bundle |
| `npm run preview`                 | Preview production build      |
| `npm run lint` / `lint:fix`       | ESLint (max warnings 0)       |
| `npm run format` / `format:check` | Prettier                      |
| `npm run typecheck`               | `tsc --noEmit`                |
| `npm run check`                   | lint + format + typecheck     |

## Feature areas

| Section    | Paths                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Dashboard  | `/`                                                                                                              |
| Users      | `/users/buyers`, `/users/vendors`, `/users/stores`, `/users/vendor-applications`                                 |
| Catalog    | `/catalog/categories`, `/catalog/attributes`, `/catalog/product-approvals`                                       |
| Moderation | `/moderation/reviews`, `/moderation/reports`                                                                     |
| Commerce   | `/commerce/orders`, `/commerce/returns`                                                                          |
| Finance    | `/finance/commissions`, `/finance/vendor-earnings`, `/finance/withdrawals`, `/finance/settlements`               |
| Marketing  | `/marketing/featured-categories`, `/marketing/sponsored-product`, `/marketing/coupons`, `/marketing/flash-deals` |
| Site       | `/site-content/hero`, `/site-settings/delivery-charge`                                                           |
| Account    | `/login`, `/settings`                                                                                            |

Protected routes use `RequireAdmin`; unauthenticated users are sent to `/login`.

## Project layout

```
src/
  app/              Navigation, routes, page intros
  pages/            Route-level screens
  features/         Domain logic and forms
  components/       Layout shell, shared UI
  lib/api/          Axios client and asset URLs
```

## Related apps

- **Storefront:** [nexCart-frontend](../nexCart-frontend/README.md) — http://localhost:3000
- **Vendor:** [nexCart-vendor](../nexCart-vendor/README.md) — http://localhost:5175

## Add UI components

```bash
npx shadcn@latest add table
```
