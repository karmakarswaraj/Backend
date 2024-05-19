const http = require("http");
const fs = require("fs");

// Read index.html and data.json synchronously
const index = fs.readFileSync("index.html", "utf-8");
const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
const products = data.products;

// Create the server
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/product")) {
    const id = req.url.split("/")[2];
    const product = products.find((p) => p.id === +id);

    // Check if product exists
    if (product) {
      res.setHeader("Content-Type", "text/html");
      const modind = index
        .replace("**title**", product.title)
        .replace("**price**", product.price)
        .replace("**url**", product.thumbnail)
        .replace("**rating**", product.rating);
      res.end(modind);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Product Not Found</h1>");
    }
    return;
  }

  switch (req.url) {
    case "/":
      res.setHeader("Content-Type", "text/html");
      res.end(index);
      break;
    case "/api":
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
      break;
    default:
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Page Not Found</h1>");
  }
});

// Log server start outside of request handler
server.listen(8000, () => {
  console.log("Server started on port 8000");
});
