// Middleware genérico de validación con Zod
const validate = (schema) => {
  return (req, res, next) => {
       // safeParse valida sin tirar excepción:
    // si falla devuelve los errores, si pasa reemplaza el body con los datos ya validados y tipados
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};

export { validate };