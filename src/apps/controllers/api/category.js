const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");

const getCategories = async (req, res) => {
  const query = {};
  if (req.query.name) query.name = req.query.name;
  query.status = 'active';

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
  try {
    const { id } = req.params;
    const category = await CategoryModel.findOne({_id: id, status: 'active'});
    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const total = await ProductModel.find({ category_id: id, status: 'active' }).countDocuments();
    const page = req.query.page || 1;
    const limit = req.query.limit || total;
    const skip = page * limit - limit;

    const products = await ProductModel.find({ category_id: id, status: 'active' })
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
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  getProductsByCategory,
};
