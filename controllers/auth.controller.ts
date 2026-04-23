import { Request, Response } from 'express';
import Users from '../models/Users';
import jwt from 'jsonwebtoken'






// login and Token Generating
export async function login(req: Request, res: Response) {
   try {
    const loginData = await req.body
    const [email , password] = [loginData.email ,loginData.password]
    const user = await Users.findOne({email})
    if (!user) { 
        return res.status(404).json({msg:"User not Foud"})
    }

    const isPassword = user.comparePassword(password)

    if (!isPassword) {
        return res.status(400).json({msg:"Password Incorrect"})
    }

    const token = jwt.sign({
         id: user._id 
        }, 
        'TOKEN_KEY',
        { expiresIn: '3h' }
    )

    res.json({ token })

   } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" })
   }
}



// login register
export async function register(req: Request, res: Response) {
   
}


// Token Reshing function 
export async function refresh(req:Request ,res:Response ) {
    
}



// Close session funvtion
export async function logout(req:Request , res:Response) {
    
}
