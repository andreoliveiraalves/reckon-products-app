import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js'

// Middleware to protect routes using the cookie "token"
export const verifyJWT = async (req, res, next) => {
    let token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized, token failed' })
    }
}