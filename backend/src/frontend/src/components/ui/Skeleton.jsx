import React from "react";

const Skeleton = ({ height = 12, width = "100%", radius = 8 }) => {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius: radius }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
