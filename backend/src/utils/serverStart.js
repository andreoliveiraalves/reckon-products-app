import mongoose from 'mongoose'
import { swaggerDocs } from '../docs/swagger.js'

// This function starts the Express server and connects to MongoDB
export const startServer = async (app, PORT, MONGO_URI) => {
    try {
        // Attempt to connect to MongoDB using the provided URI
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB connected successfully')

        // Initialize Swagger documentation
        swaggerDocs(app)

        // Start the Express server and listen on the provided port
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (err) {
        // If the connection or startup fails, log the error and exit the process
        console.error('MongoDB connection error:', err)
        process.exit(1)
    }
}