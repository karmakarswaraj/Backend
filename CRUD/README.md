Go to package.json and change 

USE THIS TO RUN server.js to run the specific file that uses data.json as product list.
{
  "name": "crud",
  "version": "1.0.0",
  "description": "Basic curd operations",
  "main": "script.js",
  "scripts": {
    "dev": "nodemon script.js"
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


USE THIS TO RUN index.json to run the specific file that worls on in server memory.
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
