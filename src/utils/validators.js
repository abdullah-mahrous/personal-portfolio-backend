const Joi = require("joi");

const validateNote = (data) => {
  const schema = Joi.object({
    id: Joi.string(),
    title: Joi.string().required().max(200),
    content: Joi.string().required(),
    readTime: Joi.number().required().min(1),
    imgURL: Joi.string().allow(null),
    imgId: Joi.string().allow(null),
  });

  return schema.validate(data);
};

const validateComment = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100),
    content: Joi.string().required().max(1000),
  });

  return schema.validate(data);
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
};
