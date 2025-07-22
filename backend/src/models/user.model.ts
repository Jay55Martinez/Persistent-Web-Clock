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
  verificationTokenExpires: Date,
  // Failed login tracking
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
});

// expireAfterSeconds:0 means “remove when date ≤ now”
// optionally, if you’re on MongoDB 4.4+ you can add a partialFilterExpression
UserSchema.index(
  { verificationTokenExpires: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { isVerified: false } }
)

export default mongoose.model("User", UserSchema);