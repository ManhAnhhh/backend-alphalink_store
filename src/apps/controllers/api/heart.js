const CustomerModel = require("../../models/Customer");
exports.addHeartItem = async (req, res) => {
  try {
    const { prd_id, price, discount, name, img, color, is_stock } = req.body;
    const { customerId } = req.params;
    const customer = await CustomerModel.findById(customerId);
    let result;
    const newProduct = {
      prd_id,
      price,
      discount,
      name,
      img,
      color,
      is_stock,
    };
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }
    const heart = customer.heart;
    const isProduct = heart.some((product) => product.prd_id === prd_id);
    if (isProduct) {
      result = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $pull: { heart: { prd_id: prd_id } } }, // Thêm sản phẩm vào heart
        { new: true } // Trả về đối tượng đã cập nhật
      );
      return res.status(200).json({
        status: "success",
        message: "Product is existed",
        data: result.heart,
      });
    }

    result = await CustomerModel.findByIdAndUpdate(
      customerId,
      { $push: { heart: newProduct } }, // Thêm sản phẩm vào heart
      { new: true } // Trả về đối tượng đã cập nhật
    );
    return res.status(200).json({
      status: "success",
      message: "Add to heart successfully",
      data: result.heart,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.deleteHeartItem = async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    const customer = await CustomerModel.findById(customerId);

    if (!customer)
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    if (!productId)
      return res.status(404).json({
        status: "error",
        message: "ProductId not found",
      });
    const isProduct = customer.heart.some(
      (product) => product.prd_id === productId
    );
    if (!isProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found in heart",
      });
    }
    const result = await CustomerModel.findByIdAndUpdate(
      customerId,
      { $pull: { heart: { prd_id: productId } } }, // Sử dụng $pull để xóa sản phẩm bằng productId
      { new: true } // Trả về đối tượng user đã được cập nhật
    );
    return res.status(200).json({
      status: "success",
      message: "Product removed from heart successfully",
      data: result.heart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.deleteManyProductInHeart = async (req, res) => {
  try {
    const data = req.body;
    const { customerId } = req.params;
    const result = await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        $pull: { heart: { prd_id: { $in: data } } },
      },
      // xóa xong tạo ra 1 đối tượng mới được update
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "delete items in heart successfully",
      data: result.heart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};
