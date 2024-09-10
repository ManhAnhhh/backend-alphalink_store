const express = require("express");
const router = express.Router();
const CartController = require("../apps/controllers/api/cart");

router.post(
  "/customer/:customerId/delete-cart/:productId",
  CartController.deleteProductInCart
);
router.post(
  "/customer/:customerId/add-to-cart/:productId",
  CartController.addToCart
);
router.post("/customer/:customerId/update-cart", CartController.updateCart);
module.exports = router;
