import Messages from "../../../DB/Models/messages.model.js";
import User from "../../../DB/Models/users.model.js";

/**
 * Send an anonymous message to a user
 * @route POST /messages/send/:receiverID
 */
export const sendMessage = async (req, res) => {
  try {
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
  } catch (error) {
    // ========== Error Handling ==========

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid receiver ID format",
      });
    }

    // Handle unexpected errors
    console.error("Send Message Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get all messages received by the authenticated user
 * @route GET /messages
 */
export const getMessages = async (req, res) => {
  try {
    // ========== 1. Extract Authenticated User ID ==========
    const { _id: userID } = req.loggedInUser;

    // ========== 2. Find Messages for This User Only ==========
    const messages = await Messages.find({ receiverID: userID })
      .sort({ createdAt: -1 })
      .select("content createdAt");

    // ========== 3. Check if User Has Messages ==========
    if (messages.length === 0) {
      return res.status(200).json({
        message: "No messages found",
        data: [],
      });
    }

    // ========== 4. Send Success Response ==========
    return res.status(200).json({
      message: "Messages retrieved successfully",
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    // ========== Error Handling ==========
    console.error("Get Messages Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
