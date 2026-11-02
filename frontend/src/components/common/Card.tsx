import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'primary' | 'danger' | 'amber';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
}) => {
  let glowClasses = 'glass-card hover:border-slate-700/80 transition-all duration-200';
  if (glow === 'primary') glowClasses = 'glass-card-glow';
  if (glow === 'danger') glowClasses = 'glass-card-danger';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 md:p-6 ${glowClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
