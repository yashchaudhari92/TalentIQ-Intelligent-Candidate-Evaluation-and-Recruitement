// ⭐ NEW FILE
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

// GET all messages
router.get("/", protect, async (req, res) => {
  const messages = await Message.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
