import React from "react";

const StatCard = ({ titulo, valor, delta, accent = "blue" }) => {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-label">{titulo}</span>
      <span className="stat-value">{valor}</span>
      {delta ? (
        <span className={`stat-delta ${delta.startsWith("+") ? "positive" : "negative"}`}>
          {delta}
        </span>
      ) : null}
    </div>
  );
};

export default StatCard;
