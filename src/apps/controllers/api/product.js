const ProductModel = require("../../models/Product");
const CommentModel = require("../../models/Comment");
const config = require("config");
const getProducts = async (req, res) => {
  const query = {};
  const { is_stock, is_featured } = req.query;
  if (is_stock) query.is_stock = is_stock;
  if (is_featured) query.is_feature = is_featured;

  const total = await ProductModel.find(query).countDocuments();

  const page = req.query.page || 1;
  const limit = req.query.limit || total;
  const skip = page * limit - limit;

  
  const products = await ProductModel.find(query).skip(skip).limit(limit);
  return res.status(200).json({
    status: "success",
    totalProducts: total,
    totalPages: Math.ceil(total / limit),
    filters: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
    data: products,
  });
};

const getProductByID = async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.findById(id);

  return res.status(200).json({
    status: "success",
    data: product,
  });
};

const getCommentsByIdProduct = async (req, res) => {
  const id = req.params.id;

  const page = req.query.page || 1;
  const limit = req.query.limit || config.get("app.default_limit_page");
  const skip = page * limit - limit;

  const total = await CommentModel.find({
    product_id: id,
  }).countDocuments();

  const comments = await CommentModel.find({
    product_id: id,
  }).skip(skip).limit(limit);
  return res.status(200).json({
    status: "success",
    totalComments: total,
    totalPages: Math.ceil(total / limit),
    filters: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
    data: comments,
  });
};

module.exports = {
  getProducts,
  getProductByID,
  getCommentsByIdProduct,
};
