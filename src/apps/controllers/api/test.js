exports.test = (req, res) => {
  res.render("form");
}
exports.postTest = (req, res) => {
  return res.json(req.body);
}