import classNames from "classnames";

export const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = true,
  border = true,
  hover = false,
  ...props
}) => {
  const baseClasses = "rounded-xl bg-white dark:bg-dark-surface transition-all duration-200";

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const classes = classNames(
    baseClasses,
    paddingClasses[padding],
    {
      "shadow-sm": shadow,
      "border border-gray-200 dark:border-dark-border": border,
      "hover:shadow-md hover:-translate-y-0.5": hover,
    },
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={classNames("mb-4", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3
      className={classNames(
        "text-lg font-semibold text-gray-900 dark:text-dark-text",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={classNames("", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div className={classNames("mt-4 pt-4 border-t border-gray-200 dark:border-dark-border", className)} {...props}>
      {children}
    </div>
  );
};

