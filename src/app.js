'use strict';

const express = require('express');
const productService   = require('./services/productService');
const createProductRouter = require('./routes/products');
const errorHandler     = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', createProductRouter(productService));
app.use(errorHandler);

module.exports = { app, productService };
