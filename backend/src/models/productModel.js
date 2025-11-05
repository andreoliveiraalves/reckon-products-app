import mongoose from 'mongoose'

const priceHistorySchema = new mongoose.Schema({
    price: { type: Number, required: true },
    updatedBy: { type: String, default: 'Unknown' },
    date: { type: Date, default: Date.now }
})

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceHistory: { type: [priceHistorySchema], default: [] },
    _createdBy: { type: String, default: 'Unknown' },
    _updatedBy: { type: String }
}, { timestamps: true })

// --------------------
// Pre-save hook
// --------------------
productSchema.pre('save', function (next) {
    const fallbackUpdatedBy = this._updatedBy || 'Unknown'

    // Only initialize priceHistory if it's truly empty (no initial entry)
    if (!Array.isArray(this.priceHistory) || this.priceHistory.length === 0) {
        this.priceHistory = [{
            price: this.price,
            updatedBy: this._createdBy || 'Unknown',
            date: new Date()
        }]
        return next() // skip further checks
    }

    // Add new priceHistory entry if price changed
    if (this.isModified('price')) {
        const lastPrice = this.priceHistory[this.priceHistory.length - 1]?.price
        if (lastPrice !== this.price) {
            this.priceHistory.push({
                price: this.price,
                updatedBy: fallbackUpdatedBy,
                date: new Date()
            })
        }
    }

    next()
})

export const Product = mongoose.model('Product', productSchema)