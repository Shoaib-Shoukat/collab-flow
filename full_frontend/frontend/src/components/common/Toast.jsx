import React, { useEffect, useState } from 'react';

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  if (!isVisible) return null;

  return (
    <div className={`${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg animate-slideIn`}>
      {message}
    </div>
  );
}
