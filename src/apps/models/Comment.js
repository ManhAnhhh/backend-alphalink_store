const mongoose = require("../common/database")();

const CommentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  product_id: {
    type: String,
    required: true
  }
})

const CommentModel = mongoose.model("Comments", CommentSchema, "comments");
module.exports = CommentModel;