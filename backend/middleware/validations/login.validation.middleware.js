const loginSchema = require("../../schemas/login_validation.schema");
const { securityLogger } = require("../../utils/logger");

//const loginSchema = require("../schemas/login_validation.schema");

const loginValidation = async (req, res, next) => {
  const payload = {
    nic: req.body.nic,
    password: req.body.password,
  };

  const { error, value } = loginSchema.validate(payload);

  if (error) {
    securityLogger.error(
      `Login validation failed - NIC: ${value.nic || 'N/A'}, Error: ${error.message}`
    );
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = loginValidation;