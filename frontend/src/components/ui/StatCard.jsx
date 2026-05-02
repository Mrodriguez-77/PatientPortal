const accents = {
  blue: "var(--blue-primary)",
  green: "var(--success-text)",
  orange: "var(--warning-text)",
  red: "var(--error-text)",
};

const StatCard = ({ label, value, accent = "blue", delta }) => (
  <div className="stat-card" style={{ borderLeftColor: accents[accent] || accents.blue }}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
    {delta ? <span className="text-muted">{delta}</span> : null}
  </div>
);

export default StatCard;
