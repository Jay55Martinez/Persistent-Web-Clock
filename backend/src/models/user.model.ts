import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  isLocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
  durationLocked: Date,
  verificationTokenExpires: Date,
});

// expireAfterSeconds:0 means “remove when date ≤ now”
UserSchema.index(
  { verificationTokenExpires: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { isVerified: false } }
)

export default mongoose.model("User", UserSchema);