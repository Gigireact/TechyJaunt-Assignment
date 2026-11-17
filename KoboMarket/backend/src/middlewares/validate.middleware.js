
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details,
        },
      });
    }

    // Store validated data for use by controllers
    req.validated = req.validated || {};
    req.validated[property] = value;

    // Keep existing controllers working with validated body data
    if (property === "body") {
      req.body = value;
    }

    next();
  };
};

module.exports = validate;
