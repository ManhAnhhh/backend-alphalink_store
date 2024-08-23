const mongoose = require("../common/database")();

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent_id: {
    type: String,
  },
});
const CategoryModel = mongoose.model("Categories", CategorySchema, "categories");
module.exports = CategoryModel;

