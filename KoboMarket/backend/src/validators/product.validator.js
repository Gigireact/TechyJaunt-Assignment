const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),

  description: Joi.string().trim().min(10).max(1000).required(),

  category: Joi.string().trim().min(2).max(50).required(),

  priceKobo: Joi.number().integer().positive().unsafe(false).required(),

  stockQuantity: Joi.number().integer().min(0).unsafe(false).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100),

  description: Joi.string().trim().min(10).max(1000),

  category: Joi.string().trim().min(2).max(50),

  priceKobo: Joi.number().integer().positive().unsafe(false),

  stockQuantity: Joi.number().integer().min(0).unsafe(false),

  status: Joi.string().valid("active", "inactive"),
}).min(1);

const productIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});


const getAllProductsSchema = Joi.object({
  category: Joi.string().trim().min(2).max(50),

  search: Joi.string().trim().min(1).max(100),

  page: Joi.number().integer().min(1),

  limit: Joi.number().integer().min(1).max(50),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  getAllProductsSchema,
};