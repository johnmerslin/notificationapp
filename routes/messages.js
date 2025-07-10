const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, storage, messaging } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get all messages
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, category = '', priority = '', dateFrom = '', dateTo = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('messages').orderBy('createdAt', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (priority) {
      query = query.where('priority', '==', priority);
    }

    if (dateFrom) {
      query = query.where('createdAt', '>=', new Date(dateFrom));
    }

    if (dateTo) {
      query = query.where('createdAt', '<=', new Date(dateTo));
    }

    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    const messages = [];

    for (const doc of snapshot.docs) {
      const messageData = { id: doc.id, ...doc.data() };
      
      // Get delivery statistics
      const deliverySnapshot = await db.collection('messageDeliveries')
        .where('messageId', '==', doc.id)
        .get();
      
      const deliveryStats = {
        total: deliverySnapshot.size,
        delivered: 0,
        read: 0,
        failed: 0
      };

      deliverySnapshot.docs.forEach(deliveryDoc => {
        const delivery = deliveryDoc.data();
        if (delivery.status === 'delivered') deliveryStats.delivered++;
        if (delivery.readAt) deliveryStats.read++;
        if (delivery.status === 'failed') deliveryStats.failed++;
      });

      messageData.deliveryStats = deliveryStats;
      messages.push(messageData);
    }

    // Get total count
    const totalSnapshot = await db.collection('messages').get();
    const total = totalSnapshot.size;

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get message by ID with delivery details
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const messageDoc = await db.collection('messages').doc(id).get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const messageData = { id: messageDoc.id, ...messageDoc.data() };
    
    // Get delivery details
    const deliverySnapshot = await db.collection('messageDeliveries')
      .where('messageId', '==', id)
      .get();
    
    const deliveries = [];
    for (const deliveryDoc of deliverySnapshot.docs) {
      const delivery = { id: deliveryDoc.id, ...deliveryDoc.data() };
      
      // Get parent info
      if (delivery.parentId) {
        const parentDoc = await db.collection('parents').doc(delivery.parentId).get();
        if (parentDoc.exists) {
          delivery.parent = { id: parentDoc.id, ...parentDoc.data() };
        }
      }
      
      deliveries.push(delivery);
    }

    messageData.deliveries = deliveries;

    res.json(messageData);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Create and send message
router.post('/', [
  authenticateAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ]),
  body('title').isLength({ min: 1 }),
  body('content').isLength({ min: 1 }),
  body('category').isIn(['homework', 'assignments', 'school-info', 'emergency']),
  body('priority').isIn(['low', 'medium', 'high']),
  body('type').isIn(['text', 'image', 'video', 'voice']),
  body('recipients').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, priority, type, recipients, videoUrl } = req.body;
    const messageId = uuidv4();

    let imageUrl = null;
    let voiceUrl = null;
    let voiceDuration = null;

    // Upload files if present
    if (req.files?.image) {
      const imageFile = req.files.image[0];
      const imagePath = `messages/${messageId}/image_${Date.now()}.${imageFile.originalname.split('.').pop()}`;
      const imageUpload = storage.bucket().file(imagePath);
      
      await imageUpload.save(imageFile.buffer, {
        metadata: { contentType: imageFile.mimetype }
      });
      
      await imageUpload.makePublic();
      imageUrl = `https://storage.googleapis.com/${storage.bucket().name}/${imagePath}`;
    }

    if (req.files?.voice) {
      const voiceFile = req.files.voice[0];
      const voicePath = `messages/${messageId}/voice_${Date.now()}.${voiceFile.originalname.split('.').pop()}`;
      const voiceUpload = storage.bucket().file(voicePath);
      
      await voiceUpload.save(voiceFile.buffer, {
        metadata: { contentType: voiceFile.mimetype }
      });
      
      await voiceUpload.makePublic();
      voiceUrl = `https://storage.googleapis.com/${storage.bucket().name}/${voicePath}`;
      voiceDuration = req.body.voiceDuration || '0:00';
    }

    // Create message document
    const messageData = {
      title,
      content,
      category,
      priority,
      type,
      imageUrl,
      videoUrl: type === 'video' ? videoUrl : null,
      voiceUrl,
      voiceDuration,
      createdAt: new Date(),
      createdBy: req.admin.adminId,
      sender: req.admin.email
    };

    const messageRef = await db.collection('messages').doc(messageId).set(messageData);

    // Create delivery records and send notifications
    const deliveryPromises = recipients.map(async (parentId) => {
      const deliveryId = uuidv4();
      const deliveryData = {
        messageId,
        parentId,
        status: 'pending',
        createdAt: new Date(),
        deliveredAt: null,
        readAt: null
      };

      await db.collection('messageDeliveries').doc(deliveryId).set(deliveryData);

      // Send push notification (if FCM token exists)
      try {
        const parentDoc = await db.collection('parents').doc(parentId).get();
        if (parentDoc.exists && parentDoc.data().fcmToken) {
          const notificationPayload = {
            token: parentDoc.data().fcmToken,
            notification: {
              title: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${title}`,
              body: content.substring(0, 100) + (content.length > 100 ? '...' : '')
            },
            data: {
              messageId,
              category,
              priority,
              type
            }
          };

          await messaging.send(notificationPayload);
          
          // Update delivery status
          await db.collection('messageDeliveries').doc(deliveryId).update({
            status: 'delivered',
            deliveredAt: new Date()
          });
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        await db.collection('messageDeliveries').doc(deliveryId).update({
          status: 'failed',
          error: notificationError.message
        });
      }
    });

    await Promise.all(deliveryPromises);

    res.status(201).json({
      id: messageId,
      ...messageData,
      message: 'Message created and sent successfully'
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Mark message as read
router.post('/:id/read', async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { parentId } = req.body;

    const deliverySnapshot = await db.collection('messageDeliveries')
      .where('messageId', '==', messageId)
      .where('parentId', '==', parentId)
      .get();

    if (!deliverySnapshot.empty) {
      const deliveryDoc = deliverySnapshot.docs[0];
      await deliveryDoc.ref.update({
        readAt: new Date()
      });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete message deliveries
    const deliverySnapshot = await db.collection('messageDeliveries')
      .where('messageId', '==', id)
      .get();

    const deletePromises = deliverySnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete message
    await db.collection('messages').doc(id).delete();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get message categories and priorities
router.get('/meta/options', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      categories: [
        { value: 'homework', label: 'Home Works' },
        { value: 'assignments', label: 'Assignments' },
        { value: 'school-info', label: 'School Info' },
        { value: 'emergency', label: 'Emergency' }
      ],
      priorities: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ],
      types: [
        { value: 'text', label: 'Text Only' },
        { value: 'image', label: 'Image with Text' },
        { value: 'video', label: 'Video Link with Text' },
        { value: 'voice', label: 'Voice with Text' }
      ]
    });
  } catch (error) {
    console.error('Get options error:', error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

module.exports = router;