import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-b ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export default Card;
