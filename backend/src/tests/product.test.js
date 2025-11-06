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
    jest.spyOn(console, 'error').mockImplementation(() => { })
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

// ------------------ DELETE PRODUCT  ------------------
describe('DELETE /products/:id', () => {
    let product

    beforeEach(async () => {
        product = await Product.create({ name: 'DeleteMe', description: 'To be deleted', price: 100 })
    })

    it('should delete a product successfully when authenticated', async () => {
        const res = await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Product deleted successfully')

        // Ensure the product is really gone
        const check = await Product.findById(product._id)
        expect(check).toBeNull()
    })

    it('should return 404 if product does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const res = await request(app)
            .delete(`/products/${fakeId}`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(404)
        expect(res.body.message).toBe('Product not found')
    })

    it('should return 400 for invalid product ID format', async () => {
        const res = await request(app)
            .delete('/products/invalid-id')
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('Invalid product ID format')
    })

    it('should fail authentication without token or with invalid token', async () => {
        const res1 = await request(app).delete(`/products/${product._id}`)
        expect(res1.statusCode).toBe(401)

        const res2 = await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', 'Bearer invalidtoken')
        expect(res2.statusCode).toBe(401)
    })

    it('should handle server errors gracefully', async () => {
        jest.spyOn(Product, 'findById').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error')

        Product.findById.mockRestore()
    })
})

/// ------------------ GET /products ------------------
describe('GET /products', () => {
    let products = []

    // Create various products to test pagination and filtering
    beforeEach(async () => {
        products = [
            { name: 'Apple', description: 'Fruit', price: 10 },
            { name: 'Desk', description: 'Furniture', price: 100 },
            { name: 'Chair', description: 'Furniture', price: 50 },
            { name: 'Carrot', description: 'Vegetable', price: 7 },
            // more generic products to test pagination
        ]
        for (let i = 1; i <= 26; i++) {
            products.push({ name: `Product ${i}`, description: `Description ${i}`, price: i })
        }
        products = await Product.insertMany(products)
    })

    // ---------------- Filters ----------------
    it('should filter products by name (case-insensitive)', async () => {
        const res = await request(app)
            .get('/products')
            .query({ name: 'apple' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(1)
        expect(res.body.products[0].name).toBe('Apple')
    })

    it('should filter products by description', async () => {
        const res = await request(app)
            .get('/products')
            .query({ description: 'furniture' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(2)
        expect(res.body.products.map(p => p.name)).toEqual(expect.arrayContaining(['Desk', 'Chair']))
    })

    it('should filter products by minPrice and maxPrice', async () => {
        const res = await request(app)
            .get('/products')
            .query({ minPrice: 6, maxPrice: 50 })
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)

        const expected = products
            .filter(p => p.price >= 6 && p.price <= 50)
            .map(p => p.name)

        const actual = res.body.products.map(p => p.name)

        // Verifies the products are returned has expected
        expect(actual.every(name => expected.includes(name))).toBe(true)
    })


    it('should filter products by ID', async () => {
        const target = products[0]
        const res = await request(app)
            .get('/products')
            .query({ id: target._id.toString() })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(1)
        expect(res.body.products[0].name).toBe(target.name)
    })

    it('should filter products by combined filters', async () => {
        const res = await request(app)
            .get('/products')
            .query({ name: 'Product 1', minPrice: 5, maxPrice: 10 })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.every(p => p.name.includes('Product 1') && p.price >= 5 && p.price <= 10)).toBe(true)
    })

    // ---------------- Invalid parameters ----------------
    it('should return 400 for invalid ID', async () => {
        const res = await request(app)
            .get('/products')
            .query({ id: 'invalid-id' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    it('should return 400 for invalid minPrice', async () => {
        const res = await request(app)
            .get('/products')
            .query({ minPrice: 'abc' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    it('should return 400 for invalid maxPrice', async () => {
        const res = await request(app)
            .get('/products')
            .query({ maxPrice: 'xyz' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    it('should return 400 for invalid sortOrder', async () => {
        const res = await request(app)
            .get('/products')
            .query({ sortBy: 'price', sortOrder: 'upwards' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    it('should return 400 for invalid sortBy', async () => {
        const res = await request(app)
            .get('/products')
            .query({ sortBy: 'unknownField', sortOrder: 'asc' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    // ---------------- Sorting ----------------
    it('should sort products by price ascending', async () => {
        const res = await request(app)
            .get('/products')
            .query({ sortBy: 'price', sortOrder: 'asc' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        const prices = res.body.products.map(p => p.price)
        const sorted = [...prices].sort((a, b) => a - b)
        expect(prices).toEqual(sorted)
    })

    it('should sort products by price descending', async () => {
        const res = await request(app)
            .get('/products')
            .query({ sortBy: 'price', sortOrder: 'desc' })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        const prices = res.body.products.map(p => p.price)
        const sorted = [...prices].sort((a, b) => b - a)
        expect(prices).toEqual(sorted)
    })

    // ---------------- Pagination ----------------
    it('should return first 20 products by default', async () => {
        const res = await request(app)
            .get('/products')
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(20)
        expect(res.body.page).toBe(1)
        expect(res.body.total).toBe(30)
        expect(res.body.totalPages).toBe(2)
    })

    it('should return remaining products on second page', async () => {
        const res = await request(app)
            .get('/products')
            .query({ page: 2 })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(10)
        expect(res.body.page).toBe(2)
    })

    it('should return empty array if page exceeds totalPages', async () => {
        const res = await request(app)
            .get('/products')
            .query({ page: 999 })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products).toEqual([])
    })

    it('should allow custom limit for pagination', async () => {
        const res = await request(app)
            .get('/products')
            .query({ page: 1, limit: 5 })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.products.length).toBe(5)
        expect(res.body.limit).toBe(5)
        expect(res.body.page).toBe(1)
    })

    it('should handle invalid limit gracefully', async () => {
        const res = await request(app)
            .get('/products')
            .query({ limit: -5 })
            .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(400)
    })

    // ---------------- Authentication ----------------
    it('should fail authentication without token', async () => {
        const res = await request(app).get('/products')
        expect(res.statusCode).toBe(401)
    })

    it('should fail authentication with invalid token', async () => {
        const res = await request(app)
            .get('/products')
            .set('Authorization', 'Bearer invalidtoken')
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
