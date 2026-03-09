############################################
# Stage 1 – install deps
############################################
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
#RUN npm ci
RUN npm install --legacy-peer-deps

############################################
# Stage 2 – build
############################################
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Placeholder values used ONLY for the build step.
# Real values are injected at runtime via docker-compose env.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_SECRET=build_placeholder_secret_32chars!!
ENV NEXTAUTH_URL=http://localhost:3000

RUN npm run build

############################################
# Stage 3 – production runner
############################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
