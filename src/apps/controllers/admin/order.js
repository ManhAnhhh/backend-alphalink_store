const OrderModel = require("../../models/Order");
const ProductModel = require("../../models/Product");

const index = async (req, res) => {
  const orders = await OrderModel.find();
  res.render("admin/orders/order.ejs", {
    orders: orders,
  });

};

const edit = async (req, res) => {
  const status_orders = [
    {key: 'pending', value: 'Chờ xác nhận'},
    {key: 'processing', value: 'Đã xác nhận'},
    {key: 'shipping', value: 'Đang vận chuyển'},
    {key: 'success', value: 'Đã hoàn thành'},
    {key: 'canceled', value: 'Đã hủy'},
  ]; 
  const { id } = req.params;
  const order = await OrderModel.findById(id).lean();

  // Lấy danh sách prd_id từ order.item
  const productIds = order.items.map(item => item.prd_id);

  const products = await ProductModel.find({
    _id: { $in: productIds }
  }).lean();

  const detailedItems = order.items.map(item => {
    const product = products.find(p => p._id.toString() === item.prd_id.toString());
    
    return {
      ...product,
      colorIndex: item.colorIndex,
      qty: item.qty
    };
  });

  res.render("admin/orders/edit_order", {
    order: order,
    products: detailedItems,
    status_orders: status_orders,
  });
};

const update = async (req, res) => {
  const { id } = req.params;
  const {status: newStatus, reasonCanceled, userCanceled} = req.body;

  let userCanceledUpdate = userCanceled;

  if (newStatus != 'canceled') {
    userCanceledUpdate = '';
  }

  const order = await OrderModel.findById(id);
  const oldStatus = order.status;

  // Cập nhật tồn kho chỉ nếu trạng thái thay đổi
  if (oldStatus !== newStatus) {
    for (let item of order.items) {
      const { prd_id, qty } = item;

      // Trường hợp: từ trạng thái chưa trừ kho (pending) → trạng thái trừ kho
      if (
        ['pending'].includes(oldStatus) &&
        ['processing', 'shipping', 'success'].includes(newStatus)
      ) {
        await ProductModel.findByIdAndUpdate(prd_id, {
          $inc: { stock: -qty }
        });
      }

      // Trường hợp: từ trạng thái đã trừ kho → huỷ đơn → cộng lại kho
      else if (
        ['processing', 'shipping', 'success'].includes(oldStatus) &&
        newStatus === 'canceled'
      ) {
        await ProductModel.findByIdAndUpdate(prd_id, {
          $inc: { stock: qty }
        });
      }
    }
  }

  await OrderModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: { status: newStatus , reasonCanceled, userCanceled: userCanceledUpdate},
        }
  );

  res.redirect("/admin/orders");
};

module.exports = {
  index,
  edit,
  update,
};
