import crypto from "node:crypto";

const ENCRYPTION_SECRET_KEY = Buffer.from(
  process.env.ENCRYPTION_SECRET_KEY || "yxLw6rNVEAkyKvuFhl5iolrmNs0aWgRY"
);
const IV_LENGTH = 16;

export const encrypt = (text) => {
  try {
    // 1. Validate input
    if (!text) {
      throw new Error("Text to encrypt cannot be empty");
    }

    if (typeof text !== "string") {
      throw new Error("Text to encrypt must be a string");
    }

    if (text.trim().length === 0) {
      throw new Error("Text to encrypt cannot be only whitespace");
    }

    // 2. Create random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // 3. Create cipher
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      ENCRYPTION_SECRET_KEY,
      iv
    );

    // 4. Encrypt the text (complete blocks)
    let encryptedText = cipher.update(text, "utf-8", "hex");

    // 5. Finalize encryption (adds padding for last incomplete block)
    encryptedText += cipher.final("hex");

    // 6. Return IV + encrypted text
    return `${iv.toString("hex")}:${encryptedText}`;
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw new Error("Failed to encrypt data");
  }
};

export const decrypt = (text) => {
  try {
    // Validate input
    if (!text || typeof text !== "string") {
      throw new Error("Invalid encrypted text");
    }

    const parts = text.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted text format");
    }

    const [iv, encryptedText] = parts;
    const binaryLikeIV = Buffer.from(iv, "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_SECRET_KEY,
      binaryLikeIV
    );

    let decryptedText = decipher.update(encryptedText, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");

    return decryptedText;
  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Failed to decrypt data");
  }
};
