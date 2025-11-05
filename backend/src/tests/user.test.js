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

dotenv.config({ path: '.env.test' })

// ------------------ EXPRESS SETUP ------------------
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/auth', userRoutes)

let mongoServer

beforeAll(async () => {
    process.env.JWT_SECRET = 'supersecretfortests'
    jest.spyOn(console, 'error').mockImplementation(() => { })
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

afterEach(async () => {
    await User.deleteMany({})
})

// ------------------ REGISTER ------------------
describe('POST /auth/register', () => {
    it('creates a new user and returns token', async () => {
        const res = await request(app).post('/auth/register').send({
            username: 'newuser',
            password: 'password123'
        })
        expect(res.statusCode).toBe(201)
        expect(res.body.user.username).toBe('newuser')
        expect(res.body.token).toBeDefined()
    })

    it('returns 409 if username exists', async () => {
        await new User({ username: 'existuser', password: 'password123' }).save()
        const res = await request(app).post('/auth/register').send({
            username: 'existuser',
            password: 'password123'
        })
        expect(res.statusCode).toBe(409)
        expect(res.body.message).toBe('User already exists')
    })

    it('returns 422 for invalid input', async () => {
        const res = await request(app).post('/auth/register').send({ username: '', password: 'password123' })
        expect(res.statusCode).toBe(422)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })
})

// ------------------ LOGIN ------------------
describe('POST /auth/login', () => {
    it('logs in successfully with valid credentials', async () => {
        const user = new User({ username: 'loginuser', password: 'password123' })
        await user.save()
        const res = await request(app).post('/auth/login').send({
            username: 'loginuser',
            password: 'password123'
        })
        expect(res.statusCode).toBe(200)
        expect(res.body.user.username).toBe('loginuser')
        expect(res.body.token).toBeDefined()
    })

    it('fails login with wrong credentials', async () => {
        const user = new User({ username: 'wronguser', password: 'password123' })
        await user.save()
        const res = await request(app).post('/auth/login').send({
            username: 'wronguser',
            password: 'wrongpass'
        })
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Invalid credentials')
    })

    it('returns 422 if missing username or password', async () => {
        let res = await request(app).post('/auth/login').send({ username: 'loginuser' })
        expect(res.statusCode).toBe(422)
        res = await request(app).post('/auth/login').send({ password: 'password123' })
        expect(res.statusCode).toBe(422)
    })
})

// ------------------ LOGOUT ------------------
describe('POST /auth/logout', () => {
    it('logs out successfully', async () => {
        const res = await request(app).post('/auth/logout')
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Logout successful')
    })
})

// ------------------ USER MODEL ------------------
describe('User model', () => {
    it('hashes password before save', async () => {
        const user = new User({ username: 'hash', password: 'mypassword' })
        await user.save()
        expect(user.password).not.toBe('mypassword')
    })

    it('compares passwords correctly', async () => {
        const user = new User({ username: 'compare', password: 'mypassword' })
        await user.save()
        expect(await user.matchPassword('mypassword')).toBe(true)
        expect(await user.matchPassword('wrong')).toBe(false)
    })

    it('skips hashing if password not modified', async () => {
        const user = new User({ username: 'nomod', password: 'password123' })
        await user.save()
        const originalHash = user.password
        user.username = 'changed'
        await user.save()
        expect(user.password).toBe(originalHash)
    })

    it('throws if bcrypt.hash fails', async () => {
        jest.spyOn(bcrypt, 'hash').mockImplementation(() => { throw new Error('fail') })
        const user = new User({ username: 'error', password: 'password123' })
        await expect(user.save()).rejects.toThrow('fail')
        bcrypt.hash.mockRestore()
    })
})

// ------------------ JOI VALIDATION ------------------
describe('Joi validation', () => {
    it('register input fails validation', async () => {
        const res = await request(app).post('/auth/register').send({
            username: '',        
            password: '123'       
        })
        expect(res.statusCode).toBe(422)
        expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('login input fails validation', async () => {
        const res = await request(app).post('/auth/login').send({ username: '', password: '' })
        expect(res.statusCode).toBe(422)
    })
})