
const express = require("express")
const router = express.Router()

const {
  login,
  signUp,
  sendOtp,
  changePassword,
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")
const { authLimiter } = require("../middlewares/rateLimiter")


// Route for user login
router.post("/login", authLimiter, login)

// Route for user signup
router.post("/signup", authLimiter, signUp)

// Route for sending OTP to the user's email
router.post("/sendotp", authLimiter, sendOtp)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

//                                      Reset Password

// Route for generating a reset password token
router.post("/reset-password-token", authLimiter, resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", authLimiter, resetPassword)

module.exports = router