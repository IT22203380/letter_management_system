const Joi = require('joi');

const loginSchema = Joi.object({
  nic: Joi.string().pattern(/^(\d{9}[vV]|\d{12})$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid NIC number',
      'string.empty': 'NIC is required',
      'any.required': 'NIC is required'
    }),
  password: Joi.string().min(6).max(60).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

module.exports = loginSchema;