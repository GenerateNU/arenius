# Arenius

## Getting Started
The backend is written in [Golang](https://go.dev/learn/) and handles code dependencies with Go modules managed within go.mod and go.sum.
In order to run the backend, the most straightforward way is to navigate to backend/cmd and execute **go run main.go** or 
**go build -o main . && ./main**.

Alternatively, we will use **Docker** to build and run isolated containers to ensure that environment dependencies and runtimes are consistent across our machines. 

### Steps to use Docker:
Install [Docker Desktop](https://docs.docker.com/get-started/get-docker/) (or just [Docker Engine](https://docs.docker.com/engine/install/)). 

In a terminal of your choice:

```bash
cd /backend/
docker build --tag backend .
docker run -p 8080:8080 backend ## (host-port):(container-port)
```

Open http://localhost:8080/health with your browser to see the result. Requests *should* be logged in your terminal. 

## Postman
For further development and testing, install [Postman](https://www.postman.com/downloads/), which simplifies making network requests.

## Learn More
- [Go Modules](https://faun.pub/understanding-go-mod-and-go-sum-5fd7ec9bcc34) - article about go.mod and go.sum.
- [Tour of Go](https://go.dev/tour/welcome/1) - guided tour of Golang.
- [Fiber Framework](https://docs.gofiber.io/) - web framework, similar to Express, SpringBoot, Flask, FastAPI, etc.
- [Docker Engine](https://docs.docker.com/engine/) - documentation for docker building and running docker containers.    
- [pgx](https://pkg.go.dev/github.com/jackc/pgx) - driver and toolkit for PostgreSQL which can be used to interact with Supabase.
- [Supabase](https://supabase.com/docs) - database hosting service, with Auth service alongside.  

This tech stack is totally flexible--suggestions are welcome!