const express = require("express");
const router = express.Router();
const AuthController = require("../apps/controllers/admin/auth");
const DashboardController = require("../apps/controllers/admin/dashboard");
const ProductController = require("../apps/controllers/admin/product");
const CategoryController = require("../apps/controllers/admin/category");
const MessageController = require("../apps/controllers/admin/message");
const OrderController = require("../apps/controllers/admin/order");

const AuthMiddleware = require("../apps/middlewares/auth");
const { uploadProducts } = require("../apps/middlewares/upload");

router.get("/login", 
  // AuthMiddleware.checkLogin,
  AuthController.getLogin);
router.post("/login", 
  // AuthMiddleware.checkLogin,
  AuthController.postLogin);

router.get("/register", 
  // AuthMiddleware.checkLogin,
  AuthController.getRegister);
router.post("/register", 
  // AuthMiddleware.checkLogin,
  AuthController.postRegister);

router.get("/logout", 
  AuthMiddleware.checkLogout,
  AuthController.logout);
router.get("/dashboard", 
  // AuthMiddleware.checkAdmin,
  DashboardController.index);

router.get("/products", 
  // AuthMiddleware.checkAdmin, 
  ProductController.index);
router.get(
  "/products/remove",
  // AuthMiddleware.checkAdmin,
  ProductController.inactive
);
router.get(
  "/products/create",
  // AuthMiddleware.checkAdmin,
  ProductController.create
);
router.post(
  "/products/store",
  uploadProducts.array("img[]"),
  // AuthMiddleware.checkAdmin,
  ProductController.store
);
router.get(
  "/products/edit/:id",
  // AuthMiddleware.checkAdmin,
  ProductController.edit
);
router.post(
  "/products/edit/:id",
  // AuthMiddleware.checkAdmin,
  ProductController.update
);
router.post("/products/trash/:id", 
  // AuthMiddleware.checkAdmin, 
  ProductController.trash);
router.post("/products/delete/:id", 
  // AuthMiddleware.checkAdmin, 
  ProductController.del);
router.post("/products/restore/:id",
  // AuthMiddleware.checkAdmin,
  ProductController.restore);

router.get("/categories", 
  // AuthMiddleware.checkAdmin,
  CategoryController.index);
router.get("/categories/edit/:id", 
  // AuthMiddleware.checkAdmin,
  CategoryController.edit);
router.post("/categories/edit/:id", 
  // AuthMiddleware.checkAdmin,
  CategoryController.update);
router.post("/categories/delete/:id", 
  // AuthMiddleware.checkAdmin, 
  CategoryController.del);

router.get("/orders", 
  // AuthMiddleware.checkAdmin, 
  OrderController.index);

router.get("/orders/edit/:id", 
// AuthMiddleware.checkAdmin, 
OrderController.edit);

router.post("/orders/update/:id", 
// AuthMiddleware.checkAdmin, 
OrderController.update);

router.get("/messages", 
  // AuthMiddleware.checkAdmin,
  MessageController.index);

// Route POST upload xử lý upload ảnh sản phẩm
router.post("/upload", uploadProducts.single("img"), (req, res) => {
  if (req.file) {
    // Thành công
    res.json({
      success: true,
      filename: req.file.filename,
    });
  } else {
    // Không có file
    res.status(400).json({
      success: false,
      message: "Không nhận được file",
    });
  }
});

module.exports = router;
