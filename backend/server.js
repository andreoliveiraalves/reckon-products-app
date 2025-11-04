// Global imports
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

// Internal imports
import { startServer } from './src/utils/serverStart.js'

// Load environment variables
dotenv.config()

// Express app configuration
const app = express()
app.use(cors())
app.use(express.json())

// Inject global variables and start the server
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI

startServer(app, PORT, MONGO_URI)