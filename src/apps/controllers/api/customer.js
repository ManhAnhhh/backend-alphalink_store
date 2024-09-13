const CustomerModel = require("../../models/Customer");
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
