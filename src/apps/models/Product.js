const mongoose = require("../common/database")();
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  star: {
    type: Number,
    default: 0,
  },
  color: [{ type: String }],
  img: [
    {
      type: String,
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  is_stock: {
    type: Boolean,
    default: true,
  },
  is_feature: {
    type: Boolean,
    default: true,
  },
  product_details: {
    type: String,
    required: true,
  },
  accessories: {
    type: String,
  },
  category_id: {
    type: String,
    required: true,
  },
});
const ProductModel = mongoose.model("Product", ProductSchema, "products");
module.exports = ProductModel;
