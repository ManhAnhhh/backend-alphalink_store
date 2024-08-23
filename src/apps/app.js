const express = require('express')
const app = express()
const route = require("../routes/index");
const config = require('config');

// Truy cập file tĩnh trong express (phục vụ cho views)
app.use("/assets", express.static(`${__dirname}/../public`));

// set view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

// routes
app.use(config.get("app.prefixApiVersion"), route)

module.exports = app;