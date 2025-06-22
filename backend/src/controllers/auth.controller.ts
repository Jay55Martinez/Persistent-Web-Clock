import { Request, Response } from "express";
import { resolveMx } from "dns/promises";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Check if the email can be reached
async function hasValidMXRecord(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
}

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const emailNormalized = email.toLowerCase();

  try {
    // Basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Extract domain and check MX records
    const domain = emailNormalized.split("@")[1];
    const hasMX = await hasValidMXRecord(domain);

    if (!hasMX) {
      return res
        .status(400)
        .json({ error: "Email domain cannot receive emails." });
    }

    // Continue with existing signup logic
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: emailNormalized,
      password: hashed,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const emailNormalized = email.toLowerCase();
  try {
    const user = await User.findOne({ email: emailNormalized });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
