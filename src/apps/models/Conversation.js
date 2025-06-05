const mongoose = require("../common/database")();

const ConversationSchema = new mongoose.Schema({
  members: {
    type: Array,
    required: true,
  }
},
{
  timestamps: true,
});
const ConversationModel = mongoose.model("Conversation", ConversationSchema, "conversations");
module.exports = ConversationModel;

