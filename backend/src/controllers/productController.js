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

// ------------------ DELETE PRODUCT ------------------
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        await product.deleteOne()

        res.status(200).json({ message: 'Product deleted successfully' })
    } catch (err) {
        console.error('Error deleting product:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ------------------ LIST PRODUCTS ------------------
export const listProducts = async (req, res) => {

    const clean = (v) => (typeof v === 'string' ? v.trim() : v)

    try {
        const {
            page = 1,
            limit = 20,
            id,
            name,
            description,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',   // default sort field
            sortOrder = 'desc'      // 'asc' or 'desc'
        } = req.query

        const nameClean = clean(name)
        const descClean = clean(description)

        const allowedSortFields = ['name', 'price', 'createdAt', 'description']

        // Validate numeric filters
        const minPriceNum = Number(minPrice)
        const maxPriceNum = Number(maxPrice)
        const pageNum = Number(page)
        const limitNum = Number(limit)

        if ((minPrice && isNaN(minPriceNum)) || (maxPrice && isNaN(maxPriceNum))) {
            return res.status(400).json({ message: 'Invalid price filter' })
        }
        if (pageNum < 1 || limitNum < 1 || isNaN(pageNum) || isNaN(limitNum)) {
            return res.status(400).json({ message: 'Invalid pagination parameters' })
        }

        // Validate sort
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({ message: 'Invalid sortBy field' })
        }
        if (!['asc', 'desc'].includes(sortOrder)) {
            return res.status(400).json({ message: 'Invalid sortOrder' })
        }

        const filter = {}

        // Search by ID
        if (id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                filter._id = id
            } else {
                return res.status(400).json({ message: 'Invalid product ID' })
            }
        }

        // Search by name/description
        if (nameClean) filter.name = { $regex: nameClean, $options: 'i' }
        if (descClean) filter.description = { $regex: descClean, $options: 'i' }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = minPriceNum
            if (maxPrice) filter.price.$lte = maxPriceNum
        }

        // Pagination
        const skip = (pageNum - 1) * limitNum
        const total = await Product.countDocuments(filter)

        // Sorting
        const sort = {}
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1

        // Fetch products
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort(sort)

        res.status(200).json({
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            products
        })
    } catch (err) {
        console.error('Error listing products:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ------------------ GENERATE RANDOM PRODUCTS ------------------
export const generateRandomProducts = async (req, res) => {
    try {
        const count = Number(req.query.count) || 30

        const randomProducts = Array.from({ length: count }, (_, i) => ({
            name: `Random Product ${i + 1}`,
            description: `Auto-generated product for testing ${i + 1}`,
            price: Math.floor(Math.random() * 500) + 5,
            _createdBy: req.user?.username || 'System'
        }))

        await Product.insertMany(randomProducts)

        res.status(201).json({
            message: `${count} random products created successfully`,
            count
        })
    } catch (err) {
        console.error('Error generating random products:', err)
        res.status(500).json({ message: 'Server error while generating products' })
    }
}

// ------------------ REMOVE ALL PRODUCTS ------------------
export const removeAllProducts = async (req, res) => {
    try {
        const result = await Product.deleteMany({})
        res.status(200).json({
            message: `All products removed successfully`,
            deletedCount: result.deletedCount
        })
    } catch (err) {
        console.error('Error removing all products:', err)
        res.status(500).json({ message: 'Server error while removing products' })
    }
}