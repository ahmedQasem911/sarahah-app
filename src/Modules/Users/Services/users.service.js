import User from "../../../DB/Models/users.model.js";

/**
 * Sign up a new user
 * @route POST /users/signup
 */

export const signUpUser = async (req, res) => {
  try {
    // 1. Extract user data from request body
    const { firstName, lastName, age, gender, email, password } = req.body;

    // 2. Check if user already exists (by email or full name)
    const isUserExist = await User.findOne({
      $or: [{ email }, { firstName, lastName }],
    });

    if (isUserExist) {
      return res.status(409).json({
        message: "User already exists!",
      });
    }

    // 3. Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      age,
      gender,
      email,
      password,
    });

    // 4. Send success response
    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
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

/**
 * Update user data
 * @route PUT /users/update/:userId
 */

export const updateUser = async (req, res) => {
  try {
    // 1. Extract user ID from params
    const { userId } = req.params;

    // 2. Extract update data from request body
    const { firstName, lastName, age, gender, email } = req.body;

    // 3. Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. If email is being updated, check if new email already exists
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

    // 6. Update user data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, age, gender, email },
      { new: true, runValidators: true }
    );

    // 7. Send success response
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
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

/**
 * Delete user from database
 * @route DELETE /users/delete/:userId
 */

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
