import express from 'express'
import { createProduct } from '../controllers/productController.js'
import { verifyJWT } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price (positive number)
 *     responses:
 *       201:
 *         description: Product created successfully
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyJWT, createProduct)

export default router