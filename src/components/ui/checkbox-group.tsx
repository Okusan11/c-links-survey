import React, { useCallback } from 'react';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { cn } from '../../lib/utils';

interface CheckboxGroupProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  error?: boolean;
  errorMessage?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = React.memo(({
  options,
  selectedValues,
  onChange,
  className,
  error,
  errorMessage
}) => {
  const handleCheckboxChange = useCallback((value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  }, [selectedValues, onChange]);

  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => (
        <div 
          key={option} 
          className={cn(
            "flex p-3 rounded-lg transition-all border-2 hover:bg-accent/10",
            selectedValues.includes(option) 
              ? "border-primary bg-primary/5" 
              : "border-transparent hover:border-muted"
          )}
        >
          <div className="flex-shrink-0 self-center mr-3">
            <Checkbox
              id={`checkbox-${option}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={() => handleCheckboxChange(option)}
              className={selectedValues.includes(option) ? "border-primary" : ""}
            />
          </div>
          <Label
            htmlFor={`checkbox-${option}`}
            className="text-base cursor-pointer leading-normal"
          >
            {option}
          </Label>
        </div>
      ))}
      
      {error && errorMessage && (
        <div className="text-destructive text-sm mt-2 px-2 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  );
});

CheckboxGroup.displayName = 'CheckboxGroup';

export { CheckboxGroup }; 