import Joi from 'joi'

// Validation schema for user registration
export const registerSchema = Joi.object({
    username: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 6 characters',
            'any.required': 'Username is required'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        })
})

// Validation schema for user login
export const loginSchema = Joi.object({
    username: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 6 characters',
            'any.required': 'Username is required'
        }),
    password: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
})