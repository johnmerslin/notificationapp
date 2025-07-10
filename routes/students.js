const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all students
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', class: className = '', section = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('students');
    
    if (search) {
      query = query.where('name', '>=', search)
                   .where('name', '<=', search + '\uf8ff');
    }
    
    if (className) {
      query = query.where('class', '==', className);
    }
    
    if (section) {
      query = query.where('section', '==', section);
    }

    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    const students = [];

    for (const doc of snapshot.docs) {
      const studentData = { id: doc.id, ...doc.data() };
      
      // Get parent information
      if (studentData.parentId) {
        const parentDoc = await db.collection('parents').doc(studentData.parentId).get();
        if (parentDoc.exists) {
          studentData.parent = { id: parentDoc.id, ...parentDoc.data() };
        }
      }

      students.push(studentData);
    }

    // Get total count
    const totalSnapshot = await db.collection('students').get();
    const total = totalSnapshot.size;

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const studentDoc = await db.collection('students').doc(id).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = { id: studentDoc.id, ...studentDoc.data() };
    
    // Get parent information
    if (studentData.parentId) {
      const parentDoc = await db.collection('parents').doc(studentData.parentId).get();
      if (parentDoc.exists) {
        studentData.parent = { id: parentDoc.id, ...parentDoc.data() };
      }
    }

    res.json(studentData);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create student
router.post('/', [
  authenticateAdmin,
  body('name').isLength({ min: 2 }),
  body('registrationNumber').isLength({ min: 1 }),
  body('class').isLength({ min: 1 }),
  body('section').isLength({ min: 1 }),
  body('dateOfBirth').isISO8601(),
  body('parentId').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if parent exists
    const parentDoc = await db.collection('parents').doc(req.body.parentId).get();
    if (!parentDoc.exists) {
      return res.status(400).json({ error: 'Parent not found' });
    }

    // Check if registration number is unique
    const existingStudent = await db.collection('students')
      .where('registrationNumber', '==', req.body.registrationNumber)
      .get();
    
    if (!existingStudent.empty) {
      return res.status(400).json({ error: 'Registration number already exists' });
    }

    const studentData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const studentRef = await db.collection('students').add(studentData);

    res.status(201).json({
      id: studentRef.id,
      ...studentData
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', [
  authenticateAdmin,
  body('name').optional().isLength({ min: 2 }),
  body('registrationNumber').optional().isLength({ min: 1 }),
  body('class').optional().isLength({ min: 1 }),
  body('section').optional().isLength({ min: 1 }),
  body('dateOfBirth').optional().isISO8601(),
  body('parentId').optional().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // If updating parent, check if parent exists
    if (req.body.parentId) {
      const parentDoc = await db.collection('parents').doc(req.body.parentId).get();
      if (!parentDoc.exists) {
        return res.status(400).json({ error: 'Parent not found' });
      }
    }

    // If updating registration number, check uniqueness
    if (req.body.registrationNumber) {
      const existingStudent = await db.collection('students')
        .where('registrationNumber', '==', req.body.registrationNumber)
        .get();
      
      if (!existingStudent.empty && existingStudent.docs[0].id !== id) {
        return res.status(400).json({ error: 'Registration number already exists' });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection('students').doc(id).update(updateData);

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('students').doc(id).delete();

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Get classes and sections
router.get('/meta/classes-sections', authenticateAdmin, async (req, res) => {
  try {
    const studentsSnapshot = await db.collection('students').get();
    const classes = new Set();
    const sections = new Set();

    studentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.class) classes.add(data.class);
      if (data.section) sections.add(data.section);
    });

    res.json({
      classes: Array.from(classes).sort(),
      sections: Array.from(sections).sort()
    });
  } catch (error) {
    console.error('Get classes/sections error:', error);
    res.status(500).json({ error: 'Failed to fetch classes and sections' });
  }
});

module.exports = router;