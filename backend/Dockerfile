# ─── Career360 Backend Dockerfile ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required for node-gyp / build tools
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Copy package descriptors
COPY package*.json ./
COPY ../prisma ./prisma/

# Install all dependencies (including dev for prisma)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

RUN apk add --no-cache openssl libc6-compat

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies and build artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY src/ ./src/

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

CMD ["node", "src/server.js"]
