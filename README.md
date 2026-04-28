# @cpxproject/crudmaker-adonisjs

Generate CRUD operations for [AdonisJS v6 and v7](https://adonisjs.com/).


## Limitations
- Works over mysql or mariaDB.
- The database connection to generate the CRUD has to be named "mysql".
- User need to add a new database connection in `config/database.ts` called "information_schema" to read the database schema.

## Notes and things to improve
- We use information_schema instead of SchemaInspector to get belongTo and hasMany relations.
- Also stubs in adonisjs are not used because have errors on v6 and v7, we use "manual" stubs for now.
- Many to Many and hasOne relations are not implemented yet.

## Features
- Generate CRUD components (model, validator, controller and lang files) for a given table name.
- Model is generated with columns, types, indexes, relations (belongTo and hasMany).
- Validator is generated with rules for each column.
- Controller is generated with basic CRUD operations (index, show, store, update, destroy).
- Lang files are generated for each CRUD component.

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
