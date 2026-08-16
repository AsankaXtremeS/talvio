import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ 
  children, 
  onClick,
  type = 'button'
}: ButtonProps) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className="w-full px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600"
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
};