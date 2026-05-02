const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (!parts.length) return "";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return `${first}${last}`.toUpperCase();
};

const Avatar = ({ name = "", size = "sm" }) => (
  <div className={`avatar avatar-${size}`} aria-label={`Avatar de ${name}`}>
    {getInitials(name)}
  </div>
);

export default Avatar;

