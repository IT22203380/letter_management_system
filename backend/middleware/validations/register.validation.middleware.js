const registerSchema = require("../../schemas/register_validation.schema");
const { securityLogger } = require("../../utils/logger");

const registerValidation = async (req, res, next) => {
  const payload = {
    nic: req.body.nic,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  };

  const { error, value } = registerSchema.validate(payload);

  if (error) {
    securityLogger.error(
      `Registration validation failed - NIC: ${value.nic || 'N/A'}, Username: ${value.username || 'N/A'}, Error: ${error.message}`
    );
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  // Add validated data to request
  req.validatedData = value;
  next();
};

module.exports = registerValidation;