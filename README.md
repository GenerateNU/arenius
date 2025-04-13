# Arenius

Arenius empowers small-to-medium businesses with an affordable and intuitive platform to track, manage and reduce their carbon footprint to increase their bottom lines and contribute to a healthier planet. 

Some highlighted features include:  
- Automatic, unintrusive syncing of transactions from accounting platform [Xero](https://www.xero.com/us/) nightly and on login.
- Intuitive reconcilation process with `~1,500` emissions factors, utilizing features such as search, favorites, and history.
  - Supports filtering by date, description, emissions factor, CO2e, contact, scope, and amount.
- 5 distinct visualizations for intuitive user analysis.
  - Supports filtering by date ranges.
- Contacts page with summary of contacts and contact history.
  - Supports filtering by contact, phone, location, email, and creation date.   
- Exporting transactions, transactions summary, and contacts to `.xlsx`.
- Middleware for refreshing access tokens, protected endpoints, redirects, and error handling in the backend and frontend.
- Automatic reconcilation suggestions with a Python microservice. 

# Backend

Our backend is written in Go and uses a Postgres database that is hosted with Supabase. It is built on the [fiber](https://docs.gofiber.io/) framework. 

# Frontend

Our frontend is written in TypeScript with React and Next.js, using Tailwind for styling. We utilize cookies and local storage for persistence.

# Infrastructure/DevOps
We use Docker for our dependency management, taking advantage of Docker Compose and Docker Compose Watch. We deployed our app on DigitalOcean App Platform.

# Running Locally
Prerequisites:

- [Node >= v22](https://nodejs.org/en/download) (npm is included)
- [nvm](https://github.com/nvm-sh/nvm) (optional, for managing Node versions on your machine)
- Docker Engine

With node installed, run the following in your terminal:
```
docker compose up --build --watch
```
and open [http://localhost:3000](http://localhost:3000) in your browser. 

> [!NOTE]
> To individually run the backend or frontend, run the following:
> ```
> docker compose up backend --build --watch 
> ```
> Or
> ```
> docker compose up frontend --build --watch
> ```
