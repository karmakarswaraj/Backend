# CRUD Operations

This project demonstrates basic CRUD operations using Node.js and Express.

## Instructions to Run the Project

### Running `server.js` (Uses `data.json` as product list)

To run the specific file `server.js` that uses `data.json` as the product list, use the following `package.json` configuration:

```json
{
  "name": "crud",
  "version": "1.0.0",
  "description": "Basic curd operations",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js"
  },
  "author": "Swaraj Karmakar",
  "license": "ISC",
  "dependencies": {
    "express": "^4.19.2",
    "express-json": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

#### Running index.js (Works in server memory)

To run the specific file `index.js` that works on in server memory, use the following `package.json` configuration:

```json
{
  "name": "crud",
  "version": "1.0.0",
  "description": "Basic curd operations",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "author": "Swaraj Karmakar",
  "license": "ISC",
  "dependencies": {
    "express": "^4.19.2",
    "express-json": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

##### Notes

Ensure you have nodemon installed globally or locally in your project to use the dev script for automatic server restarts.
You can switch between the two configurations by updating the package.json file accordingly.
