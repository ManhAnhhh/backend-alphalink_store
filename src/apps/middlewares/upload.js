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

const uploadCustomers = multer({ storage: storage(pathCustomers) });
const uploadProductReviews = multer({ storage: storage(pathProductReviews) });
const uploadProducts = multer({ storage: storage(pathProducts) });
const uploadUsers = multer({ storage: storage(pathUsers) });

module.exports = {
  uploadCustomers,
  uploadProductReviews,
  uploadProducts,
  uploadUsers,
};
