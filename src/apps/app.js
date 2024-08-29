const express = require('express')
const app = express()
const cors = require('cors')
const route = require("../routes/index");
const config = require('config');

// config cors
const corsOptions = {
  // origin: "*",
  origin: "http://localhost:3000",
  credentials: true, 
};
app.use(cors(corsOptions));

// Truy cập file tĩnh trong express (phục vụ cho views)
app.use("/assets", express.static(`${__dirname}/../public`));

// Nhận dữ liệu từ form thông qua req.body
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// set view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

// routes
app.use(config.get("app.prefixApiVersion"), route)

module.exports = app;