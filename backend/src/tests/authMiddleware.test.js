import { jest } from '@jest/globals'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { verifyJWT } from '../middleware/authMiddleware.js'
import { User } from '../models/userModel.js'

dotenv.config({ path: '.env.test' })

describe('verifyJWT middleware', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'testsecret'

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should call next() and attach user when token is valid (from cookies)', async () => {
        process.env.JWT_SECRET = JWT_SECRET
        const fakeUser = { _id: '507f1f77bcf86cd799439011', username: 'validuser', isActive: true }
        const token = jwt.sign({ id: fakeUser._id }, process.env.JWT_SECRET)
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(fakeUser)
        })

        const req = { cookies: { token }, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(User.findById).toHaveBeenCalledWith(fakeUser._id)
        expect(req.user).toEqual(fakeUser)
        expect(next).toHaveBeenCalled()
    })

    it('should extract token from Authorization header when provided', async () => {
        process.env.JWT_SECRET = JWT_SECRET
        const fakeUser = { _id: '507f1f77bcf86cd799439099', username: 'headeruser', isActive: true }
        const token = jwt.sign({ id: fakeUser._id }, process.env.JWT_SECRET)
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(fakeUser)
        })

        const req = {
            cookies: {},
            header: jest.fn().mockReturnValue(`Bearer ${token}`)
        }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(req.user).toEqual(fakeUser)
        expect(next).toHaveBeenCalled()
    })

    it('should return 401 if token is missing', async () => {
        const req = { cookies: {}, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Authentication required',
            details: 'No valid token provided'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 if token is invalid', async () => {
        process.env.JWT_SECRET = JWT_SECRET
        const req = { cookies: { token: 'invalidtoken' }, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid token',
            details: 'Authentication failed'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 if user is not found or inactive', async () => {
        process.env.JWT_SECRET = JWT_SECRET
        const fakeToken = jwt.sign({ id: '507f1f77bcf86cd799439012' }, process.env.JWT_SECRET)
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        })

        const req = { cookies: { token: fakeToken }, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Forbidden',
            details: 'User account not found or inactive'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 with TokenExpiredError', async () => {
        const expiredToken = jwt.sign({ id: '507f1f77bcf86cd799439013' }, JWT_SECRET, { expiresIn: -1 })
        const req = { cookies: { token: expiredToken }, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token expired',
            details: 'Please authenticate again'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle internal jwt.verify errors gracefully', async () => {
        const spy = jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Token verification failed')
        })
        const req = { cookies: { token: 'whatever' }, header: jest.fn().mockReturnValue(null) }
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
        const next = jest.fn()

        await verifyJWT(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid token',
            details: 'Authentication failed'
        })
        expect(next).not.toHaveBeenCalled()

        spy.mockRestore()
    })
})