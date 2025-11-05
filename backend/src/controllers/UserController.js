import bcrypt from 'bcryptjs'
import { User } from '../models/userModel.js'
import { generateToken } from '../utils/generateJwtToken.js'
import { registerSchema, loginSchema } from '../validators/userSchema.js'

// ------------------ USER REGISTRATION ------------------
// Handles new user registration
export const registerUser = async (req, res) => {
    try {
        // Validate request body using Joi
        const { error, value } = registerSchema.validate(req.body || {}, { abortEarly: false })
        if (error) {
            // Return array of validation errors
            return res.status(422).json({ errors: error.details.map(d => ({ message: d.message })) })
        }

        const { username, password } = value

        // Check if username already exists
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' })
        }

        // Let Mongoose pre-save hook hash the password
        const user = await User.create({ username, password })
        const token = generateToken(user._id)

        // Return success response with token
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, username: user.username },
            token
        })
    } catch (err) {
        console.error('Error registering user:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ------------------ USER LOGIN ------------------
// Handles user login and returns JWT token
export const loginUser = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body || {}, { abortEarly: false })
        if (error) {
            // Return array of validation errors
            return res.status(422).json({ errors: error.details.map(d => ({ message: d.message })) })
        }

        const { username, password } = value

        // Find user in DB
        const query = { username }
        const existingUser = await User.findOne(query)
        if (!existingUser) return res.status(401).json({ message: 'Invalid credentials' })

        // Compare hashed password
        const isMatch = await existingUser.matchPassword(password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

        // Generate JWT token
        const token = generateToken(existingUser._id)

        // Set token as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Return success response with token
        res.status(200).json({
            message: 'Login successful',
            user: { id: existingUser._id, username: existingUser.username },
            token
        })
    } catch (err) {
        console.error('Error logging in user:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ------------------ USER LOGOUT ------------------
// Clears the token cookie
export const logoutUser = async (req, res) => {
    try {
        await res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};