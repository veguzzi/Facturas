"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline:
          "border border-input bg-background hover:bg-muted text-foreground",
        ghost: "hover:bg-muted text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        destructive: "bg-destructive text-white hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

/* ---------------- Input ---------------- */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* ---------------- CurrencyInput (COP, separador de miles) ---------------- */
const copFormatter = new Intl.NumberFormat("es-CO");

export function CurrencyInput({
  value,
  onValueChange,
  className,
  placeholder = "0",
  ...props
}: {
  value: number;
  onValueChange: (value: number) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>) {
  const format = (n: number) => (n > 0 ? copFormatter.format(n) : "");
  const [display, setDisplay] = React.useState(() => format(value));

  // Sincroniza cuando el valor cambia desde fuera (reset, duplicar, etc.)
  React.useEffect(() => {
    const digits = display.replace(/[^\d]/g, "");
    const current = digits ? parseInt(digits, 10) : 0;
    if (current !== value) setDisplay(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    const num = digits ? parseInt(digits, 10) : 0;
    setDisplay(digits ? copFormatter.format(num) : "");
    onValueChange(num);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <input
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-6 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

/* ---------------- Textarea ---------------- */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/* ---------------- Select (native) ---------------- */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

/* ---------------- Label ---------------- */
export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </label>
  );
}

/* ---------------- Field (label + control + error) ---------------- */
export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Badge ---------------- */
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "muted";
}) {
  const styles = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Switch ---------------- */
export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer",
        checked ? "bg-primary" : "bg-muted-foreground/40"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/* ---------------- Checkbox ---------------- */
export function Checkbox({
  checked,
  onCheckedChange,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-input accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}
