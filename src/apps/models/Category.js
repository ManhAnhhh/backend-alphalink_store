const mongoose = require("../common/database")();

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent_id: {
    type: String,
  },
  status: {
    type: String,
    default: 'active'
  },
});
const CategoryModel = mongoose.model("Categories", CategorySchema, "categories");
module.exports = CategoryModel;

