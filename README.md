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

## Prerequisites

The project requires the following technologies:

- **Postgres**
- **Java**: Required for running decision models. Ensure the locale is set to `en_US.UTF-8` to avoid execution errors.
- **Node.js**

## Installation

### Clone the repository

Clone the repository to your local machine.

NB: When cloning the repository, ensure that the path does not contain special characters (e.g. 'č') as this may cause issues with running assessments.

### Install dependencies

Navigate to the respective folders and install dependencies for both the frontend and backend:

```bash
npm install
```

To be able to run both frontend and backend with a single command, run **`npm install`**  also in te root directory to install the `concurrently` package.

## Database setup

### Access Postgres

Access the Postgres console using the following commands (replace with your credentials):

- **Windows**:

  ```bash
  psql -U postgres
  ```
- **Linux (Ubuntu)**:

  ```bash
  sudo -u postgres psql
  ```

### Create database and database user

In the Postgres console, execute the following commands to create a database and user:

```sql
CREATE USER dexiware_user WITH PASSWORD 'dexiware_password';
CREATE DATABASE dexiware_db OWNER dexiware_user;
```

**Note:** Ensure that the `username`, `password`, and `database` in the commands above match the values in the `backend/config/config.json` file.

### Grant privileges

Connect to the database and grant necessary privileges:

```
\connect dexiware_db
```

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dexiware_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dexiware_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dexiware_user;
```

Exit the console with `\q`.

## Running the application for the first time

### Start backend

Set the database environment variable and start the backend service (replace `dexiware_db` with the actual name of your database):

- **Windows**:

  ```bash
  $env:DB_NAME = "dexiware_db"
  ```
- **Linux (Ubuntu)**:

  ```bash
  export DB_NAME=dexiware_db
  ```

Run the backend:

```bash
cd backend
npm start
```

Stop the backend (ctrl + c).

### Create a user and assessment

Modify the `create_user.js` script in `backend/node_api/misc/` to set the desired username and password. By default, the username is `admin` and the password is `admin`. Run the script to create a user:

```bash
cd node_api/misc/
node create_user.js
```

Than populate assesments related tables:

```bash
node add_assessments.js
```

### Import data

Import the domain data from **`indicators.json`**:

```bash
  node import_data_script.js
```

Data can also be imported directly from `.dxi` files with **`import_dxi.js`** script (ensure relevant `.dxi` files are in `node_api/business_logic/models/production/`).

### Start backend

Run `npm start` from backend folder:

```
cd ../..
npm start
```

### Start frontend

Open another terminal window and run the frontend:

```bash
cd frontend
npm start
```

Access the application at [http://localhost:4200/](http://localhost:4200/).

## API Documentation

Swagger UI is available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs) when the backend is running.

## Starting the application

First set the **`DB_NAME`** environment variable as described above.

To start both the frontend and backend servers simultaneously, run the following command in the root directory:

```bash
npm start
```

Access the application at [http://localhost:4200/](http://localhost:4200/).
