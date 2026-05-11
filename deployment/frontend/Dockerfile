# syntax=docker/dockerfile:1.7

FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY tableschema-1.12.6.tgz ./

RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

FROM --platform=linux/amd64 node:20-alpine AS builder
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG CKAN_URL
ARG NEXT_PUBLIC_CKAN_URL
ARG NEXT_PUBLIC_NEXTAUTH_URL
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_DISABLE_HOTJAR
ARG NEXT_PUBLIC_HOTJAR_ID
ARG NEXT_PUBLIC_GFW_API_KEY
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_DEPLOYMENT_TYPE
ARG OSANO_URL

ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    CKAN_URL=$CKAN_URL \
    NEXT_PUBLIC_CKAN_URL=$NEXT_PUBLIC_CKAN_URL \
    NEXT_PUBLIC_NEXTAUTH_URL=$NEXT_PUBLIC_NEXTAUTH_URL \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_PUBLIC_DISABLE_HOTJAR=$NEXT_PUBLIC_DISABLE_HOTJAR \
    NEXT_PUBLIC_HOTJAR_ID=$NEXT_PUBLIC_HOTJAR_ID \
    NEXT_PUBLIC_GFW_API_KEY=$NEXT_PUBLIC_GFW_API_KEY \
    NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN \
    NEXT_PUBLIC_DEPLOYMENT_TYPE=$NEXT_PUBLIC_DEPLOYMENT_TYPE \
    OSANO_URL=$OSANO_URL \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,target=/app/.next/cache \
    SKIP_ENV_VALIDATION=1 npm run build

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bypassApiTrackingFetch.js ./bypassApiTrackingFetch.js

# Standalone-mode artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 \
    NODE_OPTIONS='-r /app/bypassApiTrackingFetch.js --experimental-fetch'

CMD ["node", "server.js"]
