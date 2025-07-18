import { Request, Response } from "express";
import { resolveMx } from "dns/promises";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../email/transporter";

// Check if the email can be reached
async function hasValidMXRecord(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
}

// TODO: Also add to the cookie if the user is successfully signed up
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

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // allow cross-site on different ports
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .status(201)
      .json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d"
    });

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: "Message",
        text: "I hope this message gets through!",
      });
    } catch (mailError) {
      // Optionally log or handle email sending errors
      console.error("Email sending failed:", mailError);
    }

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie('token')
    .json({ message: 'Logged out successfully' });
};

export const verifyAuth = async (req: Request, res: Response) => {
  // This endpoint uses the authenticateUser middleware
  // If we reach here, the user is authenticated
  res.json({ 
    authenticated: true, 
    user: { id: req.user!.id } 
  });
};