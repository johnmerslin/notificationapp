const express = require('express');
const path = require('path');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Serve admin dashboard HTML
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Serve admin dashboard assets
router.use('/assets', express.static(path.join(__dirname, '../public/admin/assets')));

module.exports = router;