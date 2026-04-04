"use client";

import { clsx, type ClassValue } from "clsx";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Variant = "primary" | "secondary" | "danger" | "warning" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  outline?: boolean;
  size?: Size;
  loading?: boolean;
};

const baseStyles = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 " + "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variantStyles: Record<Variant, { solid: string; outline: string }> = {
  primary: {
    solid: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:ring-blue-500",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  },
  secondary: {
    solid: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 shadow-none",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 focus:ring-slate-200 shadow-none",
  },
  danger: {
    solid: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500",
    outline: "border-2 border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-500",
  },
  warning: {
    solid: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 focus:ring-amber-500",
    outline: "border-2 border-amber-500 text-amber-500 hover:bg-amber-50 focus:ring-amber-500",
  },
  ghost: {
    solid: "bg-transparent hover:bg-blue-50 text-blue-600 shadow-none",
    outline: "border-2 border-transparent hover:border-blue-100 text-blue-600 shadow-none",
  },
};

export default function Button({ children, className, variant = "primary", outline = false, size = "md", loading = false, disabled, ...props }: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant][outline ? "outline" : "solid"],
        className,
      )}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
