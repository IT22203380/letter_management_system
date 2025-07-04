const jwt = require("jsonwebtoken");

// JWT credentials
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

const createToken = (user) => {
  // Extract role names from roles
  const roles = user.roles ? user.roles.map(role => role.role_name) : [];

  // Create access token payload
  const accessPayload = {
    id: user.id,
    nic: user.nic,
    roles: roles,
  };

  // Create refresh token payload
  const refreshPayload = {
    id: user.id,
  };

  // Create tokens
  const accessToken = jwt.sign(accessPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

module.exports = createToken;