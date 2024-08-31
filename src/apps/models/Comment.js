const mongoose = require("../common/database")();

const CommentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    birthDay: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("Comments", CommentSchema, "comments");
module.exports = CommentModel;
