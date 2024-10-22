const mongoose = require("../common/database")();

const OrderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
    },
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
    totalPrice: {
      type: Number,
      required: true,
    },
    voucher: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    items: [
      {
        prd_id: {
          type: String,
          required: true,
        },
        colorIndex: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      default: "pending",
      // enum: ["pending", "processing", "shipping", "success", "canceled"],
    },
    reasonCanceled: {
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Orders", OrderSchema, "orders");
module.exports = OrderModel;
