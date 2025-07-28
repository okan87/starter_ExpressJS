"use strict";

const jwt = require("jsonwebtoken");
const Personnel = require("../models/personnel.model");
const { comparePassword } = require("./passwordEncrypt");

module.exports = async function (userData, withRefresh = true) {
  const { username, password } = userData;

  if (!username || !password) {
    return {
      error: true,
      message: "Please enter username and password.",
    };
  }

  const user = await Personnel.findOne({ username });
  if (!user) {
    return {
      error: true,
      message: "Wrong username or password.",
    };
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return {
      error: true,
      message: "Wrong username or password.",
    };
  }

  if (!user.isActive) {
    return {
      error: true,
      message: "This account is not active.",
    };
  }

  // Login OK
  const accessData = {
    _id: user._id,
    departmentId: user.departmentId,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    isLead: user.isLead,
  };

  const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, {
    expiresIn: "30m",
    algorithm: "HS256", // güvenliğe katkı
  });

  const refreshData = {
    username: user.username,
  };

  const refreshToken = withRefresh
    ? jwt.sign(refreshData, process.env.REFRESH_KEY, {
        expiresIn: "3d",
        algorithm: "HS256",
      })
    : null;

  

  return {
    error: false,
    token: {
      access: accessToken,
      refresh: refreshToken,
    },
  };
};