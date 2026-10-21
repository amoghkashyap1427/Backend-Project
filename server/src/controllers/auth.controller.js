const User = require("../models/User");
const { generateToken, cookieOptions } = require("../utils/generateToken");

const RESERVED_USERNAMES = ["api", "login", "register", "dashboard", "admin"];

// Shape of the user object we send to the client (never includes password)
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  bio: user.bio,
});

// POST /api/auth/register
const register = async (req, res) => {
  const { name, username, email, password, bio } = req.body || {};

  if (!name || !username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, username, email and password are required" });
  }

  if (
    typeof name !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    (bio !== undefined && typeof bio !== "string")
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const cleanUsername = username.toLowerCase().trim();
  const cleanEmail = email.toLowerCase().trim();

  if (RESERVED_USERNAMES.includes(cleanUsername)) {
    return res.status(400).json({ message: "This username is not available" });
  }

  const existing = await User.findOne({
    $or: [{ email: cleanEmail }, { username: cleanUsername }],
  });
  if (existing) {
    const field = existing.email === cleanEmail ? "Email" : "Username";
    return res.status(409).json({ message: `${field} is already taken` });
  }

  const user = await User.create({
    name,
    username: cleanUsername,
    email: cleanEmail,
    password,
    bio,
  });

  generateToken(res, user._id);
  res.status(201).json(sanitizeUser(user));
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  generateToken(res, user._id);
  res.json(sanitizeUser(user));
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
};

// GET /api/auth/me  (auth middleware has already set req.user)
const me = (req, res) => {
  res.json(sanitizeUser(req.user));
};

module.exports = { register, login, logout, me };