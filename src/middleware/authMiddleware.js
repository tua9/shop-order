const jwt = require("jsonwebtoken");

// Middleware to protect Web routes (EJS forms/pages)
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  // Not logged in -> save target redirect url & go to login page
  const redirectUrl = req.originalUrl || '/';
  const message = encodeURIComponent("Vui lòng đăng nhập trước khi thực hiện thao tác này.");
  return res.redirect(`/login?error=${message}&redirect=${encodeURIComponent(redirectUrl)}`);
};

// Middleware to protect REST API endpoints
const authenticate = (req, res, next) => {
  // If user already authenticated via session
  if (req.session && req.session.user) {
    req.auth = req.session.user;
    return next();
  }

  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  const secret = process.env.JWT_SECRET || "default_jwt_secret_key_sdn302";
  try {
    req.auth = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorize =
  (...roles) =>
    (req, res, next) => {
      const userRole = req.auth?.role || req.session?.user?.role;
      if (!userRole || !roles.includes(userRole)) {
        if (req.headers.accept && req.headers.accept.includes("text/html")) {
          return res.status(403).send("Bạn không có quyền thực hiện hành động này.");
        }
        return res
          .status(403)
          .json({ message: "You are not authorized to perform this action" });
      }
      return next();
    };

module.exports = { requireLogin, authenticate, authorize };
