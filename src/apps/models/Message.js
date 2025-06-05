const mongoose = require("../common/database")();

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
  },
  senderId: {
    type: String,
  },
  message: {
    type: String,
  }
},{timestamps: true});
const MessageModel = mongoose.model("Messages", MessageSchema, "messages");
module.exports = MessageModel;
