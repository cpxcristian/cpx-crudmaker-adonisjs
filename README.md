# @cpxproject/crudmaker-adonisjs

Generate CRUD operations for [AdonisJS v6 and v7](https://adonisjs.com/).


## Limitations
- Only generates belongsTo relations.

## Features
- Generate CRUD components (model, validator, controller and lang files) for a given table name.
- Model is generated with columns, types, indexes, relations (belongTo and hasMany).
- Validator is generated with rules for each column.
- Controller is generated with basic CRUD operations (index, show, store, update, destroy).
- Lang files are generated for each CRUD component.

## Changes
- Implemented SchemaInspector to get relations, instead of information_schema connection.
- The connection called "information_schema" is not needed anymore.
- The name of the main database connection is not "mysql" anymore, it can be any name.
- Works over mysql, mariadb, postgresql and sqlite.



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

## License
MIT
