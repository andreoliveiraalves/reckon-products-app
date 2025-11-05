import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import productRoutes from '../routes/productRoutes.js'
import userRoutes from '../routes/userRoutes.js'
import { Product } from '../models/productModel.js'
import { User } from '../models/userModel.js'

// Load environment variables from test file
dotenv.config({ path: '.env.test' })

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/users', userRoutes)
app.use('/products', productRoutes)

let mongoServer
let authCookie

beforeAll(async () => {
    process.env.JWT_SECRET = 'supersecretfortests'

    // Silence console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => { })

    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())

    // Create a user and login to get auth cookie
    const user = new User({ username: 'testuser', password: 'password123' })
    await user.save()

    const loginRes = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'password123' })

    authCookie = loginRes.headers['set-cookie']
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany()
    }
})

// ------------------ PRODUCT CONTROLLER TESTS ------------------

describe('POST /products', () => {
    it('should create a product with valid data when authenticated', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({ name: 'Test Product', description: 'A product for testing', price: 100 })

        expect(res.statusCode).toBe(201)
        expect(res.body.product.name).toBe('Test Product')
        expect(res.body.product.description).toBe('A product for testing')
        expect(res.body.product.price).toBe(100)
        expect(res.body.product.priceHistory.length).toBe(1)
        expect(res.body.product.priceHistory[0].price).toBe(100)
    })

    it('should fail if not authenticated', async () => {
        const res = await request(app)
            .post('/products')
            .send({ name: 'Test Product', description: 'A product for testing', price: 100 })

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Not authorized, no token')
    })

    it('should fail if token is invalid', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', ['token=invalidtoken'])
            .send({ name: 'Test Product', description: 'Invalid token', price: 50 })

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/not authorized/i)
    })

    it('should fail if body is empty', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({})

        expect(res.statusCode).toBe(422)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('should fail if name, description or price is missing', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({ name: '', description: 'Missing name', price: 50 })

        expect(res.statusCode).toBe(422)
    })

    it('should fail if price is negative', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({ name: 'Invalid Product', description: 'Negative price', price: -10 })

        expect(res.statusCode).toBe(422)
    })

    it('should fail if types are invalid', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({ name: 123, description: true, price: 'notanumber' })

        expect(res.statusCode).toBe(422)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('should handle unexpected server errors', async () => {
        jest.spyOn(Product, 'create').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send({ name: 'Fail Product', description: 'DB fail', price: 100 })

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error')

        Product.create.mockRestore()
    })
    it('should fail if req.body is undefined', async () => {
        const res = await request(app)
            .post('/products')
            .set('Cookie', authCookie)
            .send() // envia undefined
        expect(res.statusCode).toBe(422)
    })
})

// ------------------ PRODUCT MODEL TESTS ------------------

describe('Product model', () => {
    it('should create a product with priceHistory initialized', async () => {
        const product = new Product({
            name: 'Test Product',
            description: 'Test Description',
            price: 100
        })
        await product.save()

        expect(product.priceHistory.length).toBe(1)
        expect(product.priceHistory[0].price).toBe(100)
        expect(product.createdAt).toBeDefined()
        expect(product.updatedAt).toBeDefined()
    })

    it('should add new priceHistory entry when price changes', async () => {
        const product = new Product({
            name: 'Test Product 2',
            description: 'Desc',
            price: 50
        })
        await product.save()

        product.price = 75
        await product.save()

        expect(product.priceHistory.length).toBe(2)
        expect(product.priceHistory[1].price).toBe(75)
    })

    it('should not add priceHistory if price is not modified', async () => {
        const product = new Product({
            name: 'Test Product 3',
            description: 'Desc',
            price: 20
        })
        await product.save()

        const originalLength = product.priceHistory.length
        product.description = 'Updated description'
        await product.save()

        expect(product.priceHistory.length).toBe(originalLength)
    })

    it('should throw validation errors for invalid fields', async () => {
        const product = new Product({ name: '', description: '', price: -10 })
        await expect(product.save()).rejects.toThrow()
    })
})