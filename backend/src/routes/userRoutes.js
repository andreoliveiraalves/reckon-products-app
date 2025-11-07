import express from 'express'
import { registerUser, loginUser, logoutUser, validateUser } from '../controllers/userController.js'

const router = express.Router()

/**
 * @swagger
 * /auth/register:
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
 *                 description: Unique username (≥6 characters)
 *               password:
 *                 type: string
 *                 description: Password (≥8 characters)
 *             example:
 *               username: "andre123"
 *               password: "strongPassword123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error (missing fields or password too short)
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerUser)

/**
 * @swagger
 * /auth/login:
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
 *                 description: Registered user's username
 *               password:
 *                 type: string
 *                 description: User's password
 *             example:
 *               username: "andre123"
 *               password: "strongPassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error (missing username or password)
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginUser)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the currently logged-in user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: User not logged in
 */
router.post('/logout', logoutUser)

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate the authentication token stored in cookies
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Returns whether the user is authenticated or not
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   description: True if token is valid
 *                 userId:
 *                   type: string
 *                   description: User ID extracted from token (if valid)
 *       401:
 *         description: Token is invalid or missing
 */
router.get('/validate', validateUser)

export default router