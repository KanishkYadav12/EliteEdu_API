require("dotenv").config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "3", 10),
  },
  bcrypt: {
    saltRounds: 12,
  },
  otp: {
    expiryMinutes: 10,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
  },
};
