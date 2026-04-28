import { Request, Response } from 'express';
import Users from '../models/Users';
import jwt from 'jsonwebtoken';
import  validator  from 'validator';
import dotenv from "dotenv";
dotenv.config();









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

        // TODO: Generate and return JWT token
        const token = jwt.sign(
                        {
                          userId:user._id,
                          role:user.role
                        },
                        process.env.SECRET_KEY!,
                        { expiresIn:"3h" }
                      )
                    res.json({ token })

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
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
            throw new Error("Invalid email format");
        }

        const existingEmail = await Users.findOne({ email });
        if (existingEmail) {
        throw new Error("Email déjà utilisé");
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
    } catch (error:any) {
        console.error("Registration error:", error.message );
        return res.status(500).json({ msg: error.message || "Server error during registration" });
    }
}
 



 
// Token Refreshing function 
export async function refresh(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Refresh token endpoint" });
}





// Close session function
export async function logout(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Logout endpoint" });
}
