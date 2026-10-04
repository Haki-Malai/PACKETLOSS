FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN npm install --global pnpm@10.28.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
RUN npm install --global nodemon@3.1.14
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./package.json
COPY backend ./backend
COPY src ./src
COPY dev/lambda.mjs ./dev/lambda.mjs
ENTRYPOINT ["nodemon", "--legacy-watch", "--signal", "SIGTERM", "--delay", "0.3", "--watch", "backend", "--watch", "src/game/protocol/version.ts", "--watch", "dev/lambda.mjs", "--ext", "ts,mjs", "dev/lambda.mjs"]
