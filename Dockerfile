# Build stage - Frontend
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build frontend
RUN bun run build

# Production stage
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (Bun handles production dependencies automatically)
RUN bun install --frozen-lockfile

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server
COPY src/types ./src/types

# Copy data files (GeoLite2 database)
COPY data ./data

# Expose port
EXPOSE 3020

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --eval "fetch('http://localhost:3020/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start server
CMD ["bun", "run", "server/index.ts"]
