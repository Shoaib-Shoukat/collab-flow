import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  icon = null
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    success: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-lg',
    danger: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg',
    ghost: 'border border-slate-300 text-slate-800 hover:bg-slate-100'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} font-medium shadow transition-all duration-300 flex items-center gap-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
