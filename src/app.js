const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsing and method override middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "..", "public")));

// Session middleware for authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sdn302_tuan_shop_secret_key_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true
    }
  })
);

// Global middleware to pass currentUser to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/", orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
