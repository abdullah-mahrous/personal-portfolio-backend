const Joi = require("joi");
const xss = require("xss");

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return xss(str.trim());
};

const validateNote = (data) => {
  const schema = Joi.object({
    id: Joi.string(),
    title: Joi.string().required().max(200).trim(),
    content: Joi.string().required().trim(),
    readTime: Joi.number().required().min(1),
    imgURL: Joi.string().allow(null),
    imgId: Joi.string().allow(null),
  });

  const { error, value } = schema.validate(data);

  // Sanitize string fields after validation
  if (!error && value) {
    value.title = sanitizeString(value.title);
    value.content = sanitizeString(value.content);
  }

  return { error, value };
};

const validateComment = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).trim(),
    content: Joi.string().required().max(1000).trim(),
  });

  const { error, value } = schema.validate(data);

  // Sanitize string fields after validation
  if (!error && value) {
    value.name = sanitizeString(value.name);
    value.content = sanitizeString(value.content);
  }

  return { error, value };
};

const validateAdminLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateNote,
  validateComment,
  validateAdminLogin,
  sanitizeString,
};
