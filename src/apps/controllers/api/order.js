const OrderModel = require("../../models/Order");
const ProductModel = require("../../models/Product");
const config = require("config");
const transporter = require("../../../helper/transporter");
const path = require("path");
const ejs = require("ejs");
const _ = require("lodash");

exports.order = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      fullName,
      email,
      phone,
      address,
      items,
      voucher,
      note,
      totalPrice,
    } = req.body;
    console.log(email);
    // items truyen sang chi co: prd_id, colorIndex, qty
    // nen can dung lodash de tao ra newItems co day du thong tin truyen sang ejs

    //? lấy ra mảng các prd_id trong items dùng tìm ra các product có đầy
    //? đủ thông tin trong ProductModel
    const prd_id = items.map((item) => item.prd_id);
    const products = await ProductModel.find({ _id: { $in: prd_id } });

    const newItems = [];
    for (const prd of products) {
      //? dùng filter để lấy ra 1 mảng các item có cùng prd_id
      //? vì (có thể trong items có 2 sp cùng prd_id nhưng có colorIndex khác nhau)
      const elements = _.filter(items, {
        prd_id: prd._id.toString(),
      });
      elements.map((e) => {
        e.name = prd.name;
        e.price = prd.price;
        e.discount = prd.discount;
        e.color = prd.color;
      });
      newItems.push(...elements);
    }

    //! Lưu vào database chỉ cần items có 3 thông tin là: prd_id, colorIndex, qty
    const data = {
      customer_id: customerId,
      fullName,
      email,
      phone,
      address,
      totalPrice,
      voucher,
      note,
      items,
    };
    await OrderModel(data).save();

    //? req.app.get("views"): lấy đường dẫn đến thư mục chứa các view (các file template EJS)
    //? từ cấu hình set view trong app.js
    const html = await ejs.renderFile(
      path.join(req.app.get("views"), "api/mail.ejs"),
      {
        fullName,
        email,
        address,
        phone,
        note,
        items: newItems,
        voucher,
        totalPrice,
      }
    );

    //? send mail
    await transporter.sendMail({
      from: `"Alphalink Store" <${process.env.MAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: "Confirm to buy product from Alphalink Store ✔", // Subject line
      html, // html body
    });
    return res.status(200).json({
      status: "success",
      message: "Created Order Successfully",
      newItems,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};
