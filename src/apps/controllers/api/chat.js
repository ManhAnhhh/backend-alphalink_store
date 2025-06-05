const ConversationModel = require("../../models/Conversation");
const CustomerModel = require("../../models/Customer");
const MessageModel = require("../../models/Message");
const conversation = async (req, res) => {
  try {
    const { senderId, receiverId} = req.body;
    const newConversation = new ConversationModel({members: [senderId, receiverId]});
    await newConversation.save();
    res.status(200).json({
      status: "success",
      data: newConversation,
    });
  }catch (error){
    console.log(error);
  }
};

const getConversationById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await ConversationModel.find({ members: { $in: [userId] } });

    // Dùng Promise.all để đợi tất cả các truy vấn dữ liệu người dùng
    const conversationsWithUserData = await Promise.all(conversations.map(async (conversation) => {
      const receiverId = conversation.members.find((member) => member != userId);
      const user = await CustomerModel.findById(receiverId);
      return {
        conversation,
        user,
      };
    }));

    res.status(200).json(conversationsWithUserData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const message = async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId = '' } = req.body;
    if (!senderId || !message) {
      return res.status(400).send("Thiếu thông tin cần thiết");
    }
    // Kiểm tra xem conversationId có tồn tại không
    if (!conversationId && receiverId) {
      const newConversation = new ConversationModel({ members: [senderId] });
      await newConversation.save();
      const newMessage = new MessageModel({ conversationId: newConversation._id, senderId, message }); 
      await newMessage.save();
      return res.status(200).send("successfully");
    } else if (!conversationId && !receiverId) {
      return res.status(400).send("Thiếu conversationId");
    }
    
    const newMessage = new MessageModel({ conversationId, senderId, message });
    await newMessage.save();

    res.status(200).json({
      status: "success",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Lỗi máy chủ");
  }
};

const getMessageByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(200).json([]);
    }
    const messages = await MessageModel.find({ conversationId });
    
    // Dùng Promise.all để đợi tất cả các truy vấn dữ liệu người dùng
    const messagesWithUserData = await Promise.all(messages.map(async (message) => {
      const user = await CustomerModel.findById(message.senderId);
      return {
        ...message.toObject(), // Chuyển đổi message sang đối tượng thuần để dễ dàng thao tác
        user: user ? { _id: user._id, fullName: user.fullName, email: user.email } : null
      };
    }));

    res.status(200).json(messagesWithUserData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Lỗi máy chủ");
  }
};  

module.exports = {
  conversation,
  getConversationById,
  message,
  getMessageByConversationId
};