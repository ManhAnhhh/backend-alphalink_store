const index = async (req, res) => {
  res.render("admin/messages/messages.ejs", { currentUrl: req.originalUrl });
};

module.exports = {
  index,
};
