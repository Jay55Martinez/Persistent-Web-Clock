import e, { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkIfValidPassword } from "../utils/auth.utils"; // Assuming this is the correct path
import Code from "../models/verificationCode.model";
import { generateVerificationCode } from "../utils/auth.utils";
import transporter from "../email/transporter";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const emailNormalized = email.toLowerCase();
  const codeNew = generateVerificationCode();
  const expirationTime = Number(process.env.VERIFICATION_CODE_EXPIRATION_TIME) || 15;
  console.log(expirationTime);
  try {
    // Basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Continue with existing signup logic
    const existingUser = await User.findOne({ email: emailNormalized });
    // TODO: if the user is not verified, allow them to re-verify
    // else if the user is verified, return an error
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Check password validity
    if (!checkIfValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 12 characters long, contain uppercase, lowercase, number, and special character.",
      });
    }

    // Send verification email
    try {
      // Store the verification code in the database first
      const existingCode = await Code.findOne({ email: emailNormalized });
      console.log();
      if (existingCode) {
        // If a code already exists, update it
        existingCode.code = codeNew;
        existingCode.expiresAt = new Date(
          Date.now() + expirationTime * 60 * 1000
        ); // expiration
        await existingCode.save();
      } else {
        await Code.create({
          email: emailNormalized,
          code: codeNew,
          expiresAt: new Date(Date.now() + expirationTime * 60 * 1000),
        });
      }
      // Then send the email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: emailNormalized,
        subject: "Verification Code",
        text: `Your verification code is: ${codeNew}`,
      });
    } catch (error) {
      // Optionally log or handle errors
      console.error("Error during email verification:", error);
      res.status(500).json({ error: "Failed to send verification email." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: emailNormalized,
      password: hashed,
      verificationTokenExpires: new Date(Date.now() + expirationTime * 60 * 1000),
      isVerified: false,
    });

    res.status(200).json({ message: "Verification email sent successfully." });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

export const verifyResend = async (req: Request, res: Response) => {
  const { email } = req.body;
  const emailNormalized = email.toLowerCase();
  const codeNew = generateVerificationCode();
  const expirationTime = Number(process.env.VERIFICATION_CODE_EXPIRATION_TIME) || 15;

  // check if user exists with this email
  const user = await User.findOne({ email: emailNormalized });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  else if (user.isVerified) {
    return res.status(400).json({ error: "User already verified." });
  }

  // Send verification email
  try {
    // Store the verification code in the database first
    const existingCode = await Code.findOne({ email: emailNormalized });
    console.log();
    if (existingCode) {
      // If a code already exists, update it
      existingCode.code = codeNew;
      existingCode.expiresAt = new Date(
        Date.now() + expirationTime * 60 * 1000
      ); // expiration
      await existingCode.save();
    } else {
      await Code.create({
        email: emailNormalized,
        code: codeNew,
        expiresAt: new Date(Date.now() + expirationTime * 60 * 1000),
      });
    }
    // Then send the email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: emailNormalized,
      subject: "Verification Code",
      text: `Your verification code is: ${codeNew}`,
    });
  } catch (error) {
    // Optionally log or handle errors
    console.error("Error during email verification:", error);
    res.status(500).json({ error: "Failed to send verification email." });
  }

  res.status(200).json({ message: "Verification email sent successfully." });
};

export const verifyAccount = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const emailNormalized = email.toLowerCase();

  const verificationCode = await Code.findOne({
    email: emailNormalized,
    code: code,
  });

  if (!verificationCode) {
    return res.status(400).json({ error: "Invalid verification code." });
  }

  if (verificationCode.expiresAt < new Date()) {
    return res.status(400).json({ error: "Verification code expired." });
  }

  try {
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    } else if (user.isVerified) {
      return res.status(400).json({ error: "User already verified." });
    }
    user.isVerified = true;
    await user.save();
    await verificationCode.deleteOne(); // Remove the code after successful verification

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none", // allow cross-site on different ports
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({ user: { id: user._id, email: user.email } });

  } catch (error) {
    return res.status(500).json({ error: "Verification failed." });
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
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
};

export const verifyAuth = async (req: Request, res: Response) => {
  // This endpoint uses the authenticateUser middleware
  // If we reach here, the user is authenticated
  res.json({
    authenticated: true,
    user: { id: req.user!.id },
  });
};
