const express = require("express");
const router = express.Router();
const ProductController = require("../apps/controllers/api/product");

router.get("/", ProductController.getProducts);
router.get("/category/:id", ProductController.getProductsByCategoryName);
router.get("/:id", ProductController.getProductByID);
router.get("/:id/comments", ProductController.getCommentsByIdProduct);

module.exports = router;
