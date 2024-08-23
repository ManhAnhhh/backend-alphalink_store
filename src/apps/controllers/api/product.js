const ProductModel = require("../../models/Product");
const CommentModel = require("../../models/Comment");
const getProducts = async (req, res) => {
  const query = {};
  const { is_stock, is_featured } = req.query;
  if (is_stock) query.is_stock = is_stock;
  if (is_featured) query.is_feature = is_featured;
  
  const total = await ProductModel.find(query).countDocuments();
  const products = await ProductModel.find(query).sort({ _id: -1 });
  return res.status(200).json({
    status: "success",
    totalProducts: total,
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
  const comments = await CommentModel.find({
    product_id: id,
  });
  return res.status(200).json({
    status: "success",
    data: comments,
  });
};

module.exports = {
  getProducts,
  getProductByID,
  getCommentsByIdProduct,
};
