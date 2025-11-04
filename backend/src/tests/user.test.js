import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import express from 'express'
import bcrypt from 'bcryptjs'
import userRoutes from '../routes/userRoutes.js'
import { User } from '../models/userModel.js'
import dotenv from 'dotenv'

// Load environment variables from a test-specific .env file
dotenv.config({ path: '.env.test' })

// Create a test instance of the Express app
const app = express()
app.use(express.json())
app.use('/users', userRoutes)

let mongoServer

beforeAll(async () => {
    process.env.JWT_SECRET = 'supersecretfortests'

    // Silence error logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => {})

    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
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

// ------------------ CONTROLLER TESTS ------------------

describe('POST /users/register', () => {
    it('should create a new user and return a token', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({ username: 'testuser', password: 'password123' })

        expect(res.statusCode).toBe(201)
        expect(res.body.user.username).toBe('testuser')
        expect(res.body.token).toBeDefined()
    })

    it('should fail if username already exists', async () => {
        await request(app)
            .post('/users/register')
            .send({ username: 'testuser', password: 'password123' })

        const res = await request(app)
            .post('/users/register')
            .send({ username: 'testuser', password: 'password123' })

        expect(res.statusCode).toBe(409)
    })

    it('should fail if validation fails', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({ username: '', password: '123' })

        expect(res.statusCode).toBe(422)
    })

    it('should handle unexpected server errors', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/users/register')
            .send({ username: 'failuser', password: 'password123' })

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error')

        User.findOne.mockRestore()
    })
})

// ------------------ MODEL TESTS ------------------


describe('User model', () => {
    it('should hash password before save', async () => {
        const user = new User({ username: 'hashuser', password: 'mypassword' })
        await user.save()
        expect(user.password).not.toBe('mypassword')
    })

    it('should compare passwords correctly', async () => {
        const user = new User({ username: 'compareuser', password: 'mypassword' })
        await user.save()

        const match = await user.matchPassword('mypassword')
        const noMatch = await user.matchPassword('wrongpassword')

        expect(match).toBe(true)
        expect(noMatch).toBe(false)
    })

    it('should handle bcrypt hash errors', async () => {
        jest.spyOn(bcrypt, 'hash').mockImplementation(() => { throw new Error('Hash fail') })

        const user = new User({ username: 'erroruser', password: 'mypassword' })
        await expect(user.save()).rejects.toThrow('Hash fail')

        bcrypt.hash.mockRestore()
    })

    it('should skip hashing if password is not modified', async () => {
        const user = new User({ username: 'nomod', password: 'mypassword' })
        await user.save()
        const originalHash = user.password

        // Modify username only
        user.username = 'changed'
        await user.save()
        expect(user.password).toBe(originalHash)
    })
})