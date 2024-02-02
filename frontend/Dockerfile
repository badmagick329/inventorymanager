FROM node:20-alpine AS deploy
WORKDIR /app
RUN npm install --global pm2
RUN npm install --global pnpm
COPY .env.local ./.env.local
COPY package.json pnpm-lock.yaml ./
COPY next.config.mjs ./next.config.mjs
COPY tsconfig.json ./tsconfig.json
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.js ./postcss.config.js
COPY .npmrc ./.npmrc
COPY ./src ./src
COPY ./public ./public
RUN pnpm install --frozen-lockfile
RUN pnpm run build
EXPOSE 3000
USER node
CMD [ "pm2-runtime", "pnpm", "--", "start" ]
