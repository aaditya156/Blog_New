import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: {
    public_id?: string;
    url: string;
  };
  bio?: string;
  role: "user" | "author" | "admin";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "author", "admin"],
      default: "author",
    },
    googleId: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
