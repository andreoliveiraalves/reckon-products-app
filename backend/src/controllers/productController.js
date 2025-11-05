import { Product } from '../models/productModel.js'
import { productSchema } from '../validators/productSchema.js'

// ------------------ CREATE PRODUCT ------------------
// Handles creation of a new product
export const createProduct = async (req, res) => {
    try {
        // Validate request body using Joi
        const { error, value } = productSchema.validate(req.body || {}, { abortEarly: false })
        if (error) {
            // Return array of validation errors
            return res.status(422).json({ errors: error.details.map(d => ({ message: d.message })) })
        }

        const { name, description, price } = value

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
        })

        // Return success response with product
        res.status(201).json({
            message: 'Product created successfully',
            product
        })
    } catch (err) {
        console.error('Error creating product:', err)
        res.status(500).json({ message: 'Server error' })
    }
}