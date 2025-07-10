const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all parents
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('parents');
    
    if (search) {
      query = query.where('name', '>=', search)
                   .where('name', '<=', search + '\uf8ff');
    }

    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    const parents = [];

    for (const doc of snapshot.docs) {
      const parentData = { id: doc.id, ...doc.data() };
      
      // Get associated students
      const studentsSnapshot = await db.collection('students')
        .where('parentId', '==', doc.id)
        .get();
      
      parentData.students = studentsSnapshot.docs.map(studentDoc => ({
        id: studentDoc.id,
        ...studentDoc.data()
      }));

      parents.push(parentData);
    }

    // Get total count
    const totalSnapshot = await db.collection('parents').get();
    const total = totalSnapshot.size;

    res.json({
      parents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
});

// Get parent by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const parentDoc = await db.collection('parents').doc(id).get();
    
    if (!parentDoc.exists) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentData = { id: parentDoc.id, ...parentDoc.data() };
    
    // Get associated students
    const studentsSnapshot = await db.collection('students')
      .where('parentId', '==', id)
      .get();
    
    parentData.students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(parentData);
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
});

// Create parent
router.post('/', [
  authenticateAdmin,
  body('name').isLength({ min: 2 }),
  body('phoneNumber').isMobilePhone(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parentData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const parentRef = await db.collection('parents').add(parentData);

    res.status(201).json({
      id: parentRef.id,
      ...parentData
    });
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({ error: 'Failed to create parent' });
  }
});

// Update parent
router.put('/:id', [
  authenticateAdmin,
  body('name').optional().isLength({ min: 2 }),
  body('phoneNumber').optional().isMobilePhone(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection('parents').doc(id).update(updateData);

    res.json({ message: 'Parent updated successfully' });
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({ error: 'Failed to update parent' });
  }
});

// Delete parent
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if parent has students
    const studentsSnapshot = await db.collection('students')
      .where('parentId', '==', id)
      .get();

    if (!studentsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete parent with associated students' 
      });
    }

    await db.collection('parents').doc(id).delete();

    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({ error: 'Failed to delete parent' });
  }
});

module.exports = router;