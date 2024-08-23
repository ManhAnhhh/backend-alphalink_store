const express = require('express')
const router = express.Router();
const productsRouter = require("./products");
const categoriesRouter = require("./categories");

router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);

module.exports = router;
