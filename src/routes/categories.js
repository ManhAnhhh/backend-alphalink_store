const express = require("express");
const router = express.Router();
const CategoryController = require("../apps/controllers/api/category");

router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategory);
router.get("/:id/products", CategoryController.getProductsByCategory);

module.exports = router;
