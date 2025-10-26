import mongoose from "mongoose";

// User Schema
const usersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [20, "First name must be at most 20 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: [2, "Last name must be at least 2 characters"],
      maxLength: [20, "Last name must be at most 20 characters"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18 years old"],
      max: [100, "Age must be at most 100 years old"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    otps: {
      confirmation: {
        type: String,
        default: null,
      },
      passwordReset: {
        type: String,
        default: null,
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // to see virtuals in the response
    },
    toObject: {
      virtuals: true, // to see virtuals in the log
    },
  }
);

// Virtual: Get full name
usersSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
usersSchema.index({ email: 1 }, { unique: true });
usersSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

// Create Model
const User = mongoose.model("User", usersSchema);

export default User;
