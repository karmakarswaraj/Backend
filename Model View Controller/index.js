const path = require("path");
const express = require("express");
const morgan = require("morgan");

// Read data.json file
const server = express();

const productRouter = require('./routes/product')
const userRouter = require('./routes/user')


// Middleware
server.use(express.json());

// API Endpoints
server.use('/products',productRouter.router);
server.use('/users',userRouter.router);

// Start server
server.listen(8080, () => { 
  console.log("server started");
});
