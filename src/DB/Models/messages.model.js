import mongoose from "mongoose";

// ==================== Messages Schema ====================
/**
 * Messages model for anonymous messaging (Sarahah App)
 * Each message is sent anonymously to a specific user (receiver)
 * Relationship: Many Messages belong to One User (receiver)
 */
const messagesSchema = new mongoose.Schema(
  {
    // ========== Message Content ==========
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minLength: [1, "Message cannot be empty"],
      maxLength: [500, "Message must be at most 500 characters"],
    },

    // ========== Receiver Reference ==========
    // Foreign key reference to User model (parent)
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ==================== Indexes ====================
messagesSchema.index({ receiverID: 1 });
messagesSchema.index({ receiverID: 1, createdAt: -1 });

// ==================== Create Model ====================
const Messages = mongoose.model("Messages", messagesSchema);

export default Messages;
