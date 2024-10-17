const CustomerModel = require("../../models/Customer");
const fs = require("fs");
const config = require("config");
const path = require("path");
exports.getCustomers = async (req, res) => {
  const total = await CustomerModel.find().countDocuments();

  const page = req.query.page || 1;
  const limit = req.query.limit || total;
  const skip = page * limit - limit;

  const customers = await CustomerModel.find().skip(skip).limit(limit);
  return res.status(200).json({
    status: "success",
    totalCustomers: total,
    totalPages: Math.ceil(total / limit),
    filters: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
    data: customers,
  });
};

exports.getCustomerByID = async (req, res) => {
  try {
    const id = req.params.customerId;
    const customer = await CustomerModel.findById(id);
    if (!customer)
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    return res.status(200).json({
      status: "success",
      data: customer,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const id = req.params.customerId;
    const { fullName, email, phone, address, sex, birthDay } = req.body;
    const thumbnail = req.file;
    const currentCustomer = await CustomerModel.findById(id);
    const customers = await CustomerModel.find();
    let picture = currentCustomer.picture;
    const isEmailExist = customers.some(
      (customer) => customer.email === email && customer._id != id
    );
    const isPhoneExist = customers.some(
      (customer) => customer.phone === phone && customer._id != id
    );

    if (email != currentCustomer.email && isEmailExist)
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    if (phone != currentCustomer.phone && isPhoneExist)
      return res.status(400).json({
        status: "error",
        message: "Phone already exists",
      });

    
    // xử lý ảnh
    if (thumbnail) {
      // xóa ảnh cũ đi để dọn database
      if (!["default.jpg", "linhh.jpg"].includes(picture))
        fs.unlinkSync(
          path.join(
            config.get("app.static_folder"),
            `uploads/customers/${picture}`
          )
        );

      picture = thumbnail.filename;
    }
    const updateCustomer = await CustomerModel.findByIdAndUpdate(
      id,
      { $set: { fullName, email, phone, address, sex, birthDay, picture } },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      data: updateCustomer,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const customer = await CustomerModel.findOne({ email });
    if (customer)
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });

    const isPhoneExist = await CustomerModel.findOne({ phone });
    if (isPhoneExist)
      return res.status(400).json({
        status: "error",
        message: "Phone already exists",
      });

    await new CustomerModel({
      fullName,
      email,
      phone,
      password,
    }).save();

    return res.status(201).json({
      status: "success",
      message: "Registered successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      return res.status(401).json({
        status: "error",
        message: "Email incorrect",
      });
    }
    if (customer.password !== password) {
      return res.status(401).json({
        status: "error",
        message: "Password incorrect",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        cart: customer.cart,
        heart: customer.heart,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
      data: err.message || err,
    });
  }
};
