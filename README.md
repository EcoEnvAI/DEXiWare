# DEXiWare

## Introduction

**DEXiWare** is a reusable software framework for building cooperative **decision support systems (DSS)** based on qualitative multi-criteria models developed with the [**DEX**](https://dex.ijs.si) method.

It provides a standardized, modular environment that integrates backend services, a user-friendly frontend, and a DSS engine for assessment, scenario analysis, and optimization.

By abstracting common DSS components, DEXiWare enables rapid, reliable development of domain-specific systems across agriculture, environment, and sustainability domains — reducing development time while ensuring transparency and usability.

Developed by the [EcoEnvAI](https://ecoenvai.ijs.si/) team at the Jožef Stefan Institute, Ljubljana, Slovenia, DEXiWare has been applied in several European research projects to create operational DSS tools:

* **Pathfinder (TRUE Project):** Sustainability assessment of legume-based value chains ( [live tool](https://pathfinder.ijs.si/) | [project](https://true-project.webarchive.hutton.ac.uk/index.htm) )
* **Resource Amplifier (TOMRES Project):** Optimization of resource use in tomato production systems ( [live tool](https://resourceamplifier.ijs.si/) | [project ](https://www.tomres.eu/))
* **Market Avenue Generator (RADIANT Project):** Support for business model writing for value-chain diversification ( [live tool](https://ecoenvai.ijs.si/radiant/bm-dss/login) | [project ](https://www.radiantproject.eu/))

Pathfinder serves as a reference implementation demonstrating what can be built using DEXiWare in this public repository. The **decision models** and **indicator factsheets** used in Pathfinder are openly documented and archived on [ **Zenodo (DOI: 10.5281/ZENODO.3706712**)](https://zenodo.org/records/3706712).

Note: Development of DEXiWare began during the TRUE project where Pathfinder was first conceived, before the names *DEXiWare* and *Pathfinder* were adopted. As a result, some internal components still use the legacy name prefix *true*.

## Quickstart (Docker Compose)

### Prerequisites

- **Docker Desktop** (or Docker Engine + Compose)

NB: When cloning the repository, ensure that the path does not contain special characters (e.g. 'č') as this may cause issues with running assessments.

### Configure

Copy `.env.example` to `.env` and adjust values as needed.

Important: `docker-compose.yaml` is configured to fail fast if required environment variables are missing.

The values in `.env.example` are suitable for local development only. For any deployment, you should change at least:

- `SESSION_SECRET`
- `ADMIN_PASSWORD`
- `DB_PASS`
- `PGADMIN_DEFAULT_PASSWORD`

If you intend to use registration and password reset functionality, configure `SMTP_*` and `EMAIL_FROM`.

### Start

```bash
docker compose up --build -d
```

### Access

- **Frontend**: http://localhost:8080/true/
- **Swagger UI (via nginx reverse proxy)**: http://localhost:8080/api-docs/
- **pgAdmin**: http://localhost:5050/ (set by `PGADMIN_PORT` in `.env`, defaults to `5050` in `.env.example`)

Login to the application using the credentials from `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

### What happens on first start

On container startup the backend automatically:

- Applies database migrations
- Creates/updates the initial admin account from `.env`
- Optionally seeds example data if `SEED_EXAMPLE_DATA=true`

### Stop

```bash
docker compose down
```

To delete all local data (Postgres volume, pgAdmin config), use:

```bash
docker compose down -v
```

## pgAdmin: connect to the Postgres container

pgAdmin cannot reliably auto-provision a server using environment variables (and passwords cannot be imported). Add the server once via the UI.

1. Login to pgAdmin using `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` from `.env`.
2. Create a new server with connection values that match the `DB_*` settings in your `.env`. The values below are the defaults from `.env.example`.

   - **Host name/address**: `db`
   - **Port**: `5432`
   - **Maintenance database**: `dexiware_db`
   - **Username**: `dexiware_user`
   - **Password**: `dexiware_password`

Important: Use `db` (the Docker service name), not `localhost`.

## API documentation

When running with Docker Compose, Swagger UI is available at:

- http://localhost:8080/api-docs/
