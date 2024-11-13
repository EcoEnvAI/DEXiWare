# True interface
## prerequisite

The technologies used in this project are [Node.js][1], [Angular.js][2] and [Express.js][3].
While [Angular][2] and [Express][3] are automatically installed [Node.js][1] needs to be installed separately.

## setting up the environment
- go to the folder where you will setup the project.
- clone the gitlab repository with the next command

```
git clone https://repo.ijs.si/environmental/true-interface.git
```

- navigate to the folder where package.json and angular.json are located
- install dependencies with command

```
npm install
```
## setting up the database
For testing purposes we are using the postgres database. First download the database from [postgres][4] then run the following
commands.

```
psql -U postgres
```

On Linux (Ubuntu):

```
sudo -u postgres psql
```

If you entered a password during the Postgres install, you will be prompted for it here. If you are using Windows, it's possible the installer did not add the command to your system path and you will get an error stating that psql is not a vakid command. To fix this, add {POSTGRES_INSTALL_PATH}\\{POSTGRES_VERSION}\\bin\\ to your path. For example  "C:\\Program Files\\PostgresSQL\\10\\bin\\".

After the psql command, you will enter the Postgres console. Run the following commands to create a database and a user

### IMPORTANT 
If anybody created the database before 1.6.2020 you'll need to drop your 
database and redo the steps.

```
CREATE DATABASE truedb;
CREATE USER roms WITH PASSWORD 'hci2019';

GRANT ALL PRIVILEGES ON DATABASE truedb TO roms;
```

You might also need to run

```

\connect <database name>
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO roms;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO roms;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO roms;

```

And exit the Postgres console with 

```
\q
```

## run the application
before we can run the application we need to start the node backend service with the command.
If the database is setup correctly running node app.js will populate the database with the template we created in
folder node-api/models/all_models.js The following command needs to be ran in project root.

```
node app.js
```

To run the application run the below command in a seperate console/terminal

```
npm start
```

the application will be served on localhost:4200

## creating a user
under node-api/misc/ is a file called create_user.js where you may change the username and password of the user
you wish to put into the database. The User can be then used to login into the site. Run the script with

```
node create_user.js
```
Run the appplication first so it creates the needed tables!


## Data importing
After you run the server for the first time you can import the data from indicators.json. Go to directory
/node_api/misc/ and run

```
node import_data_script.js
```

## API Endpoints
Developed API is capable of handling following operations:

- Get model's inputs 
  - GET /api/structure/inputs 
  - GET /api/structure/inputs/model/<MODEL_NAME>
- Get model's attributes 
  - GET /api/structure/attributes 
  - GET /api/structure/attributes/model/<MODEL_NAME>]
- Evaluate alternative
  - POST /api/assessment/evaluate
  - POST /api/assessment/evaluate/root **\[return models' roots only\]**
  - POST /api/assessment/evaluate/model/<MODEL_NAME>
  - POST /api/assessment/evaluate/model/<MODEL_NAME>]/root **\[return models' roots only\]**
- Bottom-up analysis
  - POST /api/analysis/bottom-up
  - POST /api/analysis/bottom-up/root **\[return models' roots only\]**
  - POST /api/analysis/bottom-up/model/<MODEL_NAME>
  - POST /api/analysis/bottom-up/model/<MODEL_NAME>/root **\[return models' roots only\]**
- Top-down analysis
  - POST /api/analysis/top-down
  - POST /api/analysis/top-down/model/<MODEL_NAME>


The namespace <MODEL_NAME> need to be replaced with the name of a model that will be used for the corresponding action. 
Names are registered in the system with necessary details. For the needs of TRUE project, there are two DEX models registered: ***AgriFoodChainFull*** (default) and ***AgriFoodChainIntegrated***.

The API endpoints are designed to follow certain rules on how the payload (inout JSON object) need to be constructed. JSON validation schemas of inputs are given in folder */config/endpoint_schemas*. 
However, they are not yet in use for strict validation, rather for informative proposes, providing description of each field that must be provided. Similar JSON validation schemas are provided for the corresponding output JSON objects.
Examples of payloads (JSON objects) for calling POST endpoints, are given in */config/endpoint_examples*.

[1]: https://nodejs.org/en/
[2]: https://angular.io/
[3]: https://expressjs.com/
[4]: https://www.postgresql.org/download/
