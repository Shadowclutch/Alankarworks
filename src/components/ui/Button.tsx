"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-primary text-cream hover:bg-primary-dark focus:ring-primary/50",
  secondary:
    "bg-charcoal text-cream hover:bg-charcoal/80 focus:ring-charcoal/50",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-cream focus:ring-primary/50",
  ghost:
    "text-charcoal/70 hover:bg-warm-gray focus:ring-charcoal/50",
  danger:
    "bg-red-700 text-white hover:bg-red-800 focus:ring-red-500/50",
}

const sizes = {
  sm: "h-9 px-4 text-xs uppercase tracking-wider",
  md: "h-11 px-6 text-sm uppercase tracking-wider",
  lg: "h-13 px-8 text-sm uppercase tracking-wider",
}

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize }
