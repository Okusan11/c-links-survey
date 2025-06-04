import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-input bg-gradient-to-br from-white to-gray-50/30",
          "px-4 py-3 text-base font-medium shadow-soft",
          "ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium",
          "placeholder:text-muted-foreground/70 placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
          "focus-visible:border-primary/40 focus-visible:shadow-medium focus-visible:bg-white",
          "hover:border-gray-300/80 hover:shadow-medium hover:bg-white",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          "transition-all duration-300 ease-out",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 