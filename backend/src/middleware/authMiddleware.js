import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js'

export const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization')
        let token = null

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7)
        } else if (req.cookies?.token) {
            token = req.cookies.token
        }

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                details: 'No valid token provided'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id).select('-password')

        // Se o user não existir ou estiver inativo, retorna 403
        if (!user || user.isActive === false) {
            return res.status(403).json({
                error: 'Forbidden',
                details: 'User account not found or inactive'
            })
        }

        req.user = user
        req.token = token
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                details: 'Please authenticate again'
            })
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                details: 'Authentication failed'
            })
        }

        // Qualquer outro erro interno
        return res.status(401).json({
            error: 'Invalid token',
            details: 'Authentication failed'
        })
    }
}