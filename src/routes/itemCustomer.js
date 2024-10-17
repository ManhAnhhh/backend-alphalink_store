const express = require("express");
const router = express.Router();
const CartController = require("../apps/controllers/api/cart");
const HeartController = require("../apps/controllers/api/heart");
const OrderController = require("../apps/controllers/api/order");
const CustomerController = require("../apps/controllers/api/customer");
const { uploadCustomers } = require("../apps/middlewares/upload");

router.get("/:customerId", CustomerController.getCustomerByID);
router.post(
  "/:customerId/update",
  // thumbnail là tên key đc đặt bên react ở profiles.js. gửi dưới dạng key value từ client lên server
  // và server lấy có req.files có thumbnail
  uploadCustomers.single("thumbnail"),
  CustomerController.updateCustomer
);

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

// order
router.post("/:customerId/order", OrderController.order);

module.exports = router;
