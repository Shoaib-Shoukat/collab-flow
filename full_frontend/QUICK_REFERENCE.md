# 🔧 CollabFlow Frontend - Quick Reference & Troubleshooting

## ⚡ QUICK START

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (Vite - fast!)
npm run dev

# Open in browser
http://localhost:5173
```

**Environment Setup** (`.env`):
```
VITE_API_BASE=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📝 QUICK REFERENCE - PAGE ROUTES

| Page | Route | Icon | Features |
|------|-------|------|----------|
| Dashboard | `/` | 📊 | Metrics, charts, quick actions |
| Kanban | `/kanban` | 📋 | Drag-drop board, 4 columns |
| Sprint | `/sprint` | 🏃 | Sprint CRUD, progress tracking |
| Backlog | `/backlog` | 📑 | Task CRUD, sorting, filtering |
| Bugs | `/bugs` | 🐛 | Bug reporting, severity levels |
| Team | `/team` | 👥 | Capacity, workload, heatmap |
| Login | `/login` | 🔐 | Authentication |
| Register | `/register` | ✍️ | User registration |

---

## 🔌 COMPONENT IMPORT QUICK REF

```javascript
// Common Components
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import ProgressBar from '@/components/common/ProgressBar';

// Charts
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import BurndownChart from '@/components/charts/BurndownChart';
import VelocityChart from '@/components/charts/VelocityChart';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '@/features/notifications/notificationSlice';

// Socket.IO
import socket from '@/socket';
```

---

## 🎨 COMPONENT USAGE EXAMPLES

### Card
```jsx
<Card hover gradient>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Button
```jsx
<Button variant="primary" size="md" icon="➕">
  Create
</Button>

<Button variant="danger" size="sm" onClick={handleDelete}>
  Delete
</Button>
```

### Badge
```jsx
<Badge variant="success">Completed</Badge>
<Badge variant="danger">Critical</Badge>
<Badge variant="warning">High</Badge>
```

### Modal
```jsx
<Modal isOpen={open} onClose={close} title="Create Task">
  {/* Form content */}
</Modal>
```

### Toast Notification
```jsx
// Dispatch from Redux
dispatch(addNotification({
  message: 'Task created!',
  type: 'success',  // 'success', 'info', 'warning', 'error'
  duration: 4000
}));
```

### ProgressBar
```jsx
<ProgressBar 
  value={5} 
  max={10}
  color="indigo"  // 'indigo', 'green', 'red', 'yellow'
  showLabel={true}
/>
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue: Socket.IO events not working
**Cause**: Backend Socket.IO server not running or wrong URL  
**Fix**:
1. Check `.env` has correct `VITE_SOCKET_URL`
2. Verify backend server is running on that port
3. Check browser console for connection errors
```javascript
// Debug: Add this to App.jsx
socket.on('connect', () => console.log('✅ Socket connected'));
socket.on('disconnect', () => console.log('❌ Socket disconnected'));
```

### Issue: Drag-drop not working in Kanban
**Cause**: Missing `react-beautiful-dnd` package  
**Fix**:
```bash
npm install react-beautiful-dnd
```

### Issue: Styles not loading / TailwindCSS not working
**Cause**: Tailwind not compiled or wrong import  
**Fix**:
1. Ensure `@import "tailwindcss"` is in `index.css`
2. Rebuild: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: API requests failing (401 Unauthorized)
**Cause**: Missing or invalid authentication token  
**Fix**:
1. Check localStorage has valid token after login
2. Verify backend is returning token correctly
3. Check `axiosClient.js` auth header setup:
```javascript
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
```

### Issue: Real-time updates not showing
**Cause**: Redux not updating properly or Socket.IO listener not registered  
**Fix**:
1. Check `App.jsx` has all Socket.IO listeners
2. Verify reducer in Redux slice handles the realtime action
3. Check Redux DevTools: `window.__REDUX_DEVTOOLS_EXTENSION__`

### Issue: Modal not closing
**Cause**: onClick handler not properly closing state  
**Fix**:
```jsx
const [open, setOpen] = useState(false);

<Modal isOpen={open} onClose={() => setOpen(false)}>
  {/* Must call setOpen(false) when done */}
</Modal>
```

---

## 📊 REDUX STATE DEBUGGING

```javascript
// In browser console:
// Get current state
JSON.stringify(store.getState(), null, 2);

// Get specific slice
store.getState().tasks;
store.getState().sprints;
store.getState().bugs;
store.getState().notifications;

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log('State updated:', store.getState());
});
```

---

## 🔄 API ENDPOINTS REQUIRED

Your backend must provide these endpoints:

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login

Tasks:
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

Sprints:
GET    /api/sprints
POST   /api/sprints
PUT    /api/sprints/:id

Bugs:
GET    /api/bugs
POST   /api/bugs
PUT    /api/bugs/:id

Socket.IO Events:
taskCreated, taskUpdated, taskDeleted
sprintUpdated
bugCreated
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Build: `npm run build`
- [ ] Output in: `dist/` folder
- [ ] Test build locally: `npm run serve`
- [ ] Check `.env` variables for production
- [ ] Set correct `VITE_API_BASE` and `VITE_SOCKET_URL`
- [ ] Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)
- [ ] Verify backend is accessible from deployed domain
- [ ] Test Socket.IO connection
- [ ] Test all CRUD operations
- [ ] Mobile responsiveness check

---

## 📦 BUILD COMMANDS

```bash
# Development
npm run dev          # Hot reload, fast, great DX

# Production Build
npm run build        # Optimized, minified, ready for deploy

# Preview Build
npm run serve        # Test the built version locally
```

---

## 🎯 DEVELOPMENT WORKFLOW

### Adding a New Component
1. Create in `src/components/[common|charts]/`
2. Export as default
3. Add props interface at top
4. Test in multiple pages

### Adding a New Page
1. Create in `src/pages/[PageName].jsx`
2. Add route in `App.jsx`
3. Add to Sidebar menu (`MENU_ITEMS`)
4. Test navigation

### Adding New Redux Slice
1. Create in `src/features/[feature]/[feature]Slice.js`
2. Add to `store.js`
3. Use in component with `useDispatch` and `useSelector`

### Adding Socket.IO Event
1. Add listener in `App.jsx` useEffect
2. Dispatch Redux action to update state
3. Dispatch notification with `addNotification()`

---

## 🎨 TAILWIND UTILITIES USED

### Colors
- `from-indigo-600` - Gradient start
- `to-purple-600` - Gradient end
- `bg-linear-to-r` - Horizontal gradient
- `bg-linear-to-b` - Vertical gradient
- `text-slate-800` - Text color
- `border-white/30` - Semi-transparent border

### Layout
- `flex`, `grid` - Display
- `items-center`, `justify-between` - Alignment
- `p-6`, `px-4`, `py-3` - Padding
- `gap-4`, `space-y-3` - Spacing
- `rounded-xl`, `rounded-full` - Border radius

### Shadows & Effects
- `shadow-lg`, `shadow-xl` - Elevation
- `backdrop-blur-md` - Blur effect
- `opacity-70` - Transparency
- `hover:shadow-lg` - Hover effects

### Animations
- `transition-all` - Smooth transitions
- `duration-300` - Animation timing
- `animate-fadeIn`, `animate-slideUp` - Custom animations

---

## 🧠 NAMING CONVENTIONS

**Components**: PascalCase  
**Files**: PascalCase for components, camelCase for utils  
**CSS Classes**: kebab-case (Tailwind built-in)  
**Variables**: camelCase  
**Constants**: UPPER_SNAKE_CASE  

```javascript
// Good ✅
const handleCreateTask = () => {}
const TaskModal = () => {}
const API_BASE_URL = ''

// Bad ❌
const HandleCreateTask = () => {}
const task_modal = () => {}
const apiBaseUrl = ''
```

---

## 📚 USEFUL RESOURCES

- [React Docs](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router v6](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- [Vite](https://vitejs.dev)

---

## 💡 PERFORMANCE TIPS

1. **Lazy Load Pages**: Use React.lazy() for routes
2. **Memoize Selectors**: Use reselect for complex Redux selectors
3. **Prevent Re-renders**: Use React.memo for expensive components
4. **Optimize Images**: Use WebP with fallbacks
5. **Code Splitting**: Let Vite handle automatic splitting
6. **Monitor Bundle**: `npm run build` shows bundle size

---

## 🎓 KEY LEARNINGS

✅ Redux + async thunks for API  
✅ Socket.IO for real-time updates  
✅ Tailwind for rapid UI development  
✅ React Router v6 for navigation  
✅ Component composition for reusability  
✅ Glassmorphism design trends  
✅ Drag-drop UX with react-beautiful-dnd  

---

**Happy Coding! 🚀**  
*Last Updated: Nov 30, 2025*
