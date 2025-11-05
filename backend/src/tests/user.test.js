import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import express from 'express'
import bcrypt from 'bcryptjs'
import userRoutes from '../routes/userRoutes.js'
import { User } from '../models/userModel.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Load environment variables from a test-specific .env file
dotenv.config({ path: '.env.test' })

// Create a test instance of the Express app
const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/auth', userRoutes)

let mongoServer

beforeAll(async () => {
    process.env.JWT_SECRET = 'supersecretfortests'

    // Silence error logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => { })

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

describe('POST /auth/register', () => {
    it('should create a new user and return a token', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' })

        expect(res.statusCode).toBe(201)
        expect(res.body.user.username).toBe('testuser')
        expect(res.body.token).toBeDefined()
    })

    it('should fail if username already exists', async () => {
        await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' })

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' })

        expect(res.statusCode).toBe(409)
    })

    it('should fail if validation fails', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: '', password: '123' })

        expect(res.statusCode).toBe(422)
    })

    it('should handle unexpected server errors', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'failuser', password: 'password123' })

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error')

        User.findOne.mockRestore()
    })
    it('should fail if req.body is undefined', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send()
        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })
})

describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
        // Create user directly to ensure pre-save hook hashes password
        const user = new User({ username: 'loginuser', password: 'password123' })
        await user.save()

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'loginuser', password: 'password123' })

        expect(res.statusCode).toBe(200)
        expect(res.body.user.username).toBe('loginuser')
        expect(res.body.token).toBeDefined()
    })

    it('should fail login with incorrect password', async () => {
        const user = new User({ username: 'wrongpass', password: 'password123' })
        await user.save()

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'wrongpass', password: 'wrongpassword' })

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Invalid credentials')
    })

    it('should fail login with non-existent username', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'nouser', password: 'password123' })

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Invalid credentials')
    })

    it('should fail login if username or password is missing', async () => {
        let res = await request(app)
            .post('/auth/login')
            .send({ username: 'loginuser' }) // missing password

        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)

        res = await request(app)
            .post('/auth/login')
            .send({ password: 'password123' }) // missing username

        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('should handle unexpected server errors', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB fail'))

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'failuser', password: 'password123' })

        expect(res.statusCode).toBe(500)
        expect(res.body.message).toBe('Server error')

        User.findOne.mockRestore()
    })
    it('should fail if req.body is undefined', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send()
        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })
})

describe('POST /auth/logout', () => {
    it('should logout successfully if user is logged in', async () => {
        // Creates user and attempts to login
        const user = new User({ username: 'logoutuser', password: 'password123' })
        await user.save()

        const loginRes = await request(app)
            .post('/auth/login')
            .send({ username: 'logoutuser', password: 'password123' })

        const cookie = loginRes.headers['set-cookie']

        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', cookie)
            .send()

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Logout successful')
        // Confirma cookie was cleared
        expect(res.headers['set-cookie'][0]).toContain('token=;')
    })

    it('should fail logout if user is not logged in', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .send()

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Not authorized, no token')
    })
})

// ------------------ MIDDLEWARE TESTS ------------------

describe('Auth middleware', () => {
    it('should fail if token is invalid', async () => {
        // Usa um cookie com token inválido
        const res = await request(app)
            .post('/auth/logout') // rota protegida
            .set('Cookie', ['token=invalidtoken'])
            .send()

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Not authorized, token failed')
    })

    it('should fail if token is missing', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .send()

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Not authorized, no token')
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

// ------------------ VALIDATION TESTS ------------------

describe('Joi validation errors', () => {
    it('should return 422 if register input fails validation', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: '', password: '123' })

        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('should return 422 if login input fails validation', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: '', password: '' })
        expect(res.statusCode).toBe(422)
        expect(res.body.errors).toBeDefined()
        expect(Array.isArray(res.body.errors)).toBe(true)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })
})