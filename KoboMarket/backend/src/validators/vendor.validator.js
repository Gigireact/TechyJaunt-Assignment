const Joi = require("joi");

const vendorApplicationSchema = Joi.object({
  storeName: Joi.string().trim().min(3).max(100).required(),

  description: Joi.string().trim().min(10).max(500).required(),
});

module.exports = {
  vendorApplicationSchema,
};