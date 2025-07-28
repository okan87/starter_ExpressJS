// Redoc entegrasyonu için örnek Express kodu
const redoc = require('redoc-express');
const path = require('path');

module.exports = (app) => {
  app.get('/redoc', redoc({
    title: 'API Docs',
    specUrl: '/swagger-output.json'
  }));

  app.use('/swagger-output.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../logs', 'swagger-output.json'));
  });
};
