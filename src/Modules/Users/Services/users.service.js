import User from "../../../DB/Models/users.model.js";

export const signUpUser = async (req, res) => {
  try {
    const { firstName, lastName, age, gender, email, password } = req.body;
    // 1) Find if the user is already exist (Email or FullName)
    const isUserExist = await User.findOne({
      $or: [{ email }, { firstName, lastName }],
    });
    if (isUserExist) {
      return res.status(409).json({ message: "User is already exist!" });
    }
    // 2) Create the user as it is not exist
    // A) Using create()
    const user = await User.create({
      firstName,
      lastName,
      age,
      gender,
      email,
      password,
    });
    // B) Using save()
    // const userInstance = new User({
    //   firstName,
    //   lastName,
    //   age,
    //   gender,
    //   email,
    //   password,
    // });
    // await userInstance.save()
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
