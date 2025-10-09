// 1 (Schema) --> defining the shape of documents inside a collection (the structure).
// 2 (Model) --> A Model is a wrapper around a schema. It’s what you actually use to interact with the database. When you create a model, Mongoose automatically maps it to a MongoDB collection (pluralized by default).
// 3 (Collection) --> This is the actual MongoDB collection in the database. By default, model "User", the collection will be "users".

import mongoose from "mongoose";

// Defining Schema
const usersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: [2, "First name must be at least 2 characters!"],
      maxLength: [20, "First name must be at most 20 characters!"],
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: [2, "Last name must be at least 2 characters!"],
      maxLength: [20, "Last name must be at most 20 characters!"],
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18 years old!"],
      max: [100, "Age must be at most 100 years old!"],
      index: {
        name: "idx_age", // Path Level
      },
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
      index: {
        unique: true,
        name: "idx_email_unique",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters!"],
      // select: false, // Don't include password in queries by default
      set(value) {
        const randomValue = Math.random() * 100;
        return `${value}_${randomValue}`;
      },
    },
  },
  {
    timestamps: true,
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    methods: {
      getFullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  }
);

// Compound Index
usersSchema.index(
  { firstName: 1, lastName: 1 },
  { unique: true, name: "idx_fullName_unique" }
);

// Building Model
const User = mongoose.model("User", usersSchema);

export default User;
