# syntax=docker/dockerfile:1
FROM node:20-alpine AS source
RUN apk add --no-cache git
WORKDIR /app
ARG REPO_URL="https://github.com/MaelChalon/YachtDrop.git"
ARG REF="main"
RUN git clone --depth 1 --branch "${REF}" "${REPO_URL}" .

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=source /app/package.json /app/package-lock.json ./
RUN npm ci
COPY --from=source /app ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=source /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
