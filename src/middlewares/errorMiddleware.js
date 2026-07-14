const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Error de ID inválido de MongoDB
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export { errorHandler };