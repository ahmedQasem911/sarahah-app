import Messages from "../../../DB/Models/messages.model.js";
import User from "../../../DB/Models/users.model.js";

/**
 * Send an anonymous message to a user
 * @route POST /messages/send/:receiverID
 */
export const sendMessage = async (req, res) => {
  // ========== 1. Extract Data ==========
  const { content } = req.body;
  const { receiverID } = req.params;

  // ========== 2. Validate Required Fields ==========
  if (!content) {
    return res.status(400).json({
      message: "Message content is required",
    });
  }

  // Validate content is not just whitespace
  if (content.trim().length === 0) {
    return res.status(400).json({
      message: "Message content cannot be empty",
    });
  }

  // ========== 3. Validate Receiver Exists ==========
  // Find receiver in the database
  const receiver = await User.findById(receiverID);

  if (!receiver) {
    return res.status(404).json({
      message: "Receiver not found",
    });
  }

  // ========== Rate Limiting ==========
  const recentMessages = await Messages.countDocuments({
    receiverID,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
  });

  if (recentMessages >= 10) {
    // Max 10 messages per hour to same user
    return res.status(429).json({
      message: "Too many messages sent. Please try again later.",
    });
  }

  // ========== 4. Create New Message ==========
  const newMessage = await Messages.create({
    content: content.trim(), // Trim whitespace
    receiverID,
  });

  // ========== 5. Send Success Response ==========
  return res.status(201).json({
    message: "Message sent successfully",
    data: {
      id: newMessage._id,
      content: newMessage.content,
      receiverID: newMessage.receiverID,
      createdAt: newMessage.createdAt,
    },
  });
};

/**
 * Get paginated messages received by the authenticated user
 * @route GET /messages?page=1&limit=20
 */
export const getMessages = async (req, res) => {
  // ========== 1. Extract Authenticated User ID ==========
  const { _id: userID } = req.loggedInUser;

  // ========== 2. Extract Pagination Parameters ==========
  const page = parseInt(req.query.page) || 1; // Default: page 1
  const limit = parseInt(req.query.limit) || 20; // Default: 20 messages per page
  const skip = (page - 1) * limit;

  // ========== 3. Find Messages with Pagination ==========
  const messages = await Messages.find({ receiverID: userID })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("content createdAt");

  // ========== 4. Get Total Count for Pagination ==========
  const totalMessages = await Messages.countDocuments({ receiverID: userID });
  const totalPages = Math.ceil(totalMessages / limit);

  // ========== 5. Send Success Response ==========
  return res.status(200).json({
    message: "Messages retrieved successfully",
    data: messages,
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages,
      messagesPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};
