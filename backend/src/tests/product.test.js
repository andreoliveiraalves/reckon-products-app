import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import productRoutes from '../routes/productRoutes.js'
import userRoutes from '../routes/userRoutes.js'
import { Product } from '../models/productModel.js'
import { User } from '../models/userModel.js'

// ------------------ ENVIRONMENT SETUP ------------------
dotenv.config({ path: '.env.test' })

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/auth', userRoutes)
app.use('/products', productRoutes)

let mongoServer
let authToken

beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
})

beforeEach(async () => {
    await User.deleteMany({})
    await Product.deleteMany({})

    const user = new User({ username: 'testuser', password: 'password123' })
    await user.save()

    authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

// ------------------ POST /products ------------------
describe('POST /products', () => {

    it('should create a product with valid data when authenticated', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Test Product', description: 'A product for testing', price: 100 })

        expect(res.statusCode).toBe(201)
        expect(res.body.product.priceHistory.length).toBe(1)
    })

    it('should fail validation with invalid data when authenticated', async () => {
        const invalidBodies = [
            { name: '', description: 'Missing', price: 50 },
            { name: 'Prod', description: 'Desc', price: -10 },
            {},
            null
        ]

        for (const body of invalidBodies) {
            const res = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send(body || {})

            expect(res.statusCode).toBe(422)
        }
    })

    it('should fail authentication', async () => {
        const res1 = await request(app)
            .post('/products')
            .send({ name: 'Prod', description: 'Desc', price: 10 })
        expect(res1.statusCode).toBe(401)

        const res2 = await request(app)
            .post('/products')
            .set('Authorization', `Bearer invalidtoken`)
            .send({ name: 'Prod', description: 'Desc', price: 10 })
        expect(res2.statusCode).toBe(401)
    })

    it('should handle server errors', async () => {
        jest.spyOn(Product, 'create').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Fail', description: 'DB fail', price: 100 })

        expect(res.statusCode).toBe(500)
        Product.create.mockRestore()
    })
})

// ------------------ PATCH /products/:id ------------------
describe('PATCH /products/:id', () => {
    let product

    beforeEach(async () => {
        product = await Product.create({ name: 'Old Product', description: 'Old Desc', price: 100 })
    })

    it('should update product partially and add priceHistory if price changes', async () => {
        const res = await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ description: 'New Desc', price: 150 })

        expect(res.statusCode).toBe(200)
        expect(res.body.product.description).toBe('New Desc')
        expect(res.body.product.priceHistory.length).toBe(2)
    })

    it('should not update priceHistory if price unchanged', async () => {
        const res = await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'New Name' })

        expect(res.body.product.priceHistory.length).toBe(1)
    })

    it('should handle invalid product or data', async () => {
        const fakeId = new mongoose.Types.ObjectId()

        const res404 = await request(app)
            .patch(`/products/${fakeId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ price: 200 })
        expect(res404.statusCode).toBe(404)

        const res422 = await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ price: -50 })
        expect(res422.statusCode).toBe(422)
    })

    it('should fail authentication', async () => {
        const res = await request(app)
            .patch(`/products/${product._id}`)
            .send({ price: 123 })

        expect(res.statusCode).toBe(401)
    })
})

// ------------------ Product Model ------------------
describe('Product model', () => {
    it('should initialize priceHistory and _createdBy defaults', async () => {
        const p = await Product.create({ name: 'Prod', description: 'Desc', price: 50 })
        expect(p.priceHistory.length).toBe(1)
        expect(p.priceHistory[0].updatedBy).toBe('Unknown')
        expect(p._createdBy).toBe('Unknown')
    })

    it('should add priceHistory when price changes, using _updatedBy fallback', async () => {
        const p = await Product.create({ name: 'Prod2', description: 'Desc', price: 50 })
        p.price = 75
        p._updatedBy = ''
        await p.save()
        expect(p.priceHistory.length).toBe(2)
        expect(p.priceHistory[1].updatedBy).toBe('Unknown')
    })

    it('should not add priceHistory if only other fields change', async () => {
        const p = await Product.create({ name: 'Prod3', description: 'Desc', price: 20 })
        const initial = p.priceHistory.length
        p.description = 'New Desc'
        await p.save()
        expect(p.priceHistory.length).toBe(initial)
    })

    it('should throw validation errors for invalid fields', async () => {
        const p = new Product({ name: '', description: '', price: -10 })
        await expect(p.save()).rejects.toThrow()
    })
})
