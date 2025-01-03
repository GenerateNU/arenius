# Arenius

## Backend Setup
The backend is written in Golang and handles code dependencies with Go modules managed within go.mod and go.sum.
In order to run the backend, the most straightforward way is to navigate to backend/cmd and execute **go run main.go** or 
**go build -o main . && ./main**.

Alternatively, we will use **Docker** to build and run isolated containers to ensure environment dependencies are managed and we all have consistent runtime environments across our machines. 

### Steps to use Docker:
Install [Docker Desktop](https://docs.docker.com/get-started/get-docker/) (or just [Docker Engine](https://docs.docker.com/engine/install/)). 

- cd /backend/
- docker build --tag backend .
- docker run backend