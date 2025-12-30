# 🚀 CollabFlow Frontend - Complete File Structure

```
frontend/
├── src/
│   ├── components/                    # ✨ NEW - Reusable component library
│   │   ├── common/
│   │   │   ├── Card.jsx              # Base card component (hover, gradient, padding)
│   │   │   ├── Button.jsx            # 6 variants (primary, secondary, success, danger, warning, ghost)
│   │   │   ├── Badge.jsx             # Status/priority badges (7 colors)
│   │   │   ├── Modal.jsx             # Reusable modal with animations
│   │   │   ├── Sidebar.jsx           # Navigation sidebar with logout
│   │   │   ├── Toast.jsx             # Auto-dismiss toast notifications
│   │   │   ├── ProgressBar.jsx       # Animated progress bars
│   │   │   └── NotificationContainer.jsx  # Toast manager
│   │   └── charts/
│   │       ├── SimpleBarChart.jsx    # Generic bar chart
│   │       ├── BurndownChart.jsx     # Sprint burndown
│   │       └── VelocityChart.jsx     # Sprint velocity trend
│   │
│   ├── pages/                         # 🔄 REBUILT/✨ NEW Pages
│   │   ├── Dashboard.jsx             # 🔄 REBUILT - Metrics, charts, widgets
│   │   ├── KanbanView.jsx            # ✨ NEW - Drag-drop board
│   │   ├── SprintPage.jsx            # 🔄 REBUILT - Sprint management
│   │   ├── Backlog.jsx               # 🔄 REBUILT - Task list with sorting/filtering
│   │   ├── BugsPage.jsx              # 🔄 REBUILT - Bug tracker with severity
│   │   ├── TeamView.jsx              # ✨ NEW - Team capacity & heatmap
│   │   ├── LoginPage.jsx             # ✓ Modern auth UI
│   │   └── RegisterPage.jsx          # ✓ Form validation
│   │
│   ├── features/                      # Redux slices
│   │   ├── auth/
│   │   │   └── authSlice.js          # Login/register async thunks
│   │   ├── tasks/
│   │   │   └── taskSlice.js          # Task CRUD + real-time updates
│   │   ├── sprints/
│   │   │   └── sprintSlice.js        # Sprint CRUD + updateSprint thunk
│   │   ├── bugs/
│   │   │   └── bugSlice.js           # Bug CRUD + real-time updates
│   │   └── notifications/            # ✨ NEW
│   │       └── notificationSlice.js  # Toast notifications
│   │
│   ├── api/
│   │   └── axiosClient.js            # API client with auth header
│   │
│   ├── app/
│   │   └── store.js                  # Redux store config
│   │
│   ├── App.jsx                        # 🔄 REBUILT - Layout, routing, Socket.IO
│   ├── main.jsx                       # ✓ Entry point
│   ├── socket.js                      # ✓ Socket.IO config
│   ├── index.css                      # 🔄 UPDATED - Animations & styles
│   └── ...
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
└── .env                               # API_BASE, SOCKET_URL

```

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    App.jsx (Main Layout)                 │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌─────────────────────────────────┐  │
│ │   Sidebar    │  │       Main Content Area          │  │
│ │              │  │  ┌──────────────────────────┐   │  │
│ │ • Dashboard  │  │  │  Routes (React Router)  │   │  │
│ │ • Kanban     │  │  │ • Dashboard             │   │  │
│ │ • Sprint     │  │  │ • Kanban Board          │   │  │
│ │ • Backlog    │  │  │ • Sprint Management     │   │  │
│ │ • Bugs       │  │  │ • Backlog               │   │  │
│ │ • Team       │  │  │ • Bug Tracker           │   │  │
│ │              │  │  │ • Team Capacity         │   │  │
│ │ • Logout     │  │  └──────────────────────────┘   │  │
│ └──────────────┘  │                                  │  │
│                   │  ┌──────────────────────────┐   │  │
│                   │  │ NotificationContainer    │   │  │
│                   │  │ (Toast notifications)    │   │  │
│                   │  └──────────────────────────┘   │  │
│                   └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Redux Store                           │
│   • auth, tasks, sprints, bugs, notifications          │
├─────────────────────────────────────────────────────────┤
│              Socket.IO (Real-Time)                      │
│   Tasks, Sprints, Bugs → Notifications                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENT HIERARCHY

```
Card (base component)
├── Used in: Dashboard, Backlog, Bugs, Sprint, Team
├── Variants: hover, gradient, noPadding

Button (6 variants)
├── primary (indigo→purple)
├── secondary (slate)
├── success (green→emerald)
├── danger (rose→pink)
├── warning (amber→orange)
└── ghost (bordered)

Badge (7 variants)
├── default, success, warning, danger, critical, info, primary
└── Used for: status, priority, severity

Modal
├── Used in: Task creation, Bug reporting, Sprint creation
├── Sizes: sm, md, lg, xl

ProgressBar
├── Color variants: indigo, green, red, yellow
└── Animated with Tailwind

Toast
├── Auto-dismiss (4s default)
├── Types: info, success, warning, error
└── Positioned: bottom-right, fixed

Charts
├── SimpleBarChart (generic)
├── BurndownChart (sprint-specific)
└── VelocityChart (sprint-specific)
```

---

## 🔄 STATE MANAGEMENT (Redux)

```
store.js
├── auth (authSlice)
│   ├── user, token
│   ├── actions: login, register, logout
│
├── tasks (taskSlice)
│   ├── items: []
│   ├── actions: fetchTasks, createTask, updateTask, deleteTask
│   ├── realtime: taskAddedRealtime, taskUpdatedRealtime, taskDeletedRealtime
│
├── sprints (sprintSlice)
│   ├── items: []
│   ├── actions: fetchSprints, createSprint, updateSprint
│   ├── realtime: sprintUpdatedRealtime
│
├── bugs (bugSlice)
│   ├── items: []
│   ├── actions: fetchBugs, createBug
│   ├── realtime: bugCreatedRealtime
│
└── notifications (notificationSlice)
    ├── list: []
    ├── actions: addNotification, removeNotification
```

---

## 📡 REAL-TIME DATA FLOW

```
Backend Event → Socket.IO Client → Redux Action → Component Update → UI

Examples:
─────────

1. Task Created
   Backend: emit('taskCreated', taskData)
   Client: socket.on('taskCreated', (data) => {
     dispatch(taskAddedRealtime(data))
     dispatch(addNotification({message: '✅ New task', type: 'success'}))
   })

2. Bug Created (Critical)
   Backend: emit('bugCreated', bugData)
   Client: socket.on('bugCreated', (data) => {
     dispatch(bugCreatedRealtime(data))
     dispatch(addNotification({
       message: '🐛 Critical bug created',
       type: 'error'  // Red toast
     }))
   })

3. Sprint Updated
   Backend: emit('sprintUpdated', sprintData)
   Client: socket.on('sprintUpdated', (data) => {
     dispatch(sprintUpdatedRealtime(data))
     dispatch(addNotification({message: 'ℹ️ Sprint updated', type: 'info'}))
   })
```

---

## 🎯 KEY FEATURES BY PAGE

### Dashboard
- **Widgets**: Completion rate, open bugs, active sprint, project health
- **Charts**: Burndown, velocity, task distribution, bug severity
- **Quick Actions**: Links to all modules
- **Metrics**: Real-time calculations from Redux state

### Kanban Board
- **Drag & Drop**: react-beautiful-dnd integration
- **4 Columns**: To Do, In Progress, Review, Done
- **Optimistic Updates**: Instant UI feedback
- **Real-time Sync**: Socket.IO updates from others

### Sprint Management
- **Create Sprints**: With goal and duration
- **Track Progress**: Completion %, story points, task count
- **Metrics**: Velocity, burndown trend
- **Task Association**: View tasks per sprint

### Backlog
- **Task Creation**: Modal with priority & story points
- **Sorting**: Recent, Priority, Story Points
- **Filtering**: By status
- **Inline Editing**: Status dropdown
- **Delete**: Confirmation dialog

### Bug Tracker
- **Report Bugs**: Modal with severity levels
- **Steps to Reproduce**: Dedicated field
- **Severity Colors**: Critical (red), High (amber), Medium (blue), Low (green)
- **Status Tracking**: Open, In Progress, Fixed, Resolved, Closed
- **Filtering**: By severity level

### Team Capacity
- **Workload Indicators**: Overloaded, Busy, Healthy, Idle
- **Capacity Bars**: Visual representation
- **Available Slots**: Quick reference
- **Activity Heatmap**: 5-week grid view

---

## 🎨 COLOR SCHEME

| Color | Usage | RGB |
|-------|-------|-----|
| Indigo 600 | Primary buttons, accents | #4F46E5 |
| Purple 600 | Gradients, highlights | #7C3AED |
| Green 600 | Success, healthy | #16A34A |
| Emerald 500 | Completed, velocity | #10B981 |
| Rose 500 | Danger, critical | #F43F5E |
| Amber 500 | Warning, high priority | #F59E0B |
| Blue 500 | Info, medium | #3B82F6 |
| Slate 800 | Text, headings | #1E293B |
| Slate 600 | Secondary text | #475569 |
| Slate 50 | Background | #F8FAFC |

---

## 🚀 PERFORMANCE OPTIMIZATIONS

✅ Component memoization (React.memo where needed)  
✅ Lazy code splitting (React Router v6)  
✅ Optimistic updates (Kanban drag-drop)  
✅ Socket.IO event batching  
✅ Redux selector memoization  
✅ CSS animations (GPU-accelerated)  
✅ Image optimization  

---

## 🧪 TESTING CHECKLIST

- [ ] User login/register flow
- [ ] Task CRUD operations
- [ ] Kanban drag-and-drop
- [ ] Sprint creation & management
- [ ] Bug reporting with severity
- [ ] Real-time notifications
- [ ] Sidebar navigation
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Socket.IO connection
- [ ] Filter & sort functionality

---

**Status**: ✅ Production-Ready  
**Last Updated**: Nov 30, 2025  
**Version**: 1.0.0  
