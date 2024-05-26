const express = require("express");
const userController = require("../controller/user");

const router = express.Router();

router
  .post("",userController.create)
  .get("",userController.gettAll)
  .get("/:id",userController.get)
  .put("/:id",userController.replace)
  .patch("/:id",userController.update)
  .delete("/:id",userController.delete);

exports.router = router;
