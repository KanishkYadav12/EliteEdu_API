const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 128 characters",
  });

exports.validateSignup = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: passwordSchema,
    confirmPassword: Joi.string().required(),
    accountType: Joi.string()
      .valid("Student", "Instructor", "Admin")
      .default("Student"),
    contactNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

exports.validateOTP = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(data);
};

exports.validatePasswordChange = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: passwordSchema,
    confirmPassword: Joi.string().required(),
  });

  return schema.validate(data);
};
