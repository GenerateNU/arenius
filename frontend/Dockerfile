FROM node:22

WORKDIR /app

COPY package*.json ./

RUN pnpm install

RUN pnpm build

COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]
