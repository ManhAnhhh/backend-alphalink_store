
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");

const USD_TO_VND = 20000;
const capitalizeFirstLetter = (str) => {
  if (str.length === 0) return str; // Kiểm tra chuỗi rỗng
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formattedPriceUSD = (price, discount) => {
  const result = HandlePriceWithDiscount(price, discount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(result);
};

const formattedPriceVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price * USD_TO_VND);
};

const formatDateToDDMMYYYY = (dateInput) => {
  const date = new Date(dateInput);
  
  const day = String(date.getDate()).padStart(2, '0');      // lấy ngày, thêm số 0 nếu < 10
  const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0 nên +1
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const formatDateToYYYYMMDD = (dateInput) => {
  const date = new Date(dateInput);
  
  const day = String(date.getDate()).padStart(2, '0');      // lấy ngày, thêm số 0 nếu < 10
  const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0 nên +1
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

module.exports = async (req, res, next) => {
  res.locals.emailadminAcc = req.session.email;
  res.locals.fullNameLogin = req.session.fullName;
  res.locals.mostSoldProducts = await ProductModel.find().sort({ sold: -1 }).limit(10);
  res.locals.pendingOrders = await OrderModel.find({status: 'pending'}).sort({ createdAt : -1 });
  res.locals.formattedPriceVND = formattedPriceVND;
  res.locals.formattedPriceUSD = formattedPriceUSD;
  res.locals.capitalizeFirstLetter = capitalizeFirstLetter;
  res.locals.formatDateToDDMMYYYY = formatDateToDDMMYYYY;
  res.locals.formatDateToYYYYMMDD = formatDateToYYYYMMDD;
  // res.locals.categories = await CategoryModel.find();
  next();
};
