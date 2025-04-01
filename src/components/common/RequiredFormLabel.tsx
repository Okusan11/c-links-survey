import React from 'react';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface RequiredFormLabelProps {
  label: string;
  className?: string;
}

const RequiredFormLabel: React.FC<RequiredFormLabelProps> = ({ label, className }) => {
  return (
    <div className={cn("flex items-center mb-2 gap-2", className)}>
      <Label className="text-base font-medium">{label}</Label>
      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded font-medium">
        必須
      </span>
    </div>
  );
};

export default RequiredFormLabel; 