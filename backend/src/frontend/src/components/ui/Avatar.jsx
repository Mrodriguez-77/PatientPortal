import React from "react";

const getInitials = (nombre = "") => {
  const partes = nombre.trim().split(" ");
  if (!partes.length) return "";
  const first = partes[0]?.[0] || "";
  const last = partes.length > 1 ? partes[partes.length - 1]?.[0] : "";
  return `${first}${last}`.toUpperCase();
};

const Avatar = ({ nombre = "", size = "sm" }) => {
  return (
    <div className={`avatar avatar-${size}`} aria-label={`Avatar de ${nombre}`}>
      {getInitials(nombre)}
    </div>
  );
};

export default Avatar;
