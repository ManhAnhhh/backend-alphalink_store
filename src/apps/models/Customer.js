const mongoose = require("../../apps/common/database")();

const CustomerSchema = new mongoose.Schema({
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
  address: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    default: 'male',
  },
  birthDay: {
    type: String,
    default: '01/01/2000',
  },
  picture: {
    type: String,
    default: 'default.jpg',
  },
}, { timeseries: true });

const CustomerModel = mongoose.model("Customers", CustomerSchema, "customers");
module.exports = CustomerModel;

