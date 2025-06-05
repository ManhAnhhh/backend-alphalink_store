const CustomerModel = require("../../models/Customer");
const getLogin = (req, res) => {
  res.render("admin/auth/login", { data: {} });
};

const postLogin = async (req, res) => {
  // res.redirect("/admin/dashboard");
  const { email, password } = req.body;
  const user = await CustomerModel.find({ email, password, role: "admin" });
  if (user.length > 0) {
    req.session.fullName = user[0].fullName;
    req.session.email = email;
    req.session.password = password;
    req.session.userId = user[0]._id.toString();
    // console.log(req.session);
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/auth/login", { data: { error: "Tài khoản hoặc mật khẩu không đúng!!" } });
  }

};

const getRegister = (req, res) => {
  res.render("admin/auth/register", {
    title: "Login",
    layout: "admin/layouts/auth",
  });
};

const postRegister = (req, res) => {
  res.redirect("/admin/login");
};

const logout = (req, res) => {
  res.redirect("/admin/login");
  // res.render("admin/auth/login", { data: {} });
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
};
