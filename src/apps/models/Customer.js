const mongoose = require("../../apps/common/database")();

const CustomerSchema = new mongoose.Schema(
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
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      default: "male",
    },
    birthDay: {
      type: String,
      default: "01/01/2000",
    },
    picture: {
      type: String,
      default: "default.jpg",
    },
    cart: [
      {
        prd_id: {
          type: String,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
        img: [
          {
            type: String,
            required: true,
          },
        ],
        color: [
          {
            type: String,
            required: true,
          },
        ],
        colorIndex: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    heart: [
      {
        prd_id: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
        img: [
          {
            type: String,
            required: true,
          },
        ],
        color: [
          {
            type: String,
            required: true,
          },
        ],
        is_stock: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timeseries: true }
);

const CustomerModel = mongoose.model("Customers", CustomerSchema, "customers");
module.exports = CustomerModel;
