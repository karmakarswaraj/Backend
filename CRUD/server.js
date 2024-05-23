const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");

// Read data.json file
let data;
try {
  const dataPath = path.join(__dirname, "data.json");
  data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} catch (err) {
  console.error("Error reading data.json:", err);
  data = { products: [] };
}
const products = data.products;

const server = express();

// Middleware
server.use(express.json());

// API Endpoints

// Create POST /products
server.post("/products", (req, res) => {
  const newProduct = req.body;
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Read GET /products
server.get("/products", (req, res) => {
  res.json(products);
});

// Read GET /products/:id
server.get("/products/:id", (req, res) => {
  const id = +req.params.id;
  const product = products.find((p) => p.id === id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Update PUT /products/:id
server.put("/products/:id", (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products[productIndex];
    products[productIndex] = { ...product, ...req.body, id: id };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Update PATCH /products/:id
server.patch("/products/:id", (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products[productIndex];
    products[productIndex] = { ...product, ...req.body };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Delete DELETE /products/:id
server.delete("/products/:id", (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products.splice(productIndex, 1)[0];
    res.status(200).json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Start server
server.listen(8080, () => {
  console.log("server started");
});
