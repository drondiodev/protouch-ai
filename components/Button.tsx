
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'normal' | 'large';
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, size = 'normal', variant = 'primary', ...props }) => {
  const sizeClasses = size === 'large' 
    ? 'px-8 py-3 text-base h-12' 
    : 'px-5 py-2 text-sm h-10';

  const variantClasses = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900',
    secondary: 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-500',
  }[variant];

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-md
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;