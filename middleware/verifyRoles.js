//note that verify roles middleware is called only after verifyJWT has been called on the entire route
//so the request coming in here are from the the previous middleware
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.status(401).send("Unauthorized");
    const rolesArray = [...allowedRoles];
    console.log(rolesArray);
    console.log(req.roles);
    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((value) => value === true);
    if (!result) return res.status(401).send("Unauthorized");
    next();
  };
};

module.exports = verifyRoles;
