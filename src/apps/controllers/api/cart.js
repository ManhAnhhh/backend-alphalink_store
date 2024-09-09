const CustomerModel = require("../../models/Customer");
exports.deleteProductInCart = async (req, res) => {
  const { customerId, productId } = req.params;
  const {colorIndex} = req.body;
  console.log(colorIndex);
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
    console.log(customer.cart);
  const isProduct = customer.cart.some(
    (product) =>
      product.prd_id === productId && product.colorIndex == colorIndex
  );
  console.log(isProduct);
  if (!isProduct) {
    return res.status(404).json({
      status: "error",
      message: "Product not found in cart",
    });
  }
  const result = await CustomerModel.findByIdAndUpdate(
    customerId,
    { $pull: { cart: { prd_id: productId, colorIndex: colorIndex } } }, // Sử dụng $pull để xóa sản phẩm bằng productId
    { new: true } // Trả về đối tượng user đã được cập nhật
  );
  return res.status(200).json({
    status: "delete successful",
    message: "Product removed from cart successfully",
    data: result.cart,
  });
};

exports.addToCart = async (req, res) => {
  try {
    const { prd_id, qty, price, discount, name, img, colorIndex, color } =
      req.body;
    const { customerId } = req.params;
    const customer = await CustomerModel.findById(customerId);
    let result;
    const newProduct = {
      prd_id,
      qty,
      price,
      discount,
      name,
      img,
      colorIndex,
      color,
    };
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }
    const cart = customer.cart;
    
    // check có phải sp đầu tiên trong giỏ hàng không
    if (customer.cart.length == 0) {
      result = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $push: { cart: newProduct } }, // Thêm sản phẩm vào giỏ hàng (cart)
        { new: true } // Trả về đối tượng đã cập nhật
      );
      return res.status(200).json({
        status: "success",
        data: result.cart.reverse(),
      });
    }

    const isProduct = cart.filter((product) => product.prd_id === prd_id);
    const isSameColor = isProduct.some(
      (product) => product.colorIndex === colorIndex
    );

    if (isProduct.length > 0 && isSameColor) {
      result = await CustomerModel.findOneAndUpdate(
        { _id: customerId, "cart.prd_id": prd_id }, // Tìm sản phẩm trong giỏ hàng
        {
          $inc: { "cart.$.qty": qty }, // Tăng số lượng sản phẩm
        },
        { new: true } // Trả về đối tượng đã cập nhật
      );
    } else {
      result = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $push: { cart: newProduct } }, // Thêm sản phẩm vào giỏ hàng (cart)
        { new: true } // Trả về đối tượng đã cập nhật
      );
    }

    return res.status(200).json({
      status: "success",
      data: result.cart.reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: error,
    });
  }
};
