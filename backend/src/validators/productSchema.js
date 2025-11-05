import Joi from 'joi'

// Validation schema for creating a product (all fields required)
export const productSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters',
            'any.required': 'Name is required'
        }),
    description: Joi.string()
        .min(5)
        .required()
        .messages({
            'string.base': 'Description must be a string',
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 5 characters',
            'any.required': 'Description is required'
        }),
    price: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price must be a positive number',
            'any.required': 'Price is required'
        })
})

// Validation schema for partial updates (all fields optional)
export const partialProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name must be at least 3 characters'
        }),
    description: Joi.string()
        .min(5)
        .messages({
            'string.base': 'Description must be a string',
            'string.empty': 'Description cannot be empty',
            'string.min': 'Description must be at least 5 characters'
        }),
    price: Joi.number()
        .min(0)
        .messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price must be a positive number'
        })
})