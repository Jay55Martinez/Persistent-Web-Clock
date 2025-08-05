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
  const expirationTime =
    Number(process.env.VERIFICATION_CODE_EXPIRATION_TIME) || 15;

  try {
    // Basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Continue with existing signup logic
    const existingUser = await User.findOne({ email: emailNormalized });

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
      verificationTokenExpires: new Date(
        Date.now() + expirationTime * 60 * 1000
      ),
      isVerified: false,
      isLoggedIn: false,
    });

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        isLoggedIn: user.isLoggedIn,
        verificationTokenExpires: user.verificationTokenExpires,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

export const verifyResend = async (req: Request, res: Response) => {
  const { email } = req.body;
  const emailNormalized = email.toLowerCase();
  const codeNew = generateVerificationCode();
  const expirationTime =
    Number(process.env.VERIFICATION_CODE_EXPIRATION_TIME) || 15;

  // check if user exists with this email
  const user = await User.findOne({ email: emailNormalized });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  } else if (user.isVerified) {
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
    res.status(500).json({ error: "Failed to send verification email." });
  }

  // Update the user's verification token expiration
  user.verificationTokenExpires = new Date(
    Date.now() + expirationTime * 60 * 1000
  );
  await user.save();

  res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      isLoggedIn: user.isLoggedIn,
    },
  });
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
    user.isLoggedIn = true; // Set isLoggedIn to true upon successful verification
    await user.save();

    await verificationCode.deleteOne(); // Remove the code after successful verification

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
          isLoggedIn: user.isLoggedIn,
        },
      });
  } catch (error) {
    return res.status(500).json({ error: "Verification failed." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Checking if the User is verified
    else if (!user.isVerified) {
      // TODO: Add logic here that brings user to the verify page
      return res.status(424).json({ error: "Current user not verified" });
    }
    // User locked out and not enough time has passed
    else if (
      user.isLocked &&
      user.durationLocked &&
      user.durationLocked.getTime() > Date.now()
    ) {
      return res.status(423).json({ error: "Current user locked out" });
    }
    // User locked out and enough time has passed
    else if (
      user.isLocked &&
      user.durationLocked &&
      user.durationLocked.getTime() < Date.now()
    ) {
      user.isLocked = false;
      user.durationLocked
      if (!(await bcrypt.compare(password, user.password))) {
        user.loginAttempts += 1;
        if (
          user.loginAttempts == (Number(process.env.PASSWORD_ATTEMPTS) || 5)
        ) {
          user.isLocked = true;
          user.durationLocked = new Date(
            Date.now() +
              (Number(process.env.LOCKED_OUT_DURATION_MINUTES) || 15) *
                60 *
                1000
          );
          user.loginAttempts = 0;
          await user.save();
          return res.status(423).json({ error: "Current user locked out" });
        }
        await user.save();
        return res.status(401).json({ error: "Invalid credentials" });
      } else {
        // Password is correct after unlocking, reset loginAttempts
        user.loginAttempts = 0;
      }
    }
    // Password does not match
    else if (!(await bcrypt.compare(password, user.password))) {
      user.loginAttempts += 1;
      if (user.loginAttempts == (Number(process.env.PASSWORD_ATTEMPTS) || 5)) {
        user.isLocked = true;
        user.durationLocked = new Date(
          Date.now() +
            (Number(process.env.LOCKED_OUT_DURATION_MINUTES) || 15) * 60 * 1000
        );
        user.loginAttempts = 0;
        await user.save();
        return res.status(423).json({ error: "Current user locked out" });
      }
      await user.save()
      return res.status(401).json({ error: "Invalid credentials" })
    }
    await user.save();

    // Update user's isLoggedIn status
    user.isLoggedIn = true;
    user.loginAttempts = 0; // Reset loginAttempts on successful login
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
          isLoggedIn: user.isLoggedIn,
        },
      });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const email = req.body.email.toLowerCase();
  const user = await User.findOne({ email: email });
  if (user && user.isLoggedIn) {
    user.isLoggedIn = false; // Update user's isLoggedIn status
    await user.save();
  } else {
    return res.status(400).json({ error: "User not logged in." });
  }
  res
    .status(200)
    .clearCookie("token")
    .json({
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        isLoggedIn: user.isLoggedIn,
      },
    });
};

export const resetPassword = async (req: Request, res: Response) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const user = await User.findOne({ email: email });
};

export const verifyAuth = async (req: Request, res: Response) => {
  // This endpoint uses the authenticateUser middleware
  // If we reach here, the user is authenticated
  // Lookup full user record and return id, email, isVerified
  const account = await User.findById(req.user!.id);
  if (!account) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({
    authenticated: true,
    user: {
      id: account._id,
      email: account.email,
      isVerified: account.isVerified,
      isLoggedIn: account.isLoggedIn,
    },
  });
};
