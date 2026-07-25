# syntax=docker/dockerfile:1

FROM node:22.19.0-alpine3.22 AS base

# ---- deps: install dependencies only ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
# node:22-alpine bundles npm 10.9.3, which mis-validates fdir's OPTIONAL picomatch peer
# (peerDependenciesMeta.optional=true) during `npm ci` lockfile-sync check — it compares
# against the registry's current latest matching version instead of skipping the optional
# peer, so a correct lockfile is rejected (EUSAGE). npm 11.12.1 (the version that generated
# this lockfile) does not have this bug. Pinned exact, not floating.
RUN npm install -g npm@11.12.1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: build the app ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* ใด ๆ ที่ต้องการต้อง ARG/ENV ก่อนบรรทัด build นี้ (ค่า inline เข้า JS bundle
# ตอน build เท่านั้น) — NEXT_PUBLIC_API_ORIGIN ตั้งใจไม่ ARG/ENV ที่นี่: ปล่อยว่าง = "" ตอน build,
# login()/microsoftLogin() จึง navigate ด้วย relative path (same-origin, ตรงกับที่ reverse proxy
# เสิร์ฟ SPA+API origin เดียวกันใน prod). NEXT_PUBLIC_GOOGLE_CLIENT_ID_* เป็นของเก่าที่ dead แล้ว.
# NEXT_PUBLIC_SKIP_AUTH: ตั้งใจไม่ ARG/ENV ที่นี่ — prod build ต้องไม่ bake flag นี้เข้าไปเลย
ENV NODE_ENV=production
RUN npm run build

# ---- runner: minimal production image ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5200
ENV HOSTNAME=0.0.0.0
# ADMIN_API_ORIGIN: ตั้งใจไม่ set — next.config.ts rewrites() คืน [] เมื่อไม่ set
# (reverse proxy เสิร์ฟ SPA+API origin เดียวกันอยู่แล้วใน prod)

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# permission ก่อน copy standalone — ให้ prerender/ISR cache เขียนได้ตอน runtime
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5200

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5200)+'/', r=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
