const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const route = require("../routes/index");
const adminRoute = require("../routes/admin");
const config = require("config");

// config cors
const corsOptions = {
  // origin: "*",
  origin: [
    "http://localhost:3000",
    "https://frontend-alphalink-store.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Truy cập file tĩnh trong express (phục vụ cho views)
app.use("/assets", express.static(`${__dirname}/../public`));

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: config.get("app.session_key"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.get("app.session_secure") },
  })
);

// Nhận dữ liệu từ form thông qua req.body
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// set view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

app.use(require("./middlewares/share"));

// routes
app.use(config.get("app.prefixApiVersion"), route);
// http://localhost:8080/admin/dashboard
app.use("/admin", adminRoute);

module.exports = app;
