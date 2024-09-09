const express = require("express");
const router = express.Router();
const productsRouter = require("./products");
const categoriesRouter = require("./categories");
const customersRouter = require("./customers");
const cartRouter = require("./cart");

const testController = require("../apps/controllers/api/test");

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/customers", customersRouter);

router.use("/", cartRouter);

router.get("/test", testController.test);
router.post("/test", testController.postTest);

module.exports = router;
