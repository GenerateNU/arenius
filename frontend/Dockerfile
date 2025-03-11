FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Pass environment variables to the build step
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
