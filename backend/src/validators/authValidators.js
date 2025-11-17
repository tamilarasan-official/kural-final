const Joi = require('joi');

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot be more than 50 characters',
            'any.required': 'Name is required'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
        role: Joi.string().valid('user', 'admin').optional()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().optional().messages({
            'string.email': 'Please provide a valid email address'
        }),
        phone: Joi.alternatives().try(
            Joi.string().pattern(/^[0-9]{10}$/),
            Joi.number()
        ).optional().messages({
            'string.pattern.base': 'Phone must be a 10-digit number'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required'
        })
    }).or('email', 'phone').messages({
        'object.missing': 'Either email or phone is required'
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin
};