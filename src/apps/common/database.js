const mongoose = require("mongoose");
const config = require("config");
mongoose.set("strictQuery", false);

module.exports = () => {
  try {
    mongoose.connect(config.get("db.connection_string_db"));
    console.log("Connected to database");
    return mongoose;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
