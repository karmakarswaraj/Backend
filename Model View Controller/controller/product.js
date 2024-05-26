const fs = require("fs");

const data = JSON.parse(fs.readFileSync('data.json', "utf-8"));

const products = data.products;

// Create POST /products
exports.create = (req, res) => {
  const newProduct = req.body;
  products.push(newProduct);
  res.status(201).json(newProduct);
};
// Read GET /products
exports.get = (req, res) => {
  res.json(products);
};
// Read GET /products/:id
exports.getAll = (req, res) => {
  const id = +req.params.id;
  const product = products.find((p) => p.id === id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
};
// Update PUT /products/:id
exports.replace = (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products[productIndex];
    products[productIndex] = { ...product, ...req.body, id: id };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
};
// Update PATCH /products/:id
exports.update = (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products[productIndex];
    products[productIndex] = { ...product, ...req.body };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
};
// Delete DELETE /products/:id
exports.delete = (req, res) => {
  const id = +req.params.id;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    const product = products.splice(productIndex, 1)[0];
    res.status(200).json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
};
