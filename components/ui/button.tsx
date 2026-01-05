import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "warning" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  outline?: boolean;
  size?: Size;
  loading?: boolean;
};

const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition " + "focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm active:scale-[0.98]";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const variantStyles: Record<
  Variant,
  {
    solid: string;
    outline: string;
  }
> = {
  primary: {
    solid: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  },
  secondary: {
    solid: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  },
  danger: {
    solid: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
  },
  warning: {
    solid: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    outline: "border-0 text-white shadow-lg hover:shadow-amber-500/50",
  },
  ghost: {
    solid: "bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white",
    outline: "border border-slate-600 hover:border-slate-500",
  },
};

export default function Button({ children, className, variant = "primary", outline = false, size = "md", loading = false, disabled, ...props }: Props) {
  const isDisabled = disabled || loading;

  return (
    <button {...props} disabled={isDisabled} className={clsx(baseStyles, sizeStyles[size], variantStyles[variant][outline ? "outline" : "solid"], isDisabled && "opacity-50 cursor-not-allowed", className)}>
      {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
