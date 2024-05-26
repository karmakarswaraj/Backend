const express = require("express");
const productController = require("../controller/product");

const router = express.Router();

router
  .post("",productController.create)
  .get("",productController.gettAll)
  .get("/:id",productController.get)
  .put("/:id",productController.replace)
  .patch("/:id",productController.update)
  .delete("/:id",productController.delete);

exports.router = router;
