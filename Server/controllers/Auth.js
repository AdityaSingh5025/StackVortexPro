const OTP = require('../models/OTP');
const User = require('../models/User')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require('dotenv').config()

const normalizeEmail = (email) => email?.trim().toLowerCase();

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "Email already exists"
            })
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // console.log("OTP generated", otp);

        const createdOtp = await OTP.create({
            email: normalizedEmail,
            otp
        })

        return res.status(200).json({
            success: true,
            message: "OTP created!",
            createdOtp
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp, contactNumber
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "Fill all details"
            })
        }

        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Passwords don't match"
            })
        }

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "Email already exists"
            })
        }

        const recentOtpRecord = await OTP.findOne({ email: normalizedEmail })
            .sort({ createdAt: -1 });

        if (!recentOtpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired. Please request a new OTP.",
            });
        }

        if (String(otp).trim() !== String(recentOtpRecord.otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumer: null,
        });

        const safeAccountType =
            accountType === "Instructor" ? "Instructor" : "Student";

        await OTP.deleteMany({ email: normalizedEmail });

        const newUser = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPwd,
            accountType: safeAccountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        console.log("Data created successfully")
        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
            newUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registrered. Please try again",
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email or Password empty',
            })
        }

        const existingUser = await User.findOne({ email }).populate("additionalDetails").exec();
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email not registered',
            })
        }

        if (await bcrypt.compare(password, existingUser.password)) {
            const payload = {
                email: email,
                accountType: existingUser.accountType,
                id: existingUser._id
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })

            const userObject = existingUser.toObject();
            userObject.token = token;
            userObject.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            return res.cookie("token", token, options).status(200).json({
                success: true,
                message: 'Login successfull',
                token,
                existingUser: userObject
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Login Failure, please try again',
        });
    }
}

//  for Changing Password
exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword } = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({ success: false, message: "The password is incorrect" });
        }

        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {

            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};