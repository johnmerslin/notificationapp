const express = require('express');
const moment = require('moment');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Dashboard overview
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const startOfWeek = moment().startOf('week').toDate();
    const startOfDay = moment().startOf('day').toDate();

    // Total counts
    const [parentsSnapshot, studentsSnapshot, messagesSnapshot] = await Promise.all([
      db.collection('parents').get(),
      db.collection('students').get(),
      db.collection('messages').get()
    ]);

    const totalParents = parentsSnapshot.size;
    const totalStudents = studentsSnapshot.size;
    const totalMessages = messagesSnapshot.size;

    // Messages by period
    const [monthlyMessages, weeklyMessages, dailyMessages] = await Promise.all([
      db.collection('messages').where('createdAt', '>=', startOfMonth).get(),
      db.collection('messages').where('createdAt', '>=', startOfWeek).get(),
      db.collection('messages').where('createdAt', '>=', startOfDay).get()
    ]);

    // Message delivery stats
    const deliveriesSnapshot = await db.collection('messageDeliveries').get();
    const deliveryStats = {
      total: deliveriesSnapshot.size,
      delivered: 0,
      read: 0,
      failed: 0
    };

    deliveriesSnapshot.docs.forEach(doc => {
      const delivery = doc.data();
      if (delivery.status === 'delivered') deliveryStats.delivered++;
      if (delivery.readAt) deliveryStats.read++;
      if (delivery.status === 'failed') deliveryStats.failed++;
    });

    // Messages by category
    const categoryStats = {};
    messagesSnapshot.docs.forEach(doc => {
      const category = doc.data().category;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Messages by priority
    const priorityStats = {};
    messagesSnapshot.docs.forEach(doc => {
      const priority = doc.data().priority;
      priorityStats[priority] = (priorityStats[priority] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const last7Days = moment().subtract(7, 'days').toDate();
    const recentMessagesSnapshot = await db.collection('messages')
      .where('createdAt', '>=', last7Days)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentMessages = recentMessagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      overview: {
        totalParents,
        totalStudents,
        totalMessages,
        monthlyMessages: monthlyMessages.size,
        weeklyMessages: weeklyMessages.size,
        dailyMessages: dailyMessages.size
      },
      deliveryStats,
      categoryStats,
      priorityStats,
      recentMessages
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Message analytics
router.get('/messages', authenticateAdmin, async (req, res) => {
  try {
    const { period = '30', groupBy = 'day' } = req.query;
    const startDate = moment().subtract(parseInt(period), 'days').toDate();

    // Messages over time
    const messagesSnapshot = await db.collection('messages')
      .where('createdAt', '>=', startDate)
      .orderBy('createdAt', 'asc')
      .get();

    const messagesByTime = {};
    messagesSnapshot.docs.forEach(doc => {
      const date = moment(doc.data().createdAt.toDate());
      const key = groupBy === 'day' 
        ? date.format('YYYY-MM-DD')
        : date.format('YYYY-MM');
      
      messagesByTime[key] = (messagesByTime[key] || 0) + 1;
    });

    // Delivery rates over time
    const deliveriesSnapshot = await db.collection('messageDeliveries')
      .where('createdAt', '>=', startDate)
      .get();

    const deliveryRates = {};
    deliveriesSnapshot.docs.forEach(doc => {
      const delivery = doc.data();
      const date = moment(delivery.createdAt.toDate());
      const key = groupBy === 'day' 
        ? date.format('YYYY-MM-DD')
        : date.format('YYYY-MM');
      
      if (!deliveryRates[key]) {
        deliveryRates[key] = { total: 0, delivered: 0, read: 0 };
      }
      
      deliveryRates[key].total++;
      if (delivery.status === 'delivered') deliveryRates[key].delivered++;
      if (delivery.readAt) deliveryRates[key].read++;
    });

    // Top performing messages (by read rate)
    const topMessages = [];
    for (const messageDoc of messagesSnapshot.docs) {
      const messageData = { id: messageDoc.id, ...messageDoc.data() };
      
      const messageDeliveries = await db.collection('messageDeliveries')
        .where('messageId', '==', messageDoc.id)
        .get();
      
      const stats = {
        total: messageDeliveries.size,
        read: messageDeliveries.docs.filter(doc => doc.data().readAt).length
      };
      
      messageData.readRate = stats.total > 0 ? (stats.read / stats.total) * 100 : 0;
      messageData.stats = stats;
      topMessages.push(messageData);
    }

    topMessages.sort((a, b) => b.readRate - a.readRate);

    res.json({
      messagesByTime,
      deliveryRates,
      topMessages: topMessages.slice(0, 10)
    });
  } catch (error) {
    console.error('Message analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch message analytics' });
  }
});

// Parent engagement analytics
router.get('/engagement', authenticateAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = moment().subtract(parseInt(period), 'days').toDate();

    // Get all parents
    const parentsSnapshot = await db.collection('parents').get();
    const parentEngagement = [];

    for (const parentDoc of parentsSnapshot.docs) {
      const parentData = { id: parentDoc.id, ...parentDoc.data() };
      
      // Get deliveries for this parent
      const deliveriesSnapshot = await db.collection('messageDeliveries')
        .where('parentId', '==', parentDoc.id)
        .where('createdAt', '>=', startDate)
        .get();
      
      const stats = {
        messagesReceived: deliveriesSnapshot.size,
        messagesRead: deliveriesSnapshot.docs.filter(doc => doc.data().readAt).length,
        lastActivity: null
      };
      
      // Find last activity
      const lastReadDelivery = deliveriesSnapshot.docs
        .filter(doc => doc.data().readAt)
        .sort((a, b) => b.data().readAt.toDate() - a.data().readAt.toDate())[0];
      
      if (lastReadDelivery) {
        stats.lastActivity = lastReadDelivery.data().readAt.toDate();
      }
      
      stats.engagementRate = stats.messagesReceived > 0 
        ? (stats.messagesRead / stats.messagesReceived) * 100 
        : 0;
      
      parentData.stats = stats;
      parentEngagement.push(parentData);
    }

    // Sort by engagement rate
    parentEngagement.sort((a, b) => b.stats.engagementRate - a.stats.engagementRate);

    // Calculate overall engagement metrics
    const totalMessages = parentEngagement.reduce((sum, parent) => sum + parent.stats.messagesReceived, 0);
    const totalRead = parentEngagement.reduce((sum, parent) => sum + parent.stats.messagesRead, 0);
    const overallEngagementRate = totalMessages > 0 ? (totalRead / totalMessages) * 100 : 0;

    // Active vs inactive parents
    const activeParents = parentEngagement.filter(parent => parent.stats.engagementRate > 50).length;
    const inactiveParents = parentEngagement.filter(parent => parent.stats.engagementRate === 0).length;

    res.json({
      overallStats: {
        totalParents: parentEngagement.length,
        activeParents,
        inactiveParents,
        overallEngagementRate
      },
      parentEngagement: parentEngagement.slice(0, 50), // Limit to top 50
      engagementDistribution: {
        high: parentEngagement.filter(p => p.stats.engagementRate >= 80).length,
        medium: parentEngagement.filter(p => p.stats.engagementRate >= 50 && p.stats.engagementRate < 80).length,
        low: parentEngagement.filter(p => p.stats.engagementRate > 0 && p.stats.engagementRate < 50).length,
        none: parentEngagement.filter(p => p.stats.engagementRate === 0).length
      }
    });
  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement analytics' });
  }
});

// Export analytics data
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const { type = 'messages', format = 'json', startDate, endDate } = req.query;
    
    let start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    let end = endDate ? new Date(endDate) : new Date();

    let data = [];

    switch (type) {
      case 'messages':
        const messagesSnapshot = await db.collection('messages')
          .where('createdAt', '>=', start)
          .where('createdAt', '<=', end)
          .orderBy('createdAt', 'desc')
          .get();
        
        for (const doc of messagesSnapshot.docs) {
          const messageData = { id: doc.id, ...doc.data() };
          
          // Get delivery stats
          const deliveriesSnapshot = await db.collection('messageDeliveries')
            .where('messageId', '==', doc.id)
            .get();
          
          messageData.deliveryStats = {
            total: deliveriesSnapshot.size,
            delivered: deliveriesSnapshot.docs.filter(d => d.data().status === 'delivered').length,
            read: deliveriesSnapshot.docs.filter(d => d.data().readAt).length,
            failed: deliveriesSnapshot.docs.filter(d => d.data().status === 'failed').length
          };
          
          data.push(messageData);
        }
        break;

      case 'deliveries':
        const deliveriesSnapshot = await db.collection('messageDeliveries')
          .where('createdAt', '>=', start)
          .where('createdAt', '<=', end)
          .get();
        
        data = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        break;

      case 'parents':
        const parentsSnapshot = await db.collection('parents').get();
        data = parentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        break;

      case 'students':
        const studentsSnapshot = await db.collection('students').get();
        data = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        break;
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${moment().format('YYYY-MM-DD')}.csv"`);
      res.send(csv);
    } else {
      res.json({
        type,
        period: { start, end },
        count: data.length,
        data
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;