import User from "../../../DB/Models/users.model.js";

export const signUpUser = async (req, res) => {
  try {
    const { firstName, lastName, age, gender, email, password } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      age,
      gender,
      email,
      password,
    });
    return res
      .status(201)
      .json({ message: "User created successfully.", user });
  } catch (error) {
    // Handle duplicate email (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists!" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error!", error: error.message });
    }

    return res
      .status(500)
      .json({ message: "Internal server error!", error: error.message });
  }
};
