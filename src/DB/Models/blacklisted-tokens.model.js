import mongoose from "mongoose";

// ==================== Blacklisted Tokens Schema ====================

const blacklistedTokensSchema = new mongoose.Schema(
  {
    tokenID: {
      type: String,
      required: [true, "Token ID is required"],
      unique: true,
    },
    expirationDate: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ==================== Indexes ====================
// blacklistedTokensSchema.index({ tokenID: 1 });     Returns a warning

// TTL index to automatically delete expired tokens from database
// Removes documents after expirationDate has passed
blacklistedTokensSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

// ==================== Create Model ====================
const BlacklistedTokens = mongoose.model(
  "BlacklistedTokens",
  blacklistedTokensSchema
);

export default BlacklistedTokens;
