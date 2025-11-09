// Global imports
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Internal imports
import { startServer } from './utils/serverStart.js'

// Internal routes
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'

// Load environment variables
dotenv.config()

// Express app configuration
const app = express()
const allowedOrigins = [
  'http://localhost:5173',
  'https://reckon-products.netlify.app'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Added routes to express
app.use('/auth', userRoutes)
app.use('/products', productRoutes)

// Inject global variables and start the server
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI

startServer(app, PORT, MONGO_URI)