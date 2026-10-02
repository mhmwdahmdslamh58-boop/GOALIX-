import React from 'react';
import { sounds } from '../../services/audio';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'dark' | 'outline' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sounds.playTap();
      onClick?.(e);
    }
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs min-h-[38px]',
    md: 'py-2.5 px-5 text-sm min-h-[44px]',
    lg: 'py-3.5 px-6 text-base font-bold min-h-[50px]'
  }[size];

  const variantClasses = {
    gold: 'btn-gold rounded-xl',
    dark: 'btn-dark rounded-xl',
    secondary: 'btn-dark rounded-xl',
    outline: 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 active:translate-y-1 rounded-xl transition-all',
    danger: 'bg-red-950/80 border border-red-700/50 text-red-200 hover:bg-red-900 active:translate-y-1 rounded-xl transition-all'
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center font-medium tracking-wide cursor-pointer select-none transition-transform duration-100 ${variantClasses} ${sizeClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
