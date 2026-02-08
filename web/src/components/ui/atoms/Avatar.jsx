import classNames from "classnames";

export const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const classes = classNames(
    "rounded-full flex items-center justify-center font-semibold",
    "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
    "border-2 border-white dark:border-dark-surface",
    sizeClasses[size],
    className
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={classNames("rounded-full object-cover", sizeClasses[size], className)}
        {...props}
      />
    );
  }

  return (
    <div className={classes} {...props}>
      {getInitials(name)}
    </div>
  );
};

