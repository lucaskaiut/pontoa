import classNames from "classnames";

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = "",
  ...props
}) => {
  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

