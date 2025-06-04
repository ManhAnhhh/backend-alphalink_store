const multer = require("multer");
const config = require("config");
const path = require("path");

const pathCustomers = path.join(
  config.get("app.static_folder"),
  "uploads/customers"
);
const pathProductReviews = path.join(
  config.get("app.static_folder"),
  "product_reviews"
);
const pathProducts = path.join(
  config.get("app.static_folder"),
  "uploads/products"
);
const pathUsers = path.join(config.get("app.static_folder"), "uploads/users");

const storage = (path) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
};

// Cấu hình storage cho backend - sửa ảnh sản phẩm
const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pathProducts); // đường dẫn thư mục lưu file
  },
  filename: function (req, file, cb) {
    // đặt tên file → bạn có thể customize
    const uniqueSuffix =
      'temp-' +
      new Date().getFullYear().toString() +
      (new Date().getMonth() + 1).toString() +
      new Date().getDate().toString() +
      "-" +
      new Date().getHours().toString() +
      new Date().getMinutes().toString() +
      new Date().getSeconds().toString() + 
      "-" +
      Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // ví dụ: 1714657082039-834321232.jpg
  },
});

const uploadCustomers = multer({ storage: storage(pathCustomers) });
const uploadProductReviews = multer({ storage: storage(pathProductReviews) });
const uploadProducts = multer({ storage: storageProduct});
const uploadUsers = multer({ storage: storage(pathUsers) });

module.exports = {
  uploadCustomers,
  uploadProductReviews,
  uploadProducts,
  uploadUsers,
};
