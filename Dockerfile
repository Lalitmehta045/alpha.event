# ============================================
# Stage 1: Base Image
# ============================================
FROM node:20-alpine AS base

# sharp aur native modules ke liye zaroori
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Stage 2: Install Dependencies
# ============================================
FROM base AS deps

# Package files copy karo
COPY package.json package-lock.json* ./

# Clean install (lockfile se exact versions)
RUN npm ci --ignore-scripts

# sharp ko explicitly rebuild karo (Alpine ke liye)
RUN npm rebuild sharp

# ============================================
# Stage 3: Build the Application
# ============================================
FROM base AS builder

WORKDIR /app

# Dependencies copy karo previous stage se
COPY --from=deps /app/node_modules ./node_modules

# Source code copy karo
COPY . .

# Next.js telemetry disable (optional)
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app (standalone output)
RUN npm run build

# ============================================
# Stage 4: Production Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Production mode
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# sharp ke liye zaroori
RUN apk add --no-cache libc6-compat

# Security: non-root user banao
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public folder copy karo
COPY --from=builder /app/public ./public

# Standalone output copy karo
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# HEIC conversion modules (dynamically imported, need explicit copy)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/heic-convert ./node_modules/heic-convert
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/heic-decode ./node_modules/heic-decode
# Sub-dependencies of heic-convert (required at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/jpeg-js ./node_modules/jpeg-js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pngjs ./node_modules/pngjs

# Non-root user se run karo
USER nextjs

# Port expose karo
EXPOSE 3000

# Environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# App start karo
CMD ["node", "server.js"]
