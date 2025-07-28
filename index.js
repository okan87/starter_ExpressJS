"use strict";

/* --------------------------------
! EXPRESSJS - API STARTER TEMPLATE
-------------------------------- */
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const dbConnection = require('./src/configs/dbConnection');
const errorHandler = require('./src/middlewares/errorHandler');
const jwtAuthMiddleware = require('./src/middlewares/jwtAuthMiddleware');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./logs/swagger-output.json');

const app = express();
const PORT = process.env.PORT || 8000;

// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Redoc entegrasyonu
try {
  require('./src/redoc')(app);
} catch (e) {
  console.warn('Redoc modülü yüklenemedi:', e.message);
}

// HTTP request logger (both terminal and file)
app.use(morgan('dev'));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// /docs/json endpointi swagger-output.json dosyasını sunar
app.get('/docs/json', (req, res) => {
  res.sendFile(path.join(__dirname, 'logs', 'swagger-output.json'));
});

// JSON parser middleware
app.use(express.json());

// Searching, Sorting & Pagination middleware
app.use(require('./src/middlewares/findSearchSortPage'));

// Root endpoint
app.all('/', (req, res) => {
  // If JWT exists, show user info and login status
  let isLogin = false;
  let user = null;
  
  // Authorization header check
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = require("jsonwebtoken").verify(token, process.env.ACCESS_KEY, {
        algorithms: ["HS256"],
      });
      isLogin = true;
      user = decoded;
    } catch (err) {
      // If token is invalid, login remains false
    }
  }
  
  res.send({
    error: false,
    message: "Welcome to Express.js API Starter",
    isLogin,
    user,
    documentation: {
      swagger_ui: req.protocol + '://' + req.get('host') + '/api-docs',
      redoc: req.protocol + '://' + req.get('host') + '/redoc',
      openapi_json: req.protocol + '://' + req.get('host') + '/docs/json'
    },
    info: {
      message: "This is a starter template. Add your routes below.",
      features: [
        "JWT Authentication Ready",
        "Error Handling Middleware",
        "Search, Sort & Pagination",
        "Morgan Logging",
        "Swagger/OpenAPI Documentation",
        "Redoc Documentation",
        "MongoDB Connection Ready"
      ]
    }
  });
});

// ============================================
// 🚀 ADD YOUR ROUTES HERE
// ============================================
// Example:
// app.use('/auth', require('./src/routes/auth.router'))
// app.use('/users', jwtAuthMiddleware, require('./src/routes/user.router'))
// app.use('/products', jwtAuthMiddleware, require('./src/routes/product.router'))

// Centralized error handler (should be the last middleware)
app.use(errorHandler);

// Connect to DB and start server
dbConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
            console.log(`📚 API Documentation: http://127.0.0.1:${PORT}/api-docs`);
            console.log(`📖 Redoc Documentation: http://127.0.0.1:${PORT}/redoc`);
            console.log(`📄 OpenAPI JSON: http://127.0.0.1:${PORT}/docs/json`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to DB:", err.message);
        process.exit(1);
    });
