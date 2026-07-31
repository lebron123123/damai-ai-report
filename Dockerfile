# Multi-stage build targeting Next.js "standalone" output.
# Matches Tencent CloudBase 云托管's expected shape: a Dockerfile exposing
# port 3000. Works unmodified on any other container platform too (Aliyun
# SAE/ACK, Railway, Fly.io, self-hosted) if the deployment target changes later.
# Node 24 (not 20) specifically: the history store uses the built-in
# node:sqlite module, which needs Node 22+ and has no native deps to compile.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# The app writes to .data/ at runtime (SQLite history store, ML snapshot
# cache) — /app itself is root-owned from the COPY steps above, and the
# nextjs user has no permission to create new directories in it, so this
# has to exist with the right owner before USER drops privileges.
RUN mkdir -p /app/.data && chown -R nextjs:nodejs /app/.data
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
