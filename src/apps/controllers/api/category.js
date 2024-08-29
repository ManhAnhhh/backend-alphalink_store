const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");
const config = require("config");

const getCategories = async (req, res) => {
  const query = {};
  if (req.query.name) query.name = req.query.name;

  const total = await CategoryModel.find(query).countDocuments();

  const page = req.query.page || 1;
  const limit = req.query.limit || total;
  const skip = page * limit - limit;

  
  const categories = await CategoryModel.find(query).skip(skip).limit(limit);

  return res.status(200).json({
    status: "success",
    totalCategories: total,
    totalPages: Math.ceil(total / limit),
    filters: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
    data: categories,
  });
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  res.status(200).json({
    status: "success",
    data: category,
  });
};

const getProductsByCategory = async (req, res) => {
  const id = req.params.id;

  const total = await ProductModel.find({ category_id: id }).countDocuments();

  const page = req.query.page || 1;
  const limit = req.query.limit || total;
  const skip = page * limit - limit;

  
  const products = await ProductModel.find({ category_id: id })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
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

module.exports = {
  getCategories,
  getCategory,
  getProductsByCategory,
};
