import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"; // added missing import
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendOTP from "../utils/resendOTP.js";

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, matricNumber, institutionalEmail, department, yearOfStudy, password } = req.body;

  if (!fullName || !matricNumber || !institutionalEmail || !department || !yearOfStudy || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const userExists = await User.findOne({
    $or: [{ matricNumber }, { institutionalEmail: institutionalEmail.toLowerCase() }],
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already registered with this Matric Number or Email");
  }

  const user = await User.create({
    fullName,
    matricNumber,
    institutionalEmail: institutionalEmail.toLowerCase(),
    department,
    yearOfStudy,
    password,
  });

  // Send OTP for email verification
  const otp = user.generateOTP();
  await user.save();
  await sendOTP(user.institutionalEmail, otp, "email-verification");

  res.status(201).json({
    success: true,
    message: "Registration successful. OTP sent to your email for verification.",
    userId: user._id,
  });
});

// @desc    Login user – accepts email OR matric number
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Email/Matric Number and password are required");
  }

  const user = await User.findOne({
    $or: [
      { matricNumber: identifier },
      { institutionalEmail: identifier.toLowerCase() }
    ],
  });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.twoFactorEnabled) {
    // 2FA enabled – send OTP and return a temporary token (short-lived) for OTP verification
    const otp = user.generateOTP();
    await user.save();
    await sendOTP(user.institutionalEmail, otp, "login-2fa");

    const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for two-factor authentication",
      tempToken,
      userId: user._id,
    });
  } else {
    // No 2FA – login immediately
    const token = generateToken(res, user._id);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        matricNumber: user.matricNumber,
        institutionalEmail: user.institutionalEmail,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        profilePicture: user.profilePicture || "",
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  }
});

// @desc    Verify OTP for various purposes
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, purpose, tempToken } = req.body;

  if (!otp || !purpose) {
    res.status(400);
    throw new Error("OTP and purpose are required");
  }

  let user;
  if (purpose === "email-verification" || purpose === "password-reset") {
    if (!email) {
      res.status(400);
      throw new Error("Email is required for this purpose");
    }
    user = await User.findOne({ institutionalEmail: email.toLowerCase() });
  } else if (purpose === "login-2fa") {
    if (!tempToken) {
      res.status(400);
      throw new Error("Temporary token required for login OTP verification");
    }
    try {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      user = await User.findById(decoded.userId);
    } catch (error) {
      res.status(401);
      throw new Error("Invalid or expired temporary token");
    }
  } else {
    res.status(400);
    throw new Error("Invalid purpose");
  }

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check OTP validity
  if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // OTP is correct – proceed based on purpose
  if (purpose === "email-verification") {
    user.isVerified = true;
    user.clearOTP();
    await user.save();
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } else if (purpose === "login-2fa") {
    const token = generateToken(res, user._id);
    user.clearOTP();
    await user.save();
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        matricNumber: user.matricNumber,
        institutionalEmail: user.institutionalEmail,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        profilePicture: user.profilePicture || "",
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } else if (purpose === "password-reset") {
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    user.clearOTP();
    await user.save();
    res.status(200).json({
      success: true,
      message: "OTP verified. Use the reset token to set a new password.",
      resetToken,
    });
  }
});

// @desc    Forgot password – send OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ institutionalEmail: email.toLowerCase() });
  if (!user) {
    // To prevent email enumeration, respond with success even if user not found
    return res.status(200).json({ success: true, message: "If the email exists, an OTP has been sent." });
  }

  const otp = user.generateOTP();
  await user.save();
  await sendOTP(user.institutionalEmail, otp, "password-reset");

  res.status(200).json({
    success: true,
    message: "OTP sent to your email for password reset",
  });
});

// @desc    Reset password (using resetToken from verify-otp)
// @route   POST /api/users/reset-password
// @access  Private (with resetToken)
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    res.status(400);
    throw new Error("Reset token and new password are required");
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "reset-password") {
      res.status(400);
      throw new Error("Invalid reset token purpose");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.password = newPassword;
    user.clearOTP();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired reset token");
  }
});

// @desc    Get current user info
// @route   GET /api/users/me
// @access  Private
const getUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -otp -otpExpires");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, user });
});

// @desc    Logout (stateless, clears cookie)
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Update profile (picture or password)
// @route   PUT /api/users/update
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { password } = req.body;

  if (!req.file && !password) {
    res.status(400);
    throw new Error("Provide profile image or password to update");
  }

  if (req.file) {
    user.profilePicture = req.file.path || req.file.secure_url || "";
  }

  if (password) {
    user.password = password; // will be hashed by pre-save hook
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      matricNumber: updatedUser.matricNumber,
      institutionalEmail: updatedUser.institutionalEmail,
      department: updatedUser.department,
      yearOfStudy: updatedUser.yearOfStudy,
      profilePicture: updatedUser.profilePicture || "",
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    },
  });
});

// @desc    Toggle two-factor authentication
// @route   PUT /api/users/toggle-2fa
// @access  Private
const toggleTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Two-factor authentication ${user.twoFactorEnabled ? "enabled" : "disabled"}.`,
    twoFactorEnabled: user.twoFactorEnabled,
  });
});

// @desc    Get all students (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllStudents = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).select("-password -otp -otpExpires").sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
});

export {
  registerUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getUserInfo,
  logoutUser,
  updateProfile,
  toggleTwoFactor,
  getAllStudents,
};