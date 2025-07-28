"use strict";

// Gerekli bağımlılıklar
const jwt = require("jsonwebtoken");
const checkUserAndSetToken = require("../helpers/checkUserAndSetToken");

module.exports = {

  login: async (req, res, next) => {
    
  /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'JWT: Login'
    #swagger.description = 'Login with username and password'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        username: 'test',
        password: '1234'
      }
    }
  */
    try {
      const checkUser = await checkUserAndSetToken(req.body);
      if (checkUser.error) {
        return res.status(401).json({ error: true, message: checkUser.message });
      }
      return res.status(200).json(checkUser);
    } catch (err) {
      next(err);
    }
  },


  
  refresh: async (req, res, next) => {
    /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'JWT: Refresh Token'
    #swagger.description = 'Get a new access token using a valid refresh token.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        token: { refresh: 'your_refresh_token_here' }
      }
    }
  */
    const refreshToken = req.body?.token?.refresh;
    if (!refreshToken) {
      return res.status(401).json({ error: true, message: "Please provide token.refresh" });
    }
    try {
      const jwtData = jwt.verify(refreshToken, process.env.REFRESH_KEY, {
        algorithms: ["HS256"],
      });
      if (!jwtData) {
        return res.status(401).json({ error: true, message: "Invalid refresh token payload" });
      }
      const checkUser = await checkUserAndSetToken(jwtData, false);
      if (checkUser.error) {
        return res.status(401).json({ error: true, message: checkUser.message });
      }
      return res.status(200).json(checkUser);
    } catch (err) {
      next(err);
    }
  },


  
  logout: async (req, res) => {
    /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'Logout (Client-side)'
    #swagger.description = 'No server-side logout needed. Just delete your access token on client side.'
  */
    return res.status(200).json({
      error: false,
      message:
        "No server-side logout needed. Just delete your access token on client side.",
    });
  },
};