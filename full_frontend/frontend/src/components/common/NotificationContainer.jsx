import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../features/notifications/notificationSlice';
import Toast from './Toast';

export default function NotificationContainer() {
  const notifications = useSelector(s => s.notifications.list);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-8 right-8 space-y-3 z-40 max-w-sm">
      {notifications.map(notification => (
        <div key={notification.id} className="animate-slideIn">
          <Toast
            message={notification.message}
            type={notification.type || 'info'}
            duration={notification.duration || 4000}
            onClose={() => dispatch(removeNotification(notification.id))}
          />
        </div>
      ))}
    </div>
  );
}
