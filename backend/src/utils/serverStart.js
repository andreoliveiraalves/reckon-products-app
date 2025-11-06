import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { swaggerDocs } from '../docs/swagger.js'

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// This function starts the Express server and connects to MongoDB
export const startServer = async (app, PORT, MONGO_URI) => {
    try {
        // Connect to MongoDB using the provided URI
        await mongoose.connect(MONGO_URI)
        console.log('✅ MongoDB connected successfully')

        // Initialize Swagger documentation
        swaggerDocs(app)

        // Serve static files from the "public" folder (HTML, JSON, etc.)
        app.use(express.static(path.join(__dirname, '../../public')))
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public', 'index.html'))
        })

        // Start the Express server and listen on the provided port
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port http://localhost:${PORT}/`)
            console.log(`📘 Swagger UI available at http://localhost:${PORT}/api-docs`)
            console.log(`📦 Postman collection at http://localhost:${PORT}/postman_collection.json`)
        })
    } catch (err) {
        // Handle MongoDB connection or startup errors
        console.error('❌ MongoDB connection error:', err)
        process.exit(1)
    }
}