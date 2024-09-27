const express = require("express");
const router = express.Router();
const CartController = require("../apps/controllers/api/cart");
const HeartController = require("../apps/controllers/api/heart");

// cart routes
router.post(
  "/:customerId/delete-cart/:productId",
  CartController.deleteProductInCart
);
router.post(
  "/:customerId/delete-many-cart/",
  CartController.deleteManyProductInCart
);
router.post("/:customerId/add-to-cart/:productId", CartController.addToCart);
router.post("/:customerId/update-cart", CartController.updateCart);

// heart items routes
router.post(
  "/:customerId/add-to-heart/:productId",
  HeartController.addHeartItem
);
router.post(
  "/:customerId/delete-heart-item/:productId",
  HeartController.deleteHeartItem
);
router.post(
  "/:customerId/delete-many-heart-item",
  HeartController.deleteManyProductInHeart
);
module.exports = router;
