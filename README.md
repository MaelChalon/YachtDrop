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

## Context

I am currently in a work and study program (apprenticeship). During the 48h hackathon I was in the company, so I could not complete every task I initially planned.

## Run with Docker

Build the image:

```bash
docker build -t yachtdrop .
```

Run the container (with a local volume for the SQLite database):

```bash
docker run --rm -p 3000:3000 -v yachtdrop-data:/app/data yachtdrop
```

Open `http://localhost:3000/browse`.pplique tous les fixes q