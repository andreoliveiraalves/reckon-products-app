import express from 'express'
import { registerUser } from '../controllers/UserController.js'

const router = express.Router()

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user
 *               password:
 *                 type: string
 *                 description: Password with at least 8 characters
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists (conflict)
 *       422:
 *         description: Validation failed (e.g., password too short)
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerUser)

export default router