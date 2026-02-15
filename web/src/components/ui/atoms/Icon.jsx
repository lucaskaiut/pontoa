import { Icon as MdiIcon } from "@mdi/react";
import classNames from "classnames";

export const Icon = ({
  path,
  size = 1,
  className = "",
  ...props
}) => {
  return (
    <MdiIcon
      path={path}
      size={size}
      className={classNames("shrink-0", className)}
      {...props}
    />
  );
};

