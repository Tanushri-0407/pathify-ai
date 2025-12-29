import React from 'react';

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 text-lg tracking-wide uppercase
        ${disabled
          ? 'bg-indigo-600/60 text-white/80 cursor-default border border-white/10 animate-pulse brightness-110'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform active:scale-[0.98]'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;