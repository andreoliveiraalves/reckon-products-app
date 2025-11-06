import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Product } from '../models/productModel.js'
import productRoutes from '../routes/productRoutes.js'
import { User } from '../models/userModel.js'

// ------------------ ENVIRONMENT SETUP ------------------
dotenv.config({ path: '.env.test' })

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/products', productRoutes)

let mongoServer
let authToken

beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => { })
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
})

beforeEach(async () => {
    await User.deleteMany({})
    await Product.deleteMany({})

    const user = new User({ username: 'devUser', password: 'devpass123' })
    await user.save()

    authToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' })
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

// ------------------ POST /products/test/generate ------------------
describe('POST /products/test/generate', () => {

    it('should create 30 random products by default', async () => {
        const res = await request(app)
            .post('/products/test/generate')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(201)
        expect(res.body.count).toBe(30)
        expect(res.body.message).toContain('30 random products created successfully')

        const products = await Product.find()
        expect(products.length).toBe(30)
    })

    it('should create a custom number of random products', async () => {
        const res = await request(app)
            .post('/products/test/generate')
            .query({ count: 10 })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(201)
        expect(res.body.count).toBe(10)

        const products = await Product.find()
        expect(products.length).toBe(10)
    })

    it('should fail authentication without a valid token', async () => {
        const res = await request(app)
            .post('/products/test/generate')

        expect(res.statusCode).toBe(401)
    })

    it('should handle server errors gracefully', async () => {
        jest.spyOn(Product, 'insertMany').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/products/test/generate')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error while generating products')

        Product.insertMany.mockRestore()
    })
})

// ------------------ DELETE /products/products/test/clear ------------------
describe('DELETE /products/products/test/clear', () => {

    beforeEach(async () => {
        const sampleProducts = Array.from({ length: 5 }, (_, i) => ({
            name: `Sample ${i}`,
            description: `Desc ${i}`,
            price: 10 * i
        }))
        await Product.insertMany(sampleProducts)
    })

    it('should remove all products successfully', async () => {
        const res = await request(app)
            .delete('/products/test/clear')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.deletedCount).toBe(5)
        expect(res.body.message).toBe('All products removed successfully')

        const count = await Product.countDocuments()
        expect(count).toBe(0)
    })

    it('should succeed even when there are no products', async () => {
        await Product.deleteMany({})

        const res = await request(app)
            .delete('/products/test/clear')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.deletedCount).toBe(0)
    })

    it('should fail authentication without token or with invalid token', async () => {
        const res1 = await request(app).delete('/products/test/clear')
        expect(res1.statusCode).toBe(401)

        const res2 = await request(app)
            .delete('/products/test/clear')
            .set('Authorization', 'Bearer invalidtoken')
        expect(res2.statusCode).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
        jest.spyOn(Product, 'deleteMany').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .delete('/products/test/clear')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error while removing products')

        Product.deleteMany.mockRestore()
    })
})