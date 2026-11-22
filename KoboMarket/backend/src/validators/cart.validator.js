const Joi = require("joi");

const addToCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).unsafe(false).required(),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).unsafe(false).required(),
});

const cartProductIdSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  cartProductIdSchema,
};