FROM golang:1.23-alpine

# Sets the container's working directory to /app
WORKDIR /app

# Copy mod and sum files for efficiency/caching
COPY go.mod go.sum ./
RUN go mod download

# Copies the contents of this directory (backend and subdirs) to /app/backend/cmd in the container
COPY . ./backend

WORKDIR /app/backend/cmd

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]