const classes = {
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  info: "badge-info",
};

const Badge = ({ variant = "info", children }) => (
  <span className={`badge ${classes[variant] || classes.info}`}>{children}</span>
);

export default Badge;
