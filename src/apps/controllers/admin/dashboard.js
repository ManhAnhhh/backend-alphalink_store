const index = (req, res) => {
  res.render('admin/dashboard', {
    title: 'Login',
    layout: 'admin/layouts/auth',
  });
}

module.exports = {
  index
};