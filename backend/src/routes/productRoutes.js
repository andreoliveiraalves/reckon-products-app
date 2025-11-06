import express from 'express'
import { createProduct, editProduct, deleteProduct, listProducts,  generateRandomProducts, removeAllProducts } from '../controllers/productController.js'
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

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyJWT, deleteProduct)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with pagination and optional search/filter
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number (default 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Items per page (default 20)"
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: "Filter by product ID"
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: "Search products by name (case-insensitive)"
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: "Search products by description (case-insensitive)"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: "Minimum price filter"
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: "Maximum price filter"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: "Field to sort by (default: createdAt)"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: "Sort order, 'asc' or 'desc' (default: desc)"
 *     responses:
 *       200:
 *         description: "Paginated list of products"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: "Invalid query parameter (e.g., invalid ID)"
 *       500:
 *         description: "Internal server error"
 */
router.get('/', verifyJWT, listProducts)

/**
 * @swagger
 * /products/test/generate:
 *   post:
 *     summary: Generate random products (for development/testing)
 *     tags: [Products - Dev]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of products to generate
 *     responses:
 *       201:
 *         description: Random products created successfully
 *       500:
 *         description: Server error
 */
router.post('/test/generate', verifyJWT, generateRandomProducts)

/**
 * @swagger
 * /products/test/clear:
 *   delete:
 *     summary: Remove all products (for development/testing)
 *     tags: [Products - Dev]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All products deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/test/clear', verifyJWT, removeAllProducts)


export default router