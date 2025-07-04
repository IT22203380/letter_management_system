const Joi = require('joi');

const registerSchema = Joi.object({
  nic: Joi.string().pattern(/^(\d{9}[vV]|\d{12})$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid NIC number',
      'string.empty': 'NIC is required',
      'any.required': 'NIC is required'
    }),
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be at most 50 characters long',
    'string.empty': 'Username is required',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).max(60).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('user', 'admin', 'dataEntry').optional().default('user')
});

module.exports = registerSchema;