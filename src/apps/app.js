const express = require('express')
const app = express()

// Truy cập file tĩnh trong express (phục vụ cho views)
app.use("/assets", express.static(`${__dirname}/../public`));

// set view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

app.get('/', function (req, res) {
  res.render("home")
})

module.exports = app;