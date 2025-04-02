import React from 'react';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface RequiredFormLabelProps {
  label: string;
  className?: string;
}

const RequiredFormLabel: React.FC<RequiredFormLabelProps> = ({ label, className }) => {
  return (
    <div className={cn("flex items-center mb-3 gap-2", className)}>
      <Label className="text-base md:text-lg font-medium text-gray-700">{label}</Label>
      <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-md font-semibold shadow-sm">
        必須
      </span>
    </div>
  );
};

export default RequiredFormLabel; 