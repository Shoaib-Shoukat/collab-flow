# CollabFlow Backend - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start development server
npm run dev

# 4. Server runs on http://localhost:5000
```

## 📋 Feature Checklist

### Core Modules ✓
- [x] Authentication & Authorization (JWT + RBAC)
- [x] Sprint Management (create, start, complete, report)
- [x] Task Management (create, assign, update, comment)
- [x] Bug Tracking (severity, attachments, watch)
- [x] Product Backlog (sort, filter, move to sprint)
- [x] Release Management (versions, milestones)
- [x] Automation Engine (triggers, actions, conditions)
- [x] Analytics (velocity, burndown, cycle time)
- [x] Dashboard Widgets (all 6 widget types)
- [x] Real-time Updates (Socket.IO with 4 namespaces)
- [x] Cron Jobs (6 scheduled tasks)

### Data Models ✓
- [x] User (with RBAC roles)
- [x] Task (with story points, attachments)
- [x] Sprint (with velocity, burndown)
- [x] Bug (with severity, reproducible)
- [x] Backlog (with ordering)
- [x] Release (with milestones)
- [x] Automation (with triggers/actions)
- [x] Project
- [x] Analytics
- [x] Notification

## 🔌 Key Endpoints

```
AUTH
  POST /api/auth/register
  POST /api/auth/login

TASKS (61 total endpoints across all modules)
  CRUD: /api/tasks
  Comments: /api/tasks/:id/comment
  Watch: /api/tasks/:id/watch
  Search: /api/tasks/search

SPRINTS
  CRUD: /api/sprints
  Start: /api/sprints/:id/start
  Complete: /api/sprints/:id/complete
  Report: /api/sprints/:id/report

BUGS
  CRUD: /api/bugs
  Comments: /api/bugs/:id/comment
  Stats: /api/bugs/project/:projectId/stats

BACKLOG
  GET: /api/backlog/:projectId
  Reorder: /api/backlog/:projectId/reorder
  Move: /api/backlog/:projectId/move-to-sprint

RELEASES
  CRUD: /api/releases
  Milestone: /api/releases/:id/milestone
  Publish: /api/releases/:id/publish

ANALYTICS
  Sprint: /api/analytics/sprint/:projectId/:sprintId
  Project: /api/analytics/project/:projectId
  Burndown: /api/analytics/burndown/:sprintId
  Velocity: /api/analytics/velocity/:projectId
  Workload: /api/analytics/workload/:projectId

AUTOMATIONS
  CRUD: /api/automations
  Execute: /api/automations/:id/execute

DASHBOARD
  Widgets: /api/dashboard/:projectId/widgets
  Sprint: /api/dashboard/sprint/:sprintId
  Heatmap: /api/dashboard/:projectId/activity-heatmap
```

## 🔐 Authentication

```javascript
// 1. Login to get token
POST /api/auth/login
{ "email": "...", "password": "..." }
// Response: { "user": {...}, "token": "jwt_token" }

// 2. Use token in all requests
Authorization: Bearer {token}

// 3. Token automatically decoded to req.user
```

## 📊 Database Schemas Quick View

**Task Fields**
```javascript
{
  title, description, projectId, sprintId, 
  assigneeId, createdById, status, priority, 
  storyPoints, dueDate, completedDate,
  comments[], attachments[], watchers[], 
  activityLog[]
}
```

**Sprint Fields**
```javascript
{
  projectId, name, startDate, endDate,
  status, goal, teamMembers[], tasks[],
  plannedVelocity, actualVelocity,
  completedPoints, remainingPoints,
  burndownChart[], metrics{}
}
```

**Bug Fields**
```javascript
{
  title, description, projectId, severity,
  priority, status, assigneeId, reproducible,
  steps, attachments[], comments[], watchers[],
  environment, browserVersion, relatedTasks[]
}
```

**Automation Fields**
```javascript
{
  projectId, name, trigger, triggerConfig,
  actions[], conditions[], isActive,
  executionHistory[]
}
```

## 🔄 Socket.IO Quick Usage

```javascript
// Client side example
const io = require('socket.io-client');

// Connect to tasks namespace
const tasksSocket = io('http://localhost:5000/tasks');

// Watch sprint
tasksSocket.emit('watch_sprint', 'sprint_id');

// Listen for updates
tasksSocket.on('task_changed', (data) => {
  console.log('Task updated:', data);
});

// Bugs namespace
const bugsSocket = io('http://localhost:5000/bugs');
bugsSocket.emit('watch_project_bugs', 'project_id');
bugsSocket.on('critical_bug_alert', (data) => {
  console.log('Critical bug:', data);
});

// Notifications
const notifySocket = io('http://localhost:5000/notifications');
notifySocket.emit('register_user', 'user_id');
notifySocket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

## 🎯 Common Task Workflows

### Create Sprint & Add Tasks
```javascript
// 1. Create sprint
POST /api/sprints
{ projectId, name, startDate, endDate, goal }

// 2. Create task
POST /api/tasks
{ title, projectId, sprintId, storyPoints }

// 3. Start sprint
POST /api/sprints/:id/start

// 4. Update task status
PUT /api/tasks/:id
{ status: "In Progress" }

// 5. Complete sprint
POST /api/sprints/:id/complete

// 6. Get report
GET /api/sprints/:id/report
```

### Report a Bug
```javascript
// 1. Create bug
POST /api/bugs
{ 
  title, description, severity, projectId,
  steps, reproducible
}

// 2. Assign to developer
PUT /api/bugs/:id
{ assigneeId }

// 3. Add comment
POST /api/bugs/:id/comment
{ text }

// 4. Watch bug
POST /api/bugs/:id/watch

// 5. Check stats
GET /api/bugs/project/:projectId/stats
```

### View Analytics
```javascript
// Sprint metrics
GET /api/analytics/sprint/:projectId/:sprintId

// Project metrics
GET /api/analytics/project/:projectId

// Burndown chart
GET /api/analytics/burndown/:sprintId

// Team velocity trend
GET /api/analytics/velocity/:projectId

// Team workload
GET /api/analytics/workload/:projectId

// Dashboard widgets
GET /api/dashboard/:projectId/widgets
```

## 🤖 Automation Example

```javascript
// Create automation: Alert on critical bug
POST /api/automations
{
  projectId: "xxx",
  name: "Critical Bug Alert",
  trigger: "criticalBugAlert",
  triggerConfig: { severity: "Critical" },
  actions: [
    {
      type: "broadcastAlert",
      config: {
        userId: "manager_id",
        message: "Critical bug reported!"
      }
    },
    {
      type: "notifyUser",
      config: {
        userId: "qa_lead_id",
        title: "Critical Bug Alert",
        message: "Please review immediately"
      }
    }
  ],
  isActive: true
}

// Execute automation
POST /api/automations/:id/execute
{ taskId: "xxx" }
```

## ⏰ Scheduled Tasks (Cron Jobs)

| Time | Task |
|------|------|
| Every hour | Check due dates approaching |
| Every 4 hours | Check overdue tasks |
| Daily 2 AM | Archive old completed sprints |
| Daily 11 PM | Calculate sprint velocity |
| Weekly | Clean old notifications |
| Every 30 min | Critical bug alerts |

## 📁 Adding New Feature - Quick Checklist

```
1. Create model in src/models/
2. Create controller in src/controllers/
3. Create routes in src/routes/
4. Import routes in src/server.js
5. Add Socket.IO namespace if real-time needed
6. Add cron job if scheduled task needed
7. Update API_DOCUMENTATION.md
8. Test all endpoints
```

## 🐛 Debugging Tips

```javascript
// Enable detailed logs
NODE_ENV=development npm run dev

// Test endpoint with curl
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {token}"

// Check MongoDB connection
// Set MONGO_URI correctly in .env

// Verify JWT token
// Token must be sent as: Authorization: Bearer {token}

// Socket.IO debugging
// Check if socket connected in browser console:
// socket.on('connect', () => console.log('connected'))

// Check all available rooms in Socket.IO
// console.log(io.of('/namespace').adapter.rooms)
```

## 📦 Dependencies Overview

```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ORM",
  "socket.io": "Real-time updates",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "nodemailer": "Email notifications",
  "node-schedule": "Cron jobs",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables"
}
```

## 🔑 Environment Variables

```
MONGO_URI         - MongoDB connection string
JWT_SECRET        - JWT signing secret
PORT              - Server port (default: 5000)
EMAIL_SERVICE     - Email provider (gmail, etc)
EMAIL_USER        - Email account
EMAIL_PASSWORD    - Email password
FRONTEND_URL      - Frontend URL for CORS
NODE_ENV          - development | production
SLACK_WEBHOOK_URL - Optional Slack integration
```

## 🚨 Common Issues & Solutions

**Issue**: CORS Error
```
Solution: Update CORS in server.js
app.use(cors({ origin: process.env.FRONTEND_URL }));
```

**Issue**: MongoDB Connection Failed
```
Solution: Verify MONGO_URI in .env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
```

**Issue**: JWT Token Invalid
```
Solution: Ensure token is in Authorization header
Authorization: Bearer {actual_token_here}
```

**Issue**: Socket.IO Not Connecting
```
Solution: Ensure Socket.IO is running on same server
Check CORS in Socket.IO: cors: { origin: "*" }
```

**Issue**: Cron Jobs Not Running
```
Solution: Verify node-schedule is installed
Check initializeCronJobs() is called in server.js
```

## 📞 API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": 400
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## 🎓 Learning Path

1. **Start**: Read IMPLEMENTATION_SUMMARY.md
2. **Understand**: Review database schemas
3. **Learn**: Check API_DOCUMENTATION.md
4. **Practice**: Test endpoints with curl/Postman
5. **Explore**: Review Socket.IO namespaces
6. **Master**: Set up automations and cron jobs

---

**Last Updated**: November 30, 2025
**Version**: 1.0.0
**Status**: Production Ready ✓
