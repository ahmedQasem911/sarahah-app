import crypto from "node:crypto";

// ==================== Configuration ====================
// Encryption key for AES-256-CBC (32 bytes = 256 bits)
const ENCRYPTION_SECRET_KEY = Buffer.from(
  process.env.ENCRYPTION_SECRET_KEY || "yxLw6rNVEAkyKvuFhl5iolrmNs0aWgRY"
);

// Initialization Vector length (16 bytes for AES-256-CBC)
const IV_LENGTH = 16;

// ==================== Encryption Functions ====================

/**
 * Encrypt sensitive text using AES-256-CBC encryption
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format "iv:encryptedData"
 * @throws {Error} - If encryption fails or input is invalid
 */
export const encrypt = (text) => {
  try {
    // ========== 1. Validate Input ==========
    if (!text) {
      throw new Error("Text to encrypt cannot be empty");
    }

    if (typeof text !== "string") {
      throw new Error("Text to encrypt must be a string");
    }

    if (text.trim().length === 0) {
      throw new Error("Text to encrypt cannot be only whitespace");
    }

    // ========== 2. Generate Random IV ==========
    // Create a random initialization vector for each encryption (security best practice)
    const iv = crypto.randomBytes(IV_LENGTH);

    // ========== 3. Create Cipher ==========
    // Initialize AES-256-CBC cipher with secret key and IV
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      ENCRYPTION_SECRET_KEY,
      iv
    );

    // ========== 4. Encrypt Text ==========
    // Process complete blocks of data
    let encryptedText = cipher.update(text, "utf-8", "hex");

    // ========== 5. Finalize Encryption ==========
    // Add padding for last incomplete block and complete encryption
    encryptedText += cipher.final("hex");

    // ========== 6. Return Combined Result ==========
    // Return IV and encrypted text separated by colon (IV needed for decryption)
    return `${iv.toString("hex")}:${encryptedText}`;
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt encrypted text using AES-256-CBC decryption
 * @param {string} text - Encrypted text in format "iv:encryptedData"
 * @returns {string} - Decrypted plain text
 * @throws {Error} - If decryption fails or input format is invalid
 */
export const decrypt = (text) => {
  try {
    // ========== 1. Validate Input ==========
    if (!text || typeof text !== "string") {
      throw new Error("Invalid encrypted text");
    }

    // ========== 2. Parse Encrypted Text ==========
    // Split the text into IV and encrypted data
    const parts = text.split(":");

    if (parts.length !== 2) {
      throw new Error("Invalid encrypted text format");
    }

    // ========== 3. Extract IV and Encrypted Data ==========
    const [iv, encryptedText] = parts;

    // Convert IV from hex string back to binary buffer
    const ivBuffer = Buffer.from(iv, "hex");

    // ========== 4. Create Decipher ==========
    // Initialize AES-256-CBC decipher with secret key and IV
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_SECRET_KEY,
      ivBuffer
    );

    // ========== 5. Decrypt Text ==========
    // Process encrypted data and convert back to UTF-8
    let decryptedText = decipher.update(encryptedText, "hex", "utf-8");

    // ========== 6. Finalize Decryption ==========
    // Remove padding and complete decryption
    decryptedText += decipher.final("utf-8");

    return decryptedText;
  } catch (error) {
    console.error("Decryption Error:", error.message);
    throw new Error("Failed to decrypt data");
  }
};
