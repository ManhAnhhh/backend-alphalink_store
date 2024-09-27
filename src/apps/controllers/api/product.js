const ProductModel = require("../../models/Product");
const CommentModel = require("../../models/Comment");
const config = require("config");
const CategoryModel = require("../../models/Category");
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
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

const getProductsByCategoryName = async (req, res) => {
  try {
    const { id } = req.params;
    let productsByCategoryName = [];
    let results = [];
    let total = 0;
    const products = await ProductModel.find({});

    const categories = await CategoryModel.find({
      parent_id: id,
    });
    // kiểm tra xem id truyền vào có là cha của category khác không
    // nếu phải thì phải render ra products của các category con
    // nếu không thì render ra tất cả products của category đó
    if (categories.length > 0) {
      productsByCategoryName = categories.map((category) =>
        products.filter((product) => {
          if (product.category_id == category._id.toString()) total++;
          return product.category_id == category._id.toString();
        })
      );
    } else {
      productsByCategoryName = await ProductModel.find({ category_id: id });
      total = productsByCategoryName.length;
    }

    productsByCategoryName.forEach((item) => {
      if (Array.isArray(item)) {
        results.push(...item);
        return;
      }
      results.push(item);
    });

    return res.status(200).json({
      status: "success",
      total: total,
      data: results,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

const getCommentsByIdProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || config.get("app.default_limit_page");
    const skip = page * limit - limit;

    const total = await CommentModel.find({
      product_id: id,
    }).countDocuments();

    const comments = await CommentModel.find({
      product_id: id,
    })
      .skip(skip)
      .limit(limit);
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
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

module.exports = {
  getProducts,
  getProductByID,
  getProductsByCategoryName,
  getCommentsByIdProduct,
};
