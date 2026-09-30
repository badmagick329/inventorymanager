FROM node:22-bookworm-slim AS base
# Bun's runtime crashes in Next 15's build; Bun only installs packages, Node runs Next.
COPY --from=oven/bun:1.3.11 /usr/local/bin/bun /usr/local/bin/bun

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock* ./
# Dev dependencies (TypeScript, Tailwind, PostCSS) are build inputs; standalone output ships only traced runtime files.
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production image, copy all the files and run next
FROM base AS deploy
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY ./.env.local ./.env.local

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
