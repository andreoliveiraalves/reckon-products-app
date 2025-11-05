import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js'
import { verifyJWT } from '../middleware/authMiddleware.js'

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
 *                 description: Unique username for the user with at least 6 characters
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

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in an existing user
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
 *                 description: Username of the registered user
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation failed (missing username or password)
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginUser)

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Log out the currently logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []   # <-- says we need auth
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: User not logged in
 */
router.post('/logout', verifyJWT, logoutUser)

export default router