const CustomerModel = require("../../models/Customer");
const ProductModel = require("../../models/Product");
const _ = require("lodash");
exports.deleteProductInCart = async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    const { colorIndex } = req.body;
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
    const isProduct = customer.cart.some(
      (product) =>
        product.prd_id === productId && product.colorIndex == colorIndex
    );
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
      status: "success",
      message: "Product removed from cart successfully",
      data: result.cart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
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
    if (cart.length == 0) {
      result = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $push: { cart: newProduct } }, // Thêm sản phẩm vào giỏ hàng (cart)
        { new: true } // Trả về đối tượng đã cập nhật
      );
      return res.status(200).json({
        status: "success",
        message: "create cart successfully",
        data: result.cart,
      });
    }
    const isProduct = cart.some(
      (product) =>
        product.prd_id === prd_id && product.colorIndex === colorIndex
    );
    if (isProduct) {
      result = await CustomerModel.findOneAndUpdate(
        {
          _id: customerId, // ID của khách hàng
          cart: {
            $elemMatch: { prd_id: prd_id, colorIndex: colorIndex },
          },
        }, // Tìm sản phẩm trong giỏ hàng
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
      message: "add to cart successfully",
      data: result.cart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.addManyItemsToCart = async (req, res) => {
  try {
    let { items } = req.body;
    let result;
    const { customerId } = req.params;
    const customer = await CustomerModel.findById(customerId);
    const products = await ProductModel.find();

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    items = items.map((item) => {
      const product = _.find(
        products,
        (prd) => prd._id.toString() === item.prd_id.toString()
      );

      const colorIndex = product.color.findIndex(
        (e) => e.toLowerCase() === item.color.toLowerCase()
      );

      return {
        prd_id: item.prd_id,
        qty: item.qty,
        price: product.price,
        discount: product.discount,
        name: product.name,
        img: product.img,
        colorIndex,
        color: product.color,
      };
    });

    const cart = customer.cart;

    // check có phải sp đầu tiên trong giỏ hàng không
    if (cart.length == 0) {
      result = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $push: { cart: items } }, // Thêm các sản phẩm vào giỏ hàng
        { new: true } // Trả về đối tượng đã cập nhật
      );
      return res.status(200).json({
        status: "success",
        message: "repuchase items successfully",
        data: result.cart,
      });
    }

    for (const element of items) {
      const isProduct = cart.some(
        (product) =>
          product.prd_id === element.prd_id &&
          product.colorIndex === element.colorIndex
      );
      if (isProduct) {
        await CustomerModel.findOneAndUpdate(
          {
            _id: customerId, // ID của khách hàng
            cart: {
              $elemMatch: {
                prd_id: element.prd_id,
                colorIndex: element.colorIndex,
              },
            },
          }, // Tìm sản phẩm trong giỏ hàng
          {
            $inc: { "cart.$.qty": element.qty }, // Tăng số lượng sản phẩm
          }
        );
      } else {
        await CustomerModel.findByIdAndUpdate(
          customerId,
          { $push: { cart: element } } // Thêm sản phẩm vào giỏ hàng (cart)
        );
      }
    }
    result = await CustomerModel.findById(customerId);

    return res.status(200).json({
      data: result.cart,
      message: "successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      err: err.message || err,
    });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const { customerId } = req.params;
    if (!cart) {
      return res.status(400).json({
        status: "error",
        message: "Cart is required",
      });
    }
    const result = await CustomerModel.findByIdAndUpdate(
      customerId,
      { cart }, // Cập nhật field 'cart'
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "update cart successfully",
      data: result.cart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.deleteManyProductInCart = async (req, res) => {
  try {
    const data = req.body;
    const { customerId } = req.params;
    const result = await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        $pull: {
          cart: {
            $or: data.map((item) => ({
              prd_id: item.prd_id,
              colorIndex: item.colorIndex,
            })),
          },
        },
      },
      // xóa xong tạo ra 1 đối tượng mới được update
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "delete items in cart successfully",
      data: result.cart,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};
