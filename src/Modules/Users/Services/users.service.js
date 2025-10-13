import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/users.model.js";
import { decrypt, encrypt } from "../../../Utils/encryption.utils.js";

export const signUpUser = async (req, res) => {
  try {
    // 1. Extract user data from request body
    const { firstName, lastName, age, gender, email, password, phoneNumber } =
      req.body;

    // 2. Check if user already exists (by email or full name)
    const isUserExist = await User.findOne({
      $or: [{ email }, { firstName, lastName }],
    });

    if (isUserExist) {
      return res.status(409).json({
        message: "User already exists!",
      });
    }

    // Encrypt phone number
    let encryptedPhoneNumber;
    try {
      encryptedPhoneNumber = encrypt(phoneNumber);
    } catch (encryptError) {
      return res.status(400).json({
        message: "Invalid phone number format",
      });
    }

    // Hash password
    const hashedPassword = hashSync(password, 10);

    // 3. Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      age,
      gender,
      email,
      password: hashedPassword,
      phoneNumber: encryptedPhoneNumber,
    });

    // 4. Decrypt phone number for response
    let phoneNumberForResponse = null;
    if (newUser.phoneNumber) {
      try {
        phoneNumberForResponse = decrypt(newUser.phoneNumber);
      } catch (decryptError) {
        console.error("Failed to decrypt phone for response:", decryptError);
        phoneNumberForResponse = null;
      }
    }

    // 5. Send success response
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        phoneNumber: phoneNumberForResponse,
      },
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Handle validation errors
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

export const signInUser = async (req, res) => {
  try {
    // 1. Extract credentials from request body
    const { email, password } = req.body;

    // 2. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 3. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Compare passwords
    const isPasswordMatched = compareSync(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5. Send success response with user data
    return res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phoneNumber: user.phoneNumber ? decrypt(user.phoneNumber) : null,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Sign In Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // 1. Extract user ID from params
    const { userId } = req.params;

    // 2. Extract update data from request body
    const { firstName, lastName, age, gender, email, phoneNumber } = req.body;

    // 3. Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. If email is being updated, check if the new email already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    // 5. If firstName or lastName is being updated, check for duplicate full name
    if (firstName || lastName) {
      const firstNameToCheck = firstName || existingUser.firstName;
      const lastNameToCheck = lastName || existingUser.lastName;

      const fullNameExists = await User.findOne({
        firstName: firstNameToCheck,
        lastName: lastNameToCheck,
        _id: { $ne: userId }, // Exclude current user
      });

      if (fullNameExists) {
        return res.status(409).json({
          message: "User with this full name already exists",
        });
      }
    }

    // 6. Handle phone number encryption if being updated
    let encryptedPhoneNumber;
    if (phoneNumber) {
      // Decrypt existing phone number to compare
      let existingPhoneDecrypted;
      try {
        existingPhoneDecrypted = existingUser.phoneNumber
          ? decrypt(existingUser.phoneNumber)
          : null;
      } catch (decryptError) {
        console.error("Failed to decrypt existing phone:", decryptError);
        existingPhoneDecrypted = null;
      }

      // Only encrypt if phone number is different
      if (phoneNumber !== existingPhoneDecrypted) {
        try {
          encryptedPhoneNumber = encrypt(phoneNumber);
        } catch (encryptError) {
          return res.status(400).json({
            message: "Invalid phone number format",
            error: encryptError.message,
          });
        }
      } else {
        // Same phone number, keep existing encrypted value
        encryptedPhoneNumber = existingUser.phoneNumber;
      }
    }

    // 7. Prepare update data
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(email && { email }),
      ...(encryptedPhoneNumber && { phoneNumber: encryptedPhoneNumber }),
    };

    // 8. Update user data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    // 9. Decrypt phone number for response
    let phoneNumberForResponse = null;
    if (updatedUser.phoneNumber) {
      try {
        phoneNumberForResponse = decrypt(updatedUser.phoneNumber);
      } catch (decryptError) {
        console.error("Failed to decrypt phone for response:", decryptError);
        phoneNumberForResponse = null;
      }
    }

    // 10. Send success response
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        phoneNumber: phoneNumberForResponse,
      },
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate value detected",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle invalid ObjectId error
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID format",
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

export const deleteUser = async (req, res) => {
  try {
    // 1. Extract user ID from params
    const { userId } = req.params;

    // 2. Check if user exists before deletion
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Delete the user
    await User.findByIdAndDelete(userId);

    // 4. Send success response
    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete._id,
        email: userToDelete.email,
        fullName: `${userToDelete.firstName} ${userToDelete.lastName}`,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId error
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // Handle unexpected errors
    console.error("Delete User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
