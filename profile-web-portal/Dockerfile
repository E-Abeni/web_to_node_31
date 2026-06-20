# Step 1: Base image
FROM node:20-alpine AS base

# Step 2: Install dependencies
FROM base AS deps
# Native dependencies fallback
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Step 3: Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy all project files
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Step 4: Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT=17002
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# CRITICAL: Next.js needs configuration files at runtime along with public/build folders
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 17002

CMD ["npm", "start"]