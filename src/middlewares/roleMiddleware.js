// checkRole recibe cualquier cantidad de roles permitidos (rest operator) y los agrupa en un array
const checkRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.userLogged.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: you don't have permission to access this resource",
      });
    }

    next();
  };
};

export { checkRole };