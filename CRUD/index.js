import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
let data = [];
let nextId = 1;

app.use(bodyParser.json());
//POST creates new object and pushes into the DB.
app.post("/product", (req, res) => {
  const { title, description, price, stock, brand, category } = req.body;
  const newData = {
    id: nextId++,
    title,
    description,
    price,
    stock,
    brand,
    category,
  };
  data.push(newData);
  res.status(201).send(newData);
});
//GET shows all the datas stored into a DB.
//Type 1: shows all the datas stored
app.get("/product", (req, res) => {
  res.status(200).send(data);
});
//Type 2: shows the single data req
app.get("/product/:id", (req, res) => {
  const singleId = data.find((t) => t.id === +req.params.id);
  if (!singleId) {
    return res.status(404).send({ message: "Product not found" });
  } else {
    res.status(200).send(singleId);
  }
});

//PUT helps to update the datas in the DB.
app.put("/product/:id", (req, res) => {
  const singleId = data.find((t) => t.id === +req.params.id);
  if (!singleId) {
    return res.status(404).send({ message: "Product not found" });
  } else {
    const { title, description, price } = req.body;
    singleId.title = title;
    singleId.description = description;
    singleId.price = price;
    res.status(200).send(singleId);
  }
});

//DELETE helps to delete data from the DB.
app.delete("/product/:id", (req, res) => {
  const singleId = data.findIndex((t) => t.id === +req.params.id);
  if (singleId === -1) {
    res.send(404).send({ message: "Product not found" });
  } else {
    data.splice(singleId, 1);
    return res.status(204).send();
  }
});
app.listen(port, () => {
  console.log(`Server is listening at port:${port}...`);
});
