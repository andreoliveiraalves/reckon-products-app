import bcrypt from 'bcryptjs'
import { User } from '../models/userModel.js'
import { generateToken } from '../utils/generateJwtToken.js'
import { registerSchema } from '../validators/userSchema.js'

// Controller to handle user registration
export const registerUser = async (req, res) => {
    try {
        // Validate request body using Zod
        const { username, password } = registerSchema.parse(req.body)

        // Ensure the user does not already exist
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            // 409 handle username conflict
            return res.status(409).json({ message: 'User already exists' })
        }

        // Hash the password before saving for security
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user in the database
        const user = await User.create({
            username,
            password: hashedPassword
        })

        // Generate a JWT token for the newly registered user
        const token = generateToken(user._id)

        // Respond with user info (without password) and the token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username
            },
            token
        })
    } catch (err) {
        // Handle validation errors from Zod
        if (err.name === 'ZodError') {
            return res.status(422).json({ errors: err.errors })
        }

        // Handle any unexpected server errors
        console.error('Error registering user:', err)
        res.status(500).json({ message: 'Server error' })
    }
}