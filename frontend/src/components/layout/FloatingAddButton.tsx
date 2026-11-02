import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2.5 px-5 py-3.5 rounded-full bg-primary text-black font-extrabold text-sm shadow-neon hover:shadow-neon-strong hover:scale-105 active:scale-95 transition-all group"
      aria-label="Add Expense"
    >
      <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center group-hover:rotate-90 transition-transform">
        <Plus size={16} className="text-black stroke-[3]" />
      </div>
      <span>Add Expense</span>
    </button>
  );
};
