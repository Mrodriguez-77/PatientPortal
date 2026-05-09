const accents = {
  blue: "var(--blue-primary)",
  green: "var(--success-text)",
  orange: "var(--warning-text)",
  red: "var(--error-text)",
};

// delta is optional — omit the prop to render nothing below the value
const StatCard = ({ label, value, accent = "blue", delta, onClick }) => (
  <div
    className={`stat-card ${onClick ? "clickable" : ""}`}
    style={{ borderLeftColor: accents[accent] || accents.blue }}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    } : undefined}
  >
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
    {delta != null ? <span className="text-muted">{delta}</span> : null}
  </div>
);

export default StatCard;

