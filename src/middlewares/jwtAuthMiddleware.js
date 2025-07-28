"use strict";
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Authorization header kontrolü
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY, {
      algorithms: ["HS256"],
    });
    req.user = decoded; // Kullanıcı bilgilerini req objesine ekle
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: "Invalid or expired token" });
  }
};
