## Modelador

Advanced CRUD generator using:

* Client: Angular, Bootstrap
* Server: Nodejs, Jade, Mongoose

### Notes

* mongoose errors are rewritten to support muti-language properly


## Test

backend

```sh
npm test
```

fontend/e2e

```sh
npm install -g webdriver-manager protractor


# start selenium
webdriver-manager start >/dev/null 2>&1 &
node server/app.js >/dev/null 2>&1 &
grunt test
```

## Model definition

The model definition is checked against a [JSON Schema](src/schema/schema.json), this contains all information
you should know :)

* singular:String

  Singular name of the model.

  Example: user, order...

* plural:String (optional)

  if no especified will use: [pluralize](https://github.com/blakeembrey/pluralize)

  Example: users, orders...

* backend: Object

  [see below](#model-backend)

* fontend

  TODO

<a name="model-backend">
### Model: backend

Collection definition (Mongoose Model).
Apart from what you define, we will add:

* Timestamps: created_at, updated_at
* *TODO* last user: created_by: updated_by
* Version control: \_\_v

#### Model: backend.options (Object)

  Mongoose options. Mostly to specify collection name.

####  Model: backend.permissions: Object(read, list, create, update, delete)

  Label definition for permissions, all properties are required.

  ```json
  {
    "permissions": {
      "read": "View users",
      "list": "List users",
      "create": "Create users",
      "update": "Update users",
      "delete": "Delete users"
    }
  }
  ```

#### Model: backend.formatter: Function

Function to transform models.

It will be called just before output.

*NOTE* Do not use it to hide properties, use `restricted` instead.

#### Model: backend.schema: Object

Example

```json
{
  "schema": {
    "username": {
      "type": "String"
    }
  }
}
```

* label: String

Label that will be displayed at forms and list.

Optional for: Array, Object types.

* type: String
  * Date
  * String
  * Number
  * ObjectId
  * Mixed
  * Array
    Require a `items` property.
  * Object
    Require a `properties` property.

*NOTE* while mongoose support custom type, we actually don't because
the schema, edit manually atm.

* restricted (boolean | object)

With an object, you can specify what to do in each operation.

```js
{
  "restricted": {
    "create": false, // no restricted
    "update": true, // always restricted
    "read": "permission-xxx" // check permission
  }
}
```

`restricted = true` is a shortcut of: `{create: false, update: false, read: true}`
`restricted = false` is a shortcut of: `{create: false, update: false, read: false}`


Fields examples:

* Type Array of ObjectIds (OneToMany relation)
  ```json
  {
    "field": {
      "type": "Array",
      "items": {
        "label": "list_of_x",
        "type": "ObjectId",
        "ref": "x",
        "restricted": false
      }
    }
  }
  ```

* Type Object
  ```yml
  {
    "data": {
      "type": "Object",
      "properties": {
        "first_name": {
          "label": "First name",
          "type": "String",
          "restricted": false
        },
        "last_name": {
          "label": "Last name",
          "type": "String",
          "restricted": false
        }
      }
    }
  }
  ```

* Update/Create only if has permission, everybody reads.
  ```json
  {
    "field": {
      "label": "Field",
      "type": "String",
      "restricted": {
        "read": true,
        "update": "permission-xxx-update",
        "create": "permission-xxx-create"
      }
    },
  }
  ```
