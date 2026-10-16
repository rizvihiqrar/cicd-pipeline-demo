'use strict';

const { Router } = require('express');

module.exports = function createProductRouter(service) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(service.getAll());
  });

  router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'id must be an integer' });

    const product = service.getById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  });

  router.post('/', (req, res) => {
    try {
      const product = service.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'id must be an integer' });

    try {
      const product = service.update(id, req.body);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'id must be an integer' });

    const deleted = service.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  });

  return router;
};
