// models/productModel.js
import mongoose from 'mongoose'

// Define the schema for the price history of a product
const priceHistorySchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be positive']
    },
    date: {
        type: Date,
        default: Date.now
    }
})

// Define the main product schema
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price must be a positive number']
        },
        priceHistory: [priceHistorySchema]
    },
    {
        timestamps: true // adds createdAt and updatedAt automatically
    }
)

// Create a pre-save hook to track price changes
productSchema.pre('save', function (next) {
    if (this.isModified('price')) {
        this.priceHistory.push({ price: this.price })
    }
    next()
})

// Create and export the model
export const Product = mongoose.model('Product', productSchema)