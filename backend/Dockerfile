FROM golang:1.23-alpine


# Set the working directory (this is /backend in Arenius)
WORKDIR /app

# Copy only go.mod and go.sum first (to cache dependencies)
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

WORKDIR /app/cmd

CMD ["go", "run", "main.go"]