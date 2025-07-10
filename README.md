# School Messaging System - Admin Backend

A comprehensive backend system for managing school messaging, parent-student database, and analytics using Firebase.

## Features

### 🔐 Authentication & Authorization
- JWT-based admin authentication
- Role-based access control
- Secure API endpoints

### 👥 User Management
- Parent registration and management
- Student registration with parent linking
- Bulk operations support

### 📱 Message Management
- Multi-format message support (text, image, video, voice)
- Category-based organization (homework, assignments, school-info, emergency)
- Priority levels (low, medium, high)
- Bulk message sending to selected parents

### 📊 Analytics & Reporting
- Real-time delivery tracking
- Read receipt monitoring
- Parent engagement analytics
- Message performance metrics
- Export functionality (JSON/CSV)

### 🔔 Notification System
- Firebase Cloud Messaging (FCM) integration
- Push notifications to mobile apps
- Delivery status tracking

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: JWT + Firebase Auth
- **Notifications**: Firebase Cloud Messaging
- **Frontend**: HTML, Tailwind CSS, Alpine.js

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-messaging-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Firebase Cloud Messaging
   - Download service account key
   - Enable Authentication (for mobile app)

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   # ... other Firebase config
   
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. **Create initial admin account**
   ```bash
   curl -X POST http://localhost:3000/api/auth/create-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@amalorpavamschool.edu",
       "password": "admin123",
       "name": "School Administrator"
     }'
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   In your Vercel dashboard, go to your project settings and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   # ... other Firebase config
   ```

5. **Access your deployed app**
   - Backend API: `https://your-app.vercel.app/api`
   - Admin Dashboard: `https://your-app.vercel.app/admin`

### Alternative: Deploy to Railway

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Deploy automatically

2. **Set Environment Variables**
   Add the same environment variables as above in Railway dashboard

### Alternative: Deploy to Render

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   Add the same environment variables as above in Render dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/create-admin` - Create admin account

### Parents Management
- `GET /api/parents` - List all parents
- `POST /api/parents` - Create new parent
- `GET /api/parents/:id` - Get parent details
- `PUT /api/parents/:id` - Update parent
- `DELETE /api/parents/:id` - Delete parent

### Students Management
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Messages
- `GET /api/messages` - List all messages
- `POST /api/messages` - Send new message
- `GET /api/messages/:id` - Get message details
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/read` - Mark message as read

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/messages` - Message analytics
- `GET /api/analytics/engagement` - Parent engagement stats
- `GET /api/analytics/export` - Export data

## Admin Dashboard

Access the admin dashboard at `http://localhost:3000/admin`

### Features:
- **Dashboard**: Overview statistics and charts
- **Messages**: Send and manage messages
- **Parents**: Manage parent accounts
- **Students**: Manage student records
- **Analytics**: Detailed reports and insights

### Message Types Supported:
1. **Text Only**: Simple text messages
2. **Image + Text**: Text with attached image
3. **Video + Text**: Text with video link
4. **Voice + Text**: Text with voice recording

### Message Categories:
- **Home Works**: Daily homework assignments
- **Assignments**: Project and assignment notifications
- **School Info**: General school information
- **Emergency**: Urgent notifications

## Firebase Setup

### Firestore Collections Structure:

```
admins/
├── {adminId}
    ├── email: string
    ├── password: string (hashed)
    ├── name: string
    ├── role: string
    ├── createdAt: timestamp
    └── isActive: boolean

parents/
├── {parentId}
    ├── name: string
    ├── phoneNumber: string
    ├── email: string (optional)
    ├── fcmToken: string (for notifications)
    ├── createdAt: timestamp
    └── isActive: boolean

students/
├── {studentId}
    ├── name: string
    ├── registrationNumber: string
    ├── dateOfBirth: string
    ├── class: string
    ├── section: string
    ├── parentId: string
    ├── createdAt: timestamp
    └── isActive: boolean

messages/
├── {messageId}
    ├── title: string
    ├── content: string
    ├── category: string
    ├── priority: string
    ├── type: string
    ├── imageUrl: string (optional)
    ├── videoUrl: string (optional)
    ├── voiceUrl: string (optional)
    ├── voiceDuration: string (optional)
    ├── createdAt: timestamp
    ├── createdBy: string
    └── sender: string

messageDeliveries/
├── {deliveryId}
    ├── messageId: string
    ├── parentId: string
    ├── status: string (pending, delivered, failed)
    ├── createdAt: timestamp
    ├── deliveredAt: timestamp (optional)
    ├── readAt: timestamp (optional)
    └── error: string (optional)
```

### Storage Structure:
```
messages/
├── {messageId}/
    ├── image_timestamp.jpg
    └── voice_timestamp.mp3
```

## Security Features

- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions
- Admin role verification

## Monitoring & Analytics

### Dashboard Metrics:
- Total parents, students, messages
- Monthly/weekly/daily message counts
- Delivery success rates
- Read rates by category
- Parent engagement scores

### Export Options:
- Message delivery reports
- Parent engagement data
- Student database
- Custom date range exports
- JSON and CSV formats

## Mobile App Integration

This backend is designed to work with the React Native mobile app. Key integration points:

1. **Authentication**: Parents login via OTP
2. **Message Delivery**: Real-time push notifications
3. **Read Receipts**: Automatic tracking when messages are opened
4. **Media Support**: Images, videos, and voice messages

## Development

### Running in Development:
```bash
npm run dev
```

### Production Deployment:
```bash
npm start
```

### Environment Variables:
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret for JWT tokens
- `FIREBASE_*`: Firebase configuration
- `FRONTEND_URL`: CORS origin URL

## Support

For technical support or questions:
- Email: admin@amalorpavamschool.edu
- Documentation: Check API endpoints documentation
- Logs: Check server logs for debugging

## License

This project is proprietary software for Amalorpavam School.