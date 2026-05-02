import React from "react";

const Badge = ({ estado, children }) => {
  const clase = estado ? `badge badge-${estado}` : "badge";
  return <span className={clase}>{children}</span>;
};

export default Badge;
