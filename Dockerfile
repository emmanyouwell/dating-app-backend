# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files first (for cache)
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies including dev
RUN pnpm install

# Copy only source files for build
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /app

# Install only production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start NestJS app
CMD ["pnpm", "run", "start:prod"]
