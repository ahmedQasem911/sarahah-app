import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/users.model.js";
import { decrypt, encrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Utils/sendEmail.utils.js";
import { customAlphabet } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";
import BlacklistedTokens from "../../../DB/Models/blacklisted-tokens.model.js";

// ==================== OTP Generator ====================
// Create a unique string generator for OTP (5 characters: letters a-h + digits 1-8)
const generateOTP = customAlphabet("abcdefgh12345678", 5);

// ==================== User Services ====================

/**
 * Sign up a new user
 * @route POST /users/signup
 */
export const signUpUser = async (req, res) => {
  try {
    // ========== 1. Extract User Data ==========
    const { firstName, lastName, age, gender, email, password, phoneNumber } =
      req.body;

    // ========== 2. Check User Uniqueness ==========
    // Check if user already exists by email OR by full name (firstName + lastName)
    const existingUser = await User.findOne({
      $or: [{ email }, { firstName, lastName }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists!",
      });
    }

    // ========== 3. Encrypt Phone Number ==========
    // Encrypt phone number using AES-256-CBC for security
    const encryptedPhoneNumber = encrypt(phoneNumber);

    // ========== 4. Hash Password ==========
    // Hash password with bcrypt (10 salt rounds for security)
    const hashedPassword = hashSync(password, 10);

    // ========== 5. Generate OTP ==========
    // Generate a 5-character OTP for email confirmation
    const otp = generateOTP();

    // ========== 6. Create New User ==========
    const newUser = await User.create({
      firstName,
      lastName,
      age,
      gender,
      email,
      password: hashedPassword,
      phoneNumber: encryptedPhoneNumber,
      otps: { confirmation: hashSync(otp, 10) }, // Store hashed OTP
    });

    // ========== 7. Send Confirmation Email ==========
    // Emit event to send email asynchronously (non-blocking)
    emitter.emit("sendingEmail", {
      receiverEmail: email,
      emailSubject: "Welcome to Sarahah App - Confirm Your Account",
      emailContent: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
        <!-- Logo -->
        <div style="margin-bottom: 20px;">
          <img src="cid:appLogo" alt="Company Logo" style="max-width: 150px;" />
        </div>

        <h2 style="color: #0a66c2;">Welcome to Our Platform!</h2>
        <p style="font-size: 16px; color: #333;">Thank you for signing up. Use the OTP below to confirm your email:</p>

        <!-- OTP Code -->
        <div style="margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #0a66c2;">${otp}</div>

        <p style="margin-top: 20px; font-size: 14px; color: #555;">If you did not request this, please ignore this email.</p>
      </div>
      `,
      emailAttachments: [
        {
          filename: "logo.png",
          path: "logo.png",
          cid: "appLogo", // Content ID for embedding in email
        },
      ],
    });

    // ========== 8. Prepare Response Data ==========
    // Decrypt phone number for response
    const decryptedPhoneNumber = newUser.phoneNumber
      ? decrypt(newUser.phoneNumber)
      : null;

    // ========== 9. Send Success Response ==========
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        phoneNumber: decryptedPhoneNumber,
        isConfirmed: newUser.isConfirmed,
      },
    });
  } catch (error) {
    // ========== Error Handling ==========

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle unexpected errors
    console.error("SignUp Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Confirm user email via OTP verification
 * @route PUT /users/confirm-otp
 */
export const confirmEmail = async (req, res) => {
  try {
    // ========== 1. Extract OTP Data ==========
    const { email, otp } = req.body;

    // ========== 2. Find Unconfirmed User ==========
    // Find user by email first
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if already confirmed
    if (user.isConfirmed) {
      return res.status(400).json({
        message: "Email already confirmed. Please sign in.",
      });
    }

    // ========== 3. Verify OTP ==========
    // Compare provided OTP with hashed OTP stored in database
    const isOtpMatched = compareSync(otp, user.otps?.confirmation);

    if (!isOtpMatched) {
      return res.status(401).json({
        message: "Invalid OTP!",
      });
    }

    // ========== 4. Update User Confirmation Status ==========
    // Mark user as confirmed and remove OTP (no longer needed)
    user.isConfirmed = true;
    user.otps.confirmation = undefined;

    // Save changes to database
    await user.save();

    // ========== 5. Prepare Response Data ==========
    // Decrypt phone number for response
    const decryptedPhoneNumber = user.phoneNumber
      ? decrypt(user.phoneNumber)
      : null;

    // ========== 6. Send Success Response ==========
    return res.status(200).json({
      message: "Email confirmed successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phoneNumber: decryptedPhoneNumber,
        isConfirmed: user.isConfirmed,
      },
    });
  } catch (error) {
    // ========== Error Handling ==========
    console.error("Confirm Email Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Sign in an existing user
 * @route POST /users/signin
 */
export const signInUser = async (req, res) => {
  try {
    // ========== 1. Extract Credentials ==========
    const { email, password } = req.body;

    // ========== 2. Validate Required Fields ==========
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // ========== 3. Find User by Email ==========
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ========== 4. Verify Password ==========
    const isPasswordMatched = compareSync(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ========== 5. Generate JWT Access Token ==========
    const accessToken = generateToken(
      {
        _id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_ACCESS_KEY,
      {
        issuer: "AQ",
        audience: "Sarahah App Audience",
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        jwtid: uuidv4(),
      }
    );

    // ========== 6. Prepare Response Data ==========
    const decryptedPhoneNumber = user.phoneNumber
      ? decrypt(user.phoneNumber)
      : null;

    // ========== 7. Send Success Response ==========
    return res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phoneNumber: decryptedPhoneNumber,
        isConfirmed: user.isConfirmed,
      },
      accessToken,
    });
  } catch (error) {
    // ========== Error Handling ==========
    console.error("Sign In Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update authenticated user's data
 * @route PUT /users/update
 */
export const updateUser = async (req, res) => {
  try {
    // ========== 1. Extract User Data from Authenticated User ==========
    // Get user data from authenticated user (already verified by middleware)
    const { _id: userID } = req.loggedInUser;
    const existingUser = req.loggedInUser;

    // ========== 2. Extract Update Data ==========
    const { firstName, lastName, age, gender, email, phoneNumber } = req.body;

    // ========== 3. Validate Email Uniqueness ==========
    // If email is being updated, check if the new email already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    // ========== 4. Validate Full Name Uniqueness ==========
    // If firstName or lastName is being updated, check for duplicate full name
    if (firstName || lastName) {
      const firstNameToCheck = firstName || existingUser.firstName;
      const lastNameToCheck = lastName || existingUser.lastName;

      const fullNameExists = await User.findOne({
        firstName: firstNameToCheck,
        lastName: lastNameToCheck,
        _id: { $ne: userID }, // Exclude current user from check
      });

      if (fullNameExists) {
        return res.status(409).json({
          message: "User with this full name already exists",
        });
      }
    }

    // ========== 5. Handle Phone Number Encryption ==========
    let encryptedPhoneNumber;

    if (phoneNumber) {
      // Decrypt existing phone number to compare with new one
      const existingPhoneDecrypted = existingUser.phoneNumber
        ? decrypt(existingUser.phoneNumber)
        : null;

      // Only re-encrypt if phone number is different (avoid unnecessary encryption)
      if (phoneNumber !== existingPhoneDecrypted) {
        encryptedPhoneNumber = encrypt(phoneNumber);
      } else {
        // Same phone number, keep existing encrypted value
        encryptedPhoneNumber = existingUser.phoneNumber;
      }
    }

    // ========== 6. Prepare Update Data ==========
    // Only include fields that are being updated (conditional spreading)
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(email && { email }),
      ...(encryptedPhoneNumber && { phoneNumber: encryptedPhoneNumber }),
    };

    // ========== 7. Update User in Database ==========
    const updatedUser = await User.findByIdAndUpdate(userID, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run schema validators on update
    });

    // ========== 8. Prepare Response Data ==========
    // Decrypt phone number for response
    const decryptedPhoneNumber = updatedUser.phoneNumber
      ? decrypt(updatedUser.phoneNumber)
      : null;

    // ========== 9. Send Success Response ==========
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        phoneNumber: decryptedPhoneNumber,
        isConfirmed: updatedUser.isConfirmed,
      },
    });
  } catch (error) {
    // ========== Error Handling ==========

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle unexpected errors
    console.error("Update User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete authenticated user's account
 * @route DELETE /users/delete
 */
export const deleteUser = async (req, res) => {
  try {
    // ========== 1. Extract User ID from Authenticated User ==========
    const { _id: userID } = req.loggedInUser;

    // ========== 2. Delete User ==========
    await User.findByIdAndDelete(userID);

    // ========== 3. Send Success Response ==========
    return res.status(200).json({
      message: "User account deleted successfully",
      deletedUser: {
        id: req.loggedInUser._id,
        email: req.loggedInUser.email,
        fullName: `${req.loggedInUser.firstName} ${req.loggedInUser.lastName}`,
      },
    });
  } catch (error) {
    // ========== Error Handling ==========
    console.error("Delete User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Sign out user and blacklist their access token
 * @route POST /users/signout
 */
export const signOutUser = async (req, res) => {
  try {
    // ========== 1. Extract Token Data ==========
    const { accesstoken } = req.headers;

    // Decode token to get expiration and JWT ID
    const decodedUserData = verifyToken(
      accesstoken,
      process.env.JWT_SECRET_ACCESS_KEY
    );

    // ========== 2. Prepare Token Expiration Date ==========
    // Convert Unix timestamp (seconds) to JavaScript Date object
    const expirationDate = new Date(decodedUserData.exp * 1000);

    // ========== 3. Blacklist Token ==========
    // Add token to blacklist to prevent reuse after sign out
    await BlacklistedTokens.create({
      tokenID: decodedUserData.jti,
      expirationDate,
    });

    // ========== 4. Send Success Response ==========
    return res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    // ========== Error Handling ==========

    // Handle duplicate token blacklist
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Token has already been revoked",
      });
    }

    // Handle unexpected errors
    console.error("Sign Out Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
