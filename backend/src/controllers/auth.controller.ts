import e, { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkIfValidPassword } from "../utils/auth.utils"; // Assuming this is the correct path
import Code from "../models/verificationCode.model";
import { generateVerificationCode } from "../utils/auth.utils";
import transporter from "../email/transporter";

/**
 * Handles user signup. Creates a User and sends a verification code to the user's email. 
 * The verification code is stored in the database with an expiration time. If the User does
 * not verify within the expiration time, the new user will be deleted from the database.
 * @param req - Contains email and password in the body.
 * @param res - Sends back a JSON response if the signup was successful or an error message.
 * @returns A JSON response with user information or an error message. 
 */
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

/**
 * Handles resending the verification email for verifying a new user account.
 * @param req - Contains email in the body.
 * @param res - Sends back a JSON response if the email was resent successfully or an error message.
 * @returns A JSON response indicating the result of the operation.
 */
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
      email: user.email,
      isVerified: user.isVerified,
      isLoggedIn: user.isLoggedIn,
    },
  });
};

/**
 * Handles the verification of a user account. If the req code matches the stored code and is not expired,
 * the user's account is marked as verified. And the user is logged in upon successful verification. The 
 * User is also issued a JWT token stored in an HttpOnly cookie.
 * @param req - Contains email and verification code in the body.
 * @param res - Sends back a JSON response if the verification was successful or an error message.
 * @returns A JSON response indicating the result of the operation.
 */
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

    // todo: have a remember me option later - 7 days
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "1h",
    });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    user.isVerified = true;
    user.isLoggedIn = true; // Set isLoggedIn to true upon successful verification
    user.RefreshToken = refreshToken;

    await user.save();
    await verificationCode.deleteOne(); // Remove the code after successful verification

    res
      .status(200)
      .cookie(
        "accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      })
      .json({
        user: {
          email: user.email,
          isVerified: user.isVerified,
          isLoggedIn: user.isLoggedIn,
        },
      });
  } catch (error) {
    return res.status(500).json({ error: "Verification failed." });
  }
};

/**
 * Handles user login. If req credentials are valid and the user is verified (and not locked out),
 * the user is logged in and issued a JWT token stored in an HttpOnly cookie.
 * @param req - Contains email and password in the body.
 * @param res - Sends back a JSON response if the login was successful or an error message.
 * @returns A JSON response indicating the result of the operation.
 */
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
      user.durationLocked;
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
      await user.save();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // todo: have a remember me option later - 7 days
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "1h",
    });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    user.RefreshToken = refreshToken;

    await user.save();

    // Update user's isLoggedIn status
    user.isLoggedIn = true;
    user.loginAttempts = 0; // Reset loginAttempts on successful login
    await user.save();

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      })
      .json({
        user: {
          email: user.email,
          isVerified: user.isVerified,
          isLoggedIn: user.isLoggedIn,
        },
      });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Handles user logout by invalidating the refresh token, updating the user's isLoggedIn status,
 * and clearing authentication cookies.
 * @param req - Express request object containing cookies with the refresh token.
 * @param res - Express response object for sending status and user information.
 * @returns A JSON response with user details or an error message.
 */
export const logout = async (req: Request, res: Response) => {
  if (!req.cookies || !req.cookies.refreshToken) {
    return res.status(400).json({ error: "User not logged in." });
  }
  const refreshToken = req.cookies.refreshToken;
  let user = await User.findOne({ RefreshToken: refreshToken });
  if (!user) {
    return res.status(400).json({ error: "User not logged in." });
  }
    user.RefreshToken = undefined;
  user.RefreshToken = null;
  user.isLoggedIn = false; // Update user's isLoggedIn status
  await user.save();

  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    })
    .json({
      user: {
        email: user.email,
        isVerified: user.isVerified,
        isLoggedIn: user.isLoggedIn,
      },
    });
};

/**
 * Creates a 6 digit code to enable password reset
 * @param {Response} res - Express response object for sending status and messages.
 * @param {Request} req - Body contains the email of the account that is requesting the password reset
 * @returns {Promise<void>} Sends a response indicating the result of the email operation.
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  // Ensures that an email is provided in the Post request
  try {
    const emailNormalized = req.body.email.toLowerCase();
    const codeNew = generateVerificationCode();
    const expirationTime =
      Number(process.env.VERIFICATION_CODE_EXPIRATION_TIME) || 15;

    // Add code to DB
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

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: emailNormalized,
      subject: "Verification Code",
      text: `Your verification code is: ${codeNew}`,
    });
    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
};

/**
 * Verifies if the provided reset code matches the one stored for the user's email.
 * @param {Request} req - Express request object containing email and code in the body.
 * @param {Response} res - Express response object for sending status and messages.
 */
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const emailNormalized = req.body.email.toLowerCase();
    const code = req.body.code;

    const existingCode = await Code.findOne({
      email: emailNormalized,
      code: code,
    });

    if (existingCode) {
      return res.status(200).json({ message: "Code exists" });
    }
    res.status(400).json({ error: "Code does not match" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
};

/**
 * Resets the password for the user with the email and correct code.
 * @param {Request} req - Express request object containing email, code, and new password in the body.
 * @param {Response} res - Express response object for sending status and messages.
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const emailNormalized = req.body.email.toLowerCase();
    const code = req.body.code;

    // check if code is valid
    const existingCode = await Code.findOne({
      email: emailNormalized,
      code: code,
    });
    if (!existingCode) {
      return res.status(400).json({ error: "Code does not match" });
    }

    // Check password validity
    if (!checkIfValidPassword(req.body.password)) {
      return res.status(400).json({
        error:
          "Password must be at least 12 characters long, contain uppercase, lowercase, number, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Check if the email is valid
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(400).json({ error: "email does not exist" });
    }

    // Ensure the new password is different than the old one
    if (await bcrypt.compare(req.body.password, user.password)) {
      return res.status(400).json({ error: "New password must be different from the old one." });
    }

    // todo: have a remember me option later - 7 days
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "1h",
    });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    user.RefreshToken = refreshToken;

    // Log the User in 
    user.isLoggedIn = true;

    // Update the users password
    user.password = hashedPassword;

    // Unlock the user if they currently locked out
    user.loginAttempts = 0;
    user.isLocked = false;

    await user.save();
    await existingCode.deleteOne();

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      })
      .json({
        user: {
          email: user.email,
          isVerified: user.isVerified,
          isLoggedIn: true,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
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
      email: account.email,
      isVerified: account.isVerified,
      isLoggedIn: account.isLoggedIn,
    },
  });
};
