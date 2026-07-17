import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlowingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export default function GlowingButton({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}: GlowingButtonProps) {
  const baseClasses = `btn-${variant} ${className}`;
  
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
