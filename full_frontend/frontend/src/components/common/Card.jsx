import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  noPadding = false,
  gradient = false,
  hover = false,
  onClick 
}) {
  const baseStyles = `bg-white/80 backdrop-blur-md rounded-2xl shadow border border-white/30 transition-all duration-300 ${
    noPadding ? '' : 'p-6'
  } ${
    hover ? 'hover:shadow-lg hover:scale-[1.01] cursor-pointer' : ''
  } ${
    gradient ? 'bg-gradient-to-br from-white/90 to-white/70' : ''
  }`;

  return (
    <div className={`${baseStyles} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
