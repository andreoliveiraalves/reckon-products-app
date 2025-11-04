import jwt from 'jsonwebtoken'

// Generates a JWT containing the user ID as payload, valid for 7 days
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
}