import React from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  rows?: number;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  rows,
  className = '',
}) => {
  const isTextArea = rows && rows > 1;
  const commonClasses = `w-full p-4 border border-white/10 rounded-xl bg-black/40 text-slate-100 placeholder-slate-600
    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all duration-200 font-medium text-base`;

  return (
    <div className={`mb-6 ${className}`}>
      <label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          id={label.toLowerCase().replace(/\s/g, '-')}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${commonClasses} resize-none`}
        />
      ) : (
        <input
          id={label.toLowerCase().replace(/\s/g, '-')}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default Input;