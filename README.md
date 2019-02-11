# SJD-News API

This is the backend API for SJD-News. I have used a Postgress database with PSQL and Knex. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To install the software you will need:

```
NPM v6.4.1
Node.js v10.9.0
Postgres v10.5
```

## Installing

To download the project, please fork your own repo first, then in your terminal navigate to where you wish to clone the project to, and use the following commands:
```
git clone https://github.com/samueljai/SJD-News.git
```
Change your working directory into the downloaded repo:
```
cd SJD-News
```
Download the required node modules:
```
npm install
```

You will now need to configure your knexfile.js file, for more information visit the knex webiste: https://knexjs.org/#Installation-node. 
In your terminal, run the command:
```
npm run create:config
```

### Running Development Mode

The following commands will create, seed and run the database in development mode:
```
npm run create:db
npm run seed:run:dev
npm run dev
```

### Running Test Mode

The following commands will create, seed and run the database in test mode:
```
npm run create:db_test
npm run seed:run:test
npm test
```

## Deployment

The api has been deployed on Heroku, and you can find the it at: 
https://sjd-news.herokuapp.com/api

## Built With
- Node - JS runtime
- Express - Web application framework
- Knex - SQL query builder
- PostgreSQL - Relational database

## Authors
* **Samuel Jai**
