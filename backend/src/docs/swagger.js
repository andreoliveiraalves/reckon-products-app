// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Basic Swagger configuration
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Reckon Products API',
            version: '1.0.0',
            description: 'API for managing products and tracking price history'
        },
        servers: [
            {
                url: 'http://localhost:3000/api'
            }
        ]
    },
    // Path to the route files where Swagger will look for docs
    apis: ['./src/routes/*.js']
}

// Create the specification
const swaggerSpec = swaggerJsdoc(options)

// Export a function that sets up Swagger in your app
export const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    console.log('📘 Swagger Docs available at: http://localhost:3000/api-docs')
}