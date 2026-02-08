import classNames from "classnames";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    default: "bg-gray-100 dark:bg-dark-surface-hover text-gray-800 dark:text-dark-text",
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300",
    success: "bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300",
    warning: "bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300",
    danger: "bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  };

  const sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const classes = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

