

const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ message:"Unauthorized" })
            }

        const decoded = jwt.verify(token,"SECRET_KEY")

        req.user = decoded

        next()
    }catch (err) {
        res.status(401).json({ message:"Invalid token" })
    }
}


module.exports = authMiddleware;