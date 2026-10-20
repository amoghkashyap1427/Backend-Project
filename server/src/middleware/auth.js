const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  // 1. Read the token from the cookie
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // 2. Verify the signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // 3. Make sure the user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: "User no longer exists" });
  }

  // 4. Attach the user and hand over to the next function
  req.user = user;
  next();
};

module.exports = protect;