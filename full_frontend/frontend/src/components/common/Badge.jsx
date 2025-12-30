import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    critical: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <span className={`${variants[variant]} px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
