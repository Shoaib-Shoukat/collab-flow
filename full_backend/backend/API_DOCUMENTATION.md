# CollabFlow Backend API Documentation

## TABLE OF CONTENTS
1. [Authentication](#authentication)
2. [Tasks API](#tasks-api)
3. [Sprints API](#sprints-api)
4. [Bugs API](#bugs-api)
5. [Backlog API](#backlog-api)
6. [Releases API](#releases-api)
7. [Analytics API](#analytics-api)
8. [Automations API](#automations-api)
9. [Dashboard API](#dashboard-api)
10. [Socket.IO Events](#socketio-events)

---

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "user": { "_id": "...", "name": "...", "email": "...", "role": "developer" },
  "token": "jwt_token"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "user": { "_id": "...", "name": "...", "email": "...", "role": "developer" },
  "token": "jwt_token"
}
```

**Header for all authenticated requests:**
```
Authorization: Bearer {token}
```

---

## Tasks API

### Create Task
```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Implement login",
  "description": "Add JWT authentication",
  "projectId": "project_id",
  "sprintId": "sprint_id",
  "assigneeId": "user_id",
  "storyPoints": 5,
  "priority": "High",
  "dueDate": "2025-12-31"
}
```

### Get Tasks
```
GET /api/tasks?projectId=xxx&sprintId=xxx&status=To Do&assigneeId=xxx
Authorization: Bearer {token}
```

### Get Task by ID
```
GET /api/tasks/:id
Authorization: Bearer {token}
```

### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "In Progress",
  "assigneeId": "new_assignee_id",
  "storyPoints": 8
}
```

### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer {token}
```

### Add Comment to Task
```
POST /api/tasks/:id/comment
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "This needs review"
}
```

### Watch Task
```
POST /api/tasks/:id/watch
Authorization: Bearer {token}
```

### Search Tasks
```
GET /api/tasks/search?q=keyword&projectId=xxx
Authorization: Bearer {token}
```

---

## Sprints API

### Create Sprint
```
POST /api/sprints
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "project_id",
  "name": "Sprint 1",
  "startDate": "2025-01-01",
  "endDate": "2025-01-14",
  "goal": "Implement auth module",
  "teamMembers": ["user_id_1", "user_id_2"]
}
```

### Get Sprints
```
GET /api/sprints?projectId=xxx&status=Active
Authorization: Bearer {token}
```

### Get Sprint by ID
```
GET /api/sprints/:id/details
Authorization: Bearer {token}
```

### Update Sprint
```
PUT /api/sprints/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal": "Updated goal"
}
```

### Start Sprint
```
POST /api/sprints/:id/start
Authorization: Bearer {token}
```

### Complete Sprint
```
POST /api/sprints/:id/complete
Authorization: Bearer {token}
```

### Add Task to Sprint
```
POST /api/sprints/:sprintId/add-task
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task_id"
}
```

### Get Sprint Report
```
GET /api/sprints/:sprintId/report
Authorization: Bearer {token}

Response:
{
  "sprintId": "...",
  "sprintName": "Sprint 1",
  "tasks": { "total": 10, "completed": 7, "inProgress": 2, "notStarted": 1 },
  "storyPoints": { "planned": 50, "completed": 35, "remaining": 15, "completionPercentage": 70 },
  "velocity": 35,
  "efficiency": 70
}
```

---

## Bugs API

### Create Bug
```
POST /api/bugs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Login button not responsive",
  "description": "Button doesn't respond on mobile",
  "severity": "High",
  "projectId": "project_id",
  "sprintId": "sprint_id",
  "assigneeId": "user_id",
  "steps": "1. Open on mobile\n2. Tap login\n3. No response",
  "reproducible": true
}
```

### Get Bugs
```
GET /api/bugs?projectId=xxx&status=Open&severity=Critical
Authorization: Bearer {token}
```

### Get Bug by ID
```
GET /api/bugs/:id
Authorization: Bearer {token}
```

### Update Bug
```
PUT /api/bugs/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "In Progress",
  "assigneeId": "assignee_id"
}
```

### Delete Bug
```
DELETE /api/bugs/:id
Authorization: Bearer {token}
```

### Add Comment to Bug
```
POST /api/bugs/:id/comment
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Fixed in latest build"
}
```

### Get Bug Stats
```
GET /api/bugs/project/:projectId/stats
Authorization: Bearer {token}

Response:
{
  "total": 15,
  "critical": 2,
  "high": 5,
  "medium": 6,
  "low": 2,
  "open": 8,
  "resolved": 7,
  "inProgress": 2
}
```

---

## Backlog API

### Get Backlog
```
GET /api/backlog/:projectId?sort=priority&filter=keyword
Authorization: Bearer {token}
```

### Add Task to Backlog
```
POST /api/backlog/:projectId/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task_id"
}
```

### Reorder Backlog
```
PUT /api/backlog/:projectId/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    { "_id": "backlog_item_1", "order": 0 },
    { "_id": "backlog_item_2", "order": 1 }
  ]
}
```

### Move Task to Sprint
```
POST /api/backlog/:projectId/move-to-sprint
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task_id",
  "sprintId": "sprint_id"
}
```

### Search Backlog
```
GET /api/backlog/:projectId/search?q=keyword
Authorization: Bearer {token}
```

---

## Releases API

### Create Release
```
POST /api/releases
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "project_id",
  "version": "1.2.0",
  "name": "Q1 Release",
  "releaseDate": "2025-03-31",
  "description": "Major feature release"
}
```

### Get Releases
```
GET /api/releases/:projectId
Authorization: Bearer {token}
```

### Get Release Details
```
GET /api/releases/:releaseId/details
Authorization: Bearer {token}
```

### Add Milestone to Release
```
POST /api/releases/:releaseId/milestone
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Alpha release",
  "description": "Internal testing phase",
  "targetDate": "2025-02-15"
}
```

### Add Task to Release
```
POST /api/releases/:releaseId/task
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task_id"
}
```

### Publish Release
```
POST /api/releases/:releaseId/publish
Authorization: Bearer {token}
Content-Type: application/json

{
  "changelog": "- New features...",
  "releaseNotes": "Version 1.2.0 released"
}
```

---

## Analytics API

### Get Sprint Analytics
```
GET /api/analytics/sprint/:projectId/:sprintId
Authorization: Bearer {token}

Response:
{
  "metrics": {
    "velocity": 45,
    "plannedVelocity": 50,
    "completedPoints": 45,
    "remainingPoints": 5,
    "totalPoints": 50,
    "burndownRate": 90,
    "cycleTime": 3,
    "completionPercentage": 90,
    "sprintCompletionScore": 90
  },
  "taskMetrics": {
    "totalTasks": 12,
    "completedTasks": 11,
    "inProgressTasks": 1,
    "blockedTasks": 0,
    "overdueTasks": 0
  }
}
```

### Get Project Analytics
```
GET /api/analytics/project/:projectId?days=30
Authorization: Bearer {token}
```

### Get Burndown Chart
```
GET /api/analytics/burndown/:sprintId
Authorization: Bearer {token}

Response:
{
  "sprintId": "...",
  "totalPoints": 50,
  "burndownChart": [
    { "date": "2025-01-01", "remainingPoints": 50, "completedPoints": 0, "plannedPoints": 45 },
    { "date": "2025-01-02", "remainingPoints": 45, "completedPoints": 5, "plannedPoints": 40 }
  ]
}
```

### Get Velocity Trend
```
GET /api/analytics/velocity/:projectId?sprints=10
Authorization: Bearer {token}
```

### Get Team Workload
```
GET /api/analytics/workload/:projectId
Authorization: Bearer {token}

Response:
[
  {
    "userId": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "taskCount": 5,
    "storyPoints": 13,
    "tasks": [...]
  }
]
```

---

## Automations API

### Create Automation
```
POST /api/automations
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "project_id",
  "name": "Critical bug alert",
  "trigger": "criticalBugAlert",
  "triggerConfig": { "severity": "Critical" },
  "actions": [
    {
      "type": "broadcastAlert",
      "config": {
        "userId": "user_id",
        "message": "Critical bug detected!"
      }
    }
  ]
}
```

### Get Automations
```
GET /api/automations/:projectId
Authorization: Bearer {token}
```

### Update Automation
```
PUT /api/automations/:automationId
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

### Execute Automation
```
POST /api/automations/:automationId/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task_id"
}
```

### Test Automation
```
GET /api/automations/:automationId/test
Authorization: Bearer {token}
```

---

## Dashboard API

### Get Dashboard Widgets
```
GET /api/dashboard/:projectId/widgets
Authorization: Bearer {token}

Response:
{
  "velocity": { "title": "Sprint Velocity", "averageVelocity": 40, "trend": [...] },
  "burndown": { "title": "Sprint Burndown", "totalPoints": 50, "completedPoints": 35, ... },
  "bugs": { "title": "Bug Report", "total": 15, "critical": 2, "open": 8, ... },
  "workload": { "title": "Team Workload", "members": [...] },
  "activity": { "title": "Recent Activity", "recentTasks": [...], "recentBugs": [...] }
}
```

### Get Sprint Dashboard
```
GET /api/dashboard/sprint/:sprintId
Authorization: Bearer {token}
```

### Get Activity Heatmap
```
GET /api/dashboard/:projectId/activity-heatmap?days=30
Authorization: Bearer {token}
```

---

## Socket.IO Events

### Tasks Namespace (`/tasks`)
```javascript
// Join sprint updates
socket.emit('watch_sprint', 'sprint_id');

// Listen for task updates
socket.on('task_changed', (data) => { /* handle */ });
socket.on('new_task', (data) => { /* handle */ });
socket.on('status_updated', (data) => { /* handle */ });
```

### Bugs Namespace (`/bugs`)
```javascript
// Watch project bugs
socket.emit('watch_project_bugs', 'project_id');

// Listen for bug events
socket.on('new_bug', (data) => { /* handle */ });
socket.on('bug_changed', (data) => { /* handle */ });
socket.on('critical_bug_alert', (data) => { /* handle */ });
```

### Sprints Namespace (`/sprints`)
```javascript
// Watch sprint
socket.emit('watch_sprint', 'sprint_id');

// Listen for sprint events
socket.on('sprint_active', (data) => { /* handle */ });
socket.on('sprint_finished', (data) => { /* handle */ });
socket.on('burndown_changed', (data) => { /* handle */ });
```

### Notifications Namespace (`/notifications`)
```javascript
// Register user
socket.emit('register_user', 'user_id');

// Listen for notifications
socket.on('notification', (data) => { /* handle */ });
socket.on('alert', (data) => { /* handle */ });
```

---

## Database Schema Overview

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: "admin" | "manager" | "developer" | "qa" | "viewer",
  avatar: String,
  notificationPreferences: Object
}
```

### Task
```javascript
{
  title: String,
  description: String,
  projectId: ObjectId,
  sprintId: ObjectId,
  assigneeId: ObjectId,
  status: "Backlog" | "To Do" | "In Progress" | "In Review" | "Done",
  priority: "Low" | "Medium" | "High" | "Critical",
  storyPoints: Number,
  dueDate: Date,
  completedDate: Date,
  comments: Array,
  attachments: Array,
  watchers: [ObjectId],
  activityLog: Array,
  timestamps: true
}
```

### Sprint
```javascript
{
  projectId: ObjectId,
  name: String,
  startDate: Date,
  endDate: Date,
  status: "Planned" | "Active" | "Completed" | "Archived",
  goal: String,
  plannedVelocity: Number,
  actualVelocity: Number,
  completedPoints: Number,
  remainingPoints: Number,
  tasks: [ObjectId],
  teamMembers: [ObjectId],
  burndownChart: Array,
  metrics: Object
}
```

### Bug
```javascript
{
  title: String,
  description: String,
  projectId: ObjectId,
  severity: "Critical" | "High" | "Medium" | "Low",
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Reopened",
  assigneeId: ObjectId,
  reproducible: Boolean,
  steps: String,
  attachments: Array,
  comments: Array,
  watchers: [ObjectId],
  activityLog: Array
}
```

### Automation
```javascript
{
  projectId: ObjectId,
  name: String,
  trigger: "onStatusChange" | "dueDateApproaching" | "criticalBugAlert" | ...,
  triggerConfig: Object,
  actions: Array,
  conditions: Array,
  isActive: Boolean,
  executionHistory: Array
}
```

---

## Cron Jobs

- **Every hour**: Check for due dates approaching
- **Every 4 hours**: Check for overdue tasks
- **Every day at 2 AM**: Archive old sprints
- **Every day at 11 PM**: Calculate sprint velocity
- **Every week**: Clean up old notifications
- **Every 30 minutes**: Check for critical bugs

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## Environment Variables

```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
PORT=5000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```
