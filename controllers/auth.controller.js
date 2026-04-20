
import Users from '../models/Users.js';
import jwt from 'jsonwebtoken';





// login and Token Generating
export async function login(req, res) {
    try {
            const { email, password } = req.body
            const user = await Users.findOne({ email })
    
            if (!user) {
                return res.status(404).json({ message:"User not found" })
                }
    
            const isMatch = await user.comparePassword(password)
    
            if (!isMatch) {
                return res.status(400).json({ message:"Invalid credentials" })
                }
                
            const token = jwt.sign(
                {
                  userId:user._id,
                  role:user.role
                },
                "SECRET_KEY",
                { expiresIn:"3h" }
              )
                res.json({ token })
    
        }catch (err) {
              res.status(500).json({ error:err.message })
          }
}



// User register
export async function register(req, res) {
    try {
        const user = await Users.create(req.body)
        res.json(user)
    } catch (err) {
        res.status(500).json({ error:err.message })
        }
}

