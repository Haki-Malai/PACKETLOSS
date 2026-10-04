FROM node:24-bookworm-slim
WORKDIR /app
RUN npm install --global pnpm@10.28.0 nodemon@3.1.14
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY src ./src
COPY server ./server
COPY backend ./backend
COPY public ./public
COPY dev/*.mjs ./dev/
COPY index.html vite.config.ts postcss.config.cjs tsconfig*.json ./
