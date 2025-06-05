const ConversationModel = require("../../models/Conversation");
const CustomerModel = require("../../models/Customer");
const MessageModel = require("../../models/Message");

const getConversationsWithUserData = async (userId) => {
  const conversations = await ConversationModel.find({
    members: { $in: [userId] },
  }).sort({ updatedAt: -1 });

  const conversationsWithUserData = await Promise.all(
    conversations.map(async (conversation) => {
      const receiverId = conversation.members.find(
        (member) => member.toString() !== userId
      );
      const user = await CustomerModel.findById(receiverId);
      return {
        conversation,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          picture: user.picture,
        },
      };
    })
  );

  return conversationsWithUserData;
};

// Hàm phụ dùng để render giao diện chi tiết tin nhắn
const renderConversationDetailPage = async (req, res, conversationId) => {
  const userId = req.session.userId;
  const conversations = await getConversationsWithUserData(userId);

  const conversation = conversations.find(
    (conv) => conv.conversation._id.toString() === conversationId
  );

  const messages = await MessageModel.find({ conversationId });

  res.render("admin/messages/message-detail.ejs", {
    currentUrl: req.originalUrl,
    conversations,
    conversation,
    messages,
  });
};

const index = async (req, res) => {
  const userId = req.session.userId;
  const conversations = await getConversationsWithUserData(userId);

  if (conversations.length === 0) {
    return res.render("admin/messages/message-detail.ejs", {
      currentUrl: req.originalUrl,
      conversations: [],
      conversation: {},
      messages: [],
    });
  }

  const selectedConversation = await MessageModel.find({
    conversationId: conversations[0]?.conversation?._id,
  });
  res.render("admin/messages/message-detail.ejs", {
    currentUrl: req.originalUrl,
    conversations: conversations,
    conversation: conversations[0] || {},
    messages: selectedConversation,
  });
};

// Lấy chi tiết tin nhắn theo cuộc trò chuyện
const getConversationById = async (req, res) => {
  const { conversationId } = req.params;
  await renderConversationDetailPage(req, res, conversationId);
};

const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { message:content } = req.body;
  const userId = req.session.userId;

  if (!conversationId || !content) {
    return res.status(400).json({ error: "Missing conversationId or content" });
  }

  const message = new MessageModel({
    conversationId,
    senderId: userId,
    message: content,
  });

  await message.save();
  // Cập nhật thời gian cập nhật của cuộc trò chuyện
  await ConversationModel.findByIdAndUpdate(
    conversationId,
    { updatedAt: new Date() }
  );
  // Sau khi gửi, render lại giao diện chi tiết
  // await renderConversationDetailPage(req, res, conversationId);
  res.json({ success: true });
};

module.exports = {
  index,
  getConversationById,
  sendMessage,
};
