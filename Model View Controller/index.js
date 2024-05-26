require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const server = express();

const productRouter = require('./routes/product');
const userRouter = require('./routes/user');

// Log the environment variables to ensure they're loaded correctly
console.log("env DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("env PORT:", process.env.PORT);
console.log("env PUBLIC_DIR:", process.env.PUBLIC_DIR);

// Middleware
server.use(express.json());
server.use(morgan('combined')); // Use 'combined' format to avoid deprecation warning

// API Endpoints
if (process.env.PUBLIC_DIR) {
  server.use(express.static(process.env.PUBLIC_DIR));
} else {
  console.error('Error: PUBLIC_DIR environment variable is not defined.');
  process.exit(1);
}

server.use('/products', productRouter.router);
server.use('/users', userRouter.router);

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});