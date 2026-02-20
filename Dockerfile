# syntax=docker/dockerfile:1
FROM node:20-alpine AS source
RUN apk add --no-cache git
WORKDIR /app
ARG REPO_URL="https://github.com/MaelChalon/YachtDrop.git"
ARG REF="main"
RUN git clone --depth 1 --branch "${REF}" "${REPO_URL}" .

FROM node:20-alpine AS build
RUN apk add --no-cache python3 make g++ sqlite-libs
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
RUN apk add --no-cache sqlite-libs
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["node", "server.js"]
