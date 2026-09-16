import { Request, Response } from 'express';
import Users, { IUser } from '../models/Users';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dotenv from "dotenv";
dotenv.config();

// Shared by login and register: both a client to be logged in right away.
function generateTokens(user: IUser) {
    const accessToken = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: "3h" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

// user register
export async function register(req: Request, res: Response) {
    try {
        const { email,
            password,
            role,
            phoneNumber,
            firstName,
            lastName,
            location
        } = req.body;


        if (!validator.isEmail(email)) {
            throw new Error("Invalid format");
        }

        const existingEmail = await Users.findOne({ email });
        if (existingEmail) {
            throw new Error("Email already in use");
        }


        const user = await Users.create({
            email,
            password,
            role,
            phoneNumber,
            firstName,
            lastName,
            location
        });

        // Log the new user in right away so clients (web, mobile) don't need
        // a separate round trip to get a usable session.
        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ msg: error.message || "Server error during registration" });
    }
}

// login and Token Generating
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: "User not Found" });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({ msg: "Password Incorrect" });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ msg: "Server error during login" });
    }
}

// Token Refreshing controller function
export async function refresh(req: Request, res: Response) {
    try {
        // No cookie-parser is set up on this server (req.cookies is always
        // undefined), and neither client (web, mobile) sends a cookie
        // anyway — both post the refresh token in the body, like login does.
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token" });
        }

        // refreshToken Verification
        const decoded: any = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        );

        const user = await Users.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Only the access token is renewed here — the refresh token is
        // long-lived and not rotated, since hohaya-web's client doesn't
        // capture a new one from this response. Include role like login
        // does, so the refreshed session keeps access to role-gated routes
        // (e.g. GET /transactions/owner/revenue).
        const newAccessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "3h" }
        );

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch (error: any) {
        console.error("Refresh error:", error.message);
        return res.status(403).json({ message: "Invalid refresh token" });
    }
}

// Close session function
export async function logout(req: Request, res: Response) {
    try {
        res.clearCookie("refreshToken");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ msg: "Server error during logout" });
    }
}

// Google OAuth stub
export async function googleAuth(req: Request, res: Response) {
    try {
        // This is a stub for Google OAuth logic
        return res.status(501).json({ success: false, message: "Google Auth not implemented yet" });
    } catch (error: any) {
        console.error("Google Auth error:", error.message);
        return res.status(500).json({ msg: "Server error during Google Auth" });
    }
}
