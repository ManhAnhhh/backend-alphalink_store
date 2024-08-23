const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");

const getCategories = async (req, res) => {
  const total = await CategoryModel.find({}).countDocuments();
  const categories = await CategoryModel.find({});
  return res.status(200).json({
    status: "success",
    totalCategories: total,
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

const getProductByCategory = async (req, res) => {
  const id = req.params.id;
  const total = await ProductModel.find({ category_id: id }).countDocuments();
  const products = 
        await ProductModel.find({ category_id: id }).sort({_id: -1,});
  return res.status(200).json({
    status: "success",
    totalProducts: total,
    data: products,
  });
};

module.exports = {
  getCategories,
  getCategory,
  getProductByCategory,
};
