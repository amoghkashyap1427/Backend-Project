const errorHandler = (err, req, res, next) => {
  // If a response is already partly sent, let Express close it
  if (res.headersSent) return next(err);

  const isProd = process.env.NODE_ENV === "production";
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    // Mongoose schema validation (required, minlength, match...)
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    // e.g. a malformed ObjectId in a URL
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    // Duplicate key from a unique index
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`;
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    status = 401;
    message = "Invalid or expired token";
  } else if (err.type === "entity.parse.failed") {
    // express.json() received malformed JSON
    status = 400;
    message = "Malformed JSON in request body";
  }

  if (status >= 500) {
    console.error(err);
    if (isProd) message = "Internal server error";
  }

  res.status(status).json({
    message,
    ...(!isProd && status >= 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;