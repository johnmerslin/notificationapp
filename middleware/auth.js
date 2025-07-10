const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify admin still exists and is active
    const adminDoc = await db.collection('admins').doc(decoded.adminId).get();
    
    if (!adminDoc.exists || !adminDoc.data().isActive) {
      return res.status(401).json({ error: 'Invalid token or admin account deactivated.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticateAdmin };