const OrderModel = require("../../models/Order");
const ProductModel = require("../../models/Product");
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

exports.getOrdersByCustomerID = async (req, res) => {
  try {
    const { customerId } = req.params;

    //? .lean() thì kết quả trả về sẽ là đối tượng đơn giản, không có các thuộc tính đặc biệt như _doc hoặc __v.
    const orders = await OrderModel.find({
      customer_id: customerId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
    const items = orders.map((item) => item.items);

    //! dùng 2 lần lặp
    // let prd_id = [];
    // items.forEach((i) => {
    //   i.forEach((item) => {
    //     prd_id.push(item.prd_id);
    //   });
    // });
    // prd_id = [...new Set(prd_id)];
    //! dùng flatMap giúp làm phẳng mảng con 1 cấp
    const prd_id = [
      ...new Set(items.flatMap((i) => i.map((item) => item.prd_id))),
    ];

    const products = await ProductModel.find({ _id: { $in: prd_id } });

    const newItems = items.map((item) =>
      item.map((i) => {
        const product = products.find((p) => p._id.toString() === i.prd_id);

        return {
          prd_id: i.prd_id,
          img: product?.img[0],
          name: product?.name,
          qty: i.qty,
          color: product.color[i.colorIndex],
          price:
            i.qty *
            (product?.price - (product?.price * product?.discount) / 100),
        };
      })
    );

    //? nếu orders ở trên đc truy xuất ra từ mongoose mà k có .lean() thì khi destructuring e
    //? sẽ có thêm các key như _doc, _v.
    //? Đây là những thuộc tính nội bộ mà Mongoose sử dụng
    const newOrders = orders.map((e, i) => ({
      ...e,
      items: newItems[i],
    }));

    return res.status(200).json({
      status: "success",
      data: newOrders,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { orderId, cancelAction } = req.body;
    
    // console.log(cancelAction); nếu không truyên cacelAcion vào body thì nó là undefined
    // mặc định lý do hủy là do người mua, nếu ng bán muốn hủy thì truyền thêm vào body cancelAction = 1

    let reason = "Canceled by you";
    if (cancelAction == 1) {
      reason = "Canceled by seller";
    }

    if (!customerId) {
      return res.status(400).json({
        status: "error",
        message: "Customer ID is required",
      });
    }
    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    await OrderModel.findOneAndUpdate(
      {
        customer_id: customerId,
        _id: orderId,
      },
      {
        $set: { status: "canceled", reasonCanceled: reason },
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Order canceled successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};
