import { Request, Response } from 'express';
import Users from '../models/Users';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dotenv from "dotenv";
dotenv.config();

// user register
export async function register(req: Request, res: Response) {
    try {
        // Basic register stub
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


        return res.status(201).json({ success: true, message: "User registered successfully" });
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

        //  Generate accessToken and RefreshToken
        const accessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET!,
            { expiresIn: "3h" }
        )
        // res.json({ accessToken })

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: "7d" }
        );

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
    } ``
}







// Token Refreshing controller function 
export async function refresh(req: Request, res: Response) {
    try {
        const { refreshToken } = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token" });
        }

        // refreshToken Verification
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        );


        // Generate new Token
        const newAccessToken = jwt.sign(
            { userId: decoded.id },

            process.env.JWT_SECRET!,
            { expiresIn: "3h" }
        );
        return res.status(200).json({
            success: true,
            message: "Refresh token endpoint",
            newAccessToken: newAccessToken,
        });
    } catch (error: any) {
        console.error({ error: error.message })
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
