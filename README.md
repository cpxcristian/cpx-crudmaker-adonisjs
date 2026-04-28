# @cpxproject/crudmaker-adonisjs

Generate CRUD operations for [AdonisJS v6 and v7](https://adonisjs.com/).

- Works over mysql or mariaDB.
- User need to add a new database connection in `config/database.ts` called "information_schema" to read the database schema.

## Features
- Generate CRUD components (model, validator, controller and lang files) for a given table name.

## Installation

```bash
npm install @cpxproject/crudmaker-adonisjs
```

After installation, configure the package:

```bash
node ace configure @cpxproject/crudmaker-adonisjs
```


## Usage

### Create a new CRUD

```bash
node ace cpx-crudmaker:all table_name
```

## Individual commands

### Create a new Model

```bash
node ace cpx-crudmaker:model table_name
```

### Create a new Validator

```bash
node ace cpx-crudmaker:validator table_name
```

### Create a new Controller

```bash
node ace cpx-crudmaker:controller table_name
```

### Create a new Lang files

```bash
node ace cpx-crudmaker:lang table_name
```

### Add information_schema connection in "config/database.ts"
```
    information_schema: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: 'information_schema',
        timezone: '-06:00',
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
```

## License
MIT
