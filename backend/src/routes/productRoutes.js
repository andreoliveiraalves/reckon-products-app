import express from 'express'
import { createProduct, editProduct } from '../controllers/productController.js'
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
 *                 description: Positive product price
 *             example:
 *               name: "Gaming Mouse"
 *               description: "High precision wireless mouse"
 *               price: 49.99
 *     responses:
 *       201:
 *         description: Product created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyJWT, createProduct)

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing product (partial update)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "Updated Mouse Name"
 *               description:
 *                 type: string
 *                 description: Updated product description
 *                 example: "Updated wireless mouse description"
 *               price:
 *                 type: number
 *                 description: Updated product price (positive number)
 *                 example: 59.99
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', verifyJWT, editProduct)

export default router