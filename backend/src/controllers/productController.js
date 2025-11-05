import mongoose from 'mongoose'
import { Product } from '../models/productModel.js'
import { productSchema, partialProductSchema } from '../validators/productSchema.js'

// ------------------ CREATE PRODUCT ------------------
export const createProduct = async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body || {}, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        })
        if (error) {
            return res.status(422).json({
                errors: error.details.map(d => ({ message: d.message }))
            })
        }

        const product = await Product.create({
            ...value,
            _createdBy: req.user?.username || 'Unknown'
        })

        res.status(201).json({
            message: 'Product created successfully',
            product
        })
    } catch (err) {
        console.error('Error creating product:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ------------------ UPDATE PRODUCT ------------------
export const editProduct = async (req, res) => {
    try {
        const { id } = req.params

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        // Validate partial update
        const { error, value } = partialProductSchema.validate(req.body || {}, {
            abortEarly: false,
            allowUnknown: true
        })
        if (error) {
            return res.status(422).json({
                errors: error.details.map(d => ({ message: d.message }))
            })
        }

        // Check if there are any fields to update
        if (Object.keys(value).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' })
        }

        // Apply updates
        const forbiddenFields = ['_id', '_createdBy', '_updatedBy', 'priceHistory', 'createdAt', 'updatedAt']
        forbiddenFields.forEach(f => delete value[f])
        Object.assign(product, value)
        product.set('_updatedBy', req.user?.username || 'Unknown')

        const updatedProduct = await product.save()

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        })
    } catch (err) {
        console.error('Error updating product:', err)
        res.status(500).json({ message: 'Server error' })
    }
}