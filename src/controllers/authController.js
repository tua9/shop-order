const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// GET /login - Show login page
const getLoginPage = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }
  const error = req.query.error || null;
  const redirectUrl = req.query.redirect || "/";
  res.render("login", { error, redirectUrl, formData: {} });
};

// POST /login - Handle user login
const login = async (req, res) => {
  try {
    const { username, password, redirect: redirectUrl } = req.body ?? {};
    const targetRedirect = redirectUrl || "/";
    const isApiRequest = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json") && !req.headers.accept.includes("text/html"));

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      const errorMsg = "Vui lòng nhập tên đăng nhập và mật khẩu.";
      if (isApiRequest) {
        return res.status(400).json({ message: errorMsg });
      }
      return res.render("login", {
        error: errorMsg,
        redirectUrl: targetRedirect,
        formData: { username }
      });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      const errorMsg = "Tên đăng nhập hoặc mật khẩu không đúng.";
      if (isApiRequest) {
        return res.status(401).json({ message: errorMsg });
      }
      return res.render("login", {
        error: errorMsg,
        redirectUrl: targetRedirect,
        formData: { username }
      });
    }

    // Save user to session
    req.session.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      fullName: user.fullName
    };

    if (isApiRequest) {
      const secret = process.env.JWT_SECRET || "default_jwt_secret_key_sdn302";
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          fullName: user.fullName
        },
        secret,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        message: "Login successful",
        token,
        user: req.session.user
      });
    }

    // Redirect to intended page or home
    return res.redirect(targetRedirect);
  } catch (error) {
    console.error("Error during login:", error);
    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.render("login", {
      error: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
      redirectUrl: req.body?.redirect || "/",
      formData: { username: req.body?.username }
    });
  }
};

// GET /register - Show register page
const getRegisterPage = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }
  const error = req.query.error || null;
  const redirectUrl = req.query.redirect || "/";
  res.render("register", { error, redirectUrl, formData: {} });
};

// POST /register - Handle user registration
const register = async (req, res) => {
  try {
    const { username, password, fullName, redirect: redirectUrl } = req.body ?? {};
    const targetRedirect = redirectUrl || "/";
    const isApiRequest = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json") && !req.headers.accept.includes("text/html"));

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      const errorMsg = "Tên đăng nhập bắt buộc và mật khẩu phải từ 6 ký tự trở lên.";
      if (isApiRequest) {
        return res.status(400).json({ message: errorMsg });
      }
      return res.render("register", {
        error: errorMsg,
        redirectUrl: targetRedirect,
        formData: { username, fullName }
      });
    }

    if (typeof fullName !== "string" || !fullName.trim()) {
      const errorMsg = "Họ và tên là bắt buộc.";
      if (isApiRequest) {
        return res.status(400).json({ message: errorMsg });
      }
      return res.render("register", {
        error: errorMsg,
        redirectUrl: targetRedirect,
        formData: { username, fullName }
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) {
      const errorMsg = "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.";
      if (isApiRequest) {
        return res.status(409).json({ message: errorMsg });
      }
      return res.render("register", {
        error: errorMsg,
        redirectUrl: targetRedirect,
        formData: { username, fullName }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
      role: "user",
      fullName: fullName.trim()
    });

    // Auto-login newly registered user
    req.session.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      fullName: user.fullName
    };

    if (isApiRequest) {
      const secret = process.env.JWT_SECRET || "default_jwt_secret_key_sdn302";
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          fullName: user.fullName
        },
        secret,
        { expiresIn: "1d" }
      );
      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: req.session.user
      });
    }

    return res.redirect(targetRedirect);
  } catch (error) {
    console.error("Error during registration:", error);
    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.render("register", {
      error: "Đã xảy ra lỗi hệ thống: " + error.message,
      redirectUrl: req.body?.redirect || "/",
      formData: { username: req.body?.username, fullName: req.body?.fullName }
    });
  }
};

// GET /logout or POST /logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
};

module.exports = {
  getLoginPage,
  login,
  getRegisterPage,
  register,
  logout
};
