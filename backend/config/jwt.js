const jwt = require("jsonwebtoken");


const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET must be set to a unique, random value of at least 32 characters."
    );
  }
  return secret;
};

const signAuthToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES || "90d",
  });

module.exports = { getJwtSecret, signAuthToken };
