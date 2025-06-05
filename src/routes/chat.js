const express = require("express");
const router = express.Router();
const ChatController = require("../apps/controllers/api/chat");

router.post("/conversation", ChatController.conversation);
router.get("/conversation/:userId", ChatController.getConversationById);
router.post("/message", ChatController.message);
router.get("/message/:conversationId", ChatController.getMessageByConversationId);

module.exports = router;
