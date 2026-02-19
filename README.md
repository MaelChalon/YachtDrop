# YachtDrop MVP

Implementation based on `YachtDrop_Technical_Spec_v1`.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- API routes for ingestion/proxy and checkout mock
- Zustand for cart and checkout local persistence

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Implemented scope

- FR-01: Live ingestion through `GET /api/products` with server-side scraping, normalization, cache TTL, rate limit, and fallback.
- FR-02: Product cards with image, name, price, short description and graceful missing-field handling.
- FR-03: Search page with debounce and in-app result updates.
- FR-04: Cart add/remove/update quantity with persisted client state.
- FR-05: Checkout with Delivery/Pickup choice, minimal required fields, validation via `POST /api/checkout`.
- FR-06: Mobile-first app shell (430px), client-side routes, bottom navigation.
- FR-07: Consistent YachtDrop visual identity (ocean/sand/coral palette).

## API

- `GET /api/products?q=&page=`
  - Returns `{ products: Product[], cached: boolean }`
- `POST /api/checkout`
  - Validates payload and returns mock `{ confirmationId, message }`

## Notes

- Ingestion targets NauticHandler HTML and may require selector tuning if source markup changes.
- A fallback product list is returned when live parsing fails, so the UX remains testable.
