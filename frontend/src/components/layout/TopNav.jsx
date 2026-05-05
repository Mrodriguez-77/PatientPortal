import React, { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../services/auth.jsx";

const TopNav = () => {
  const { patient, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
          <span className="logo-icon">+</span>
          <span className="logo-text">Patient Portal</span>
        </div>
      </div>
      <nav className={`navbar-links ${mobileOpen ? "open" : ""}`}>
        <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>Inicio</NavLink>
        <NavLink to="/appointments" onClick={() => setMobileOpen(false)}>Citas</NavLink>
        <NavLink to="/notifications" onClick={() => setMobileOpen(false)}>Notificaciones</NavLink>
        {import.meta.env.DEV && (
          <NavLink to="/ws-demo" onClick={() => setMobileOpen(false)}>Tiempo real</NavLink>
        )}
      </nav>
      <div className="navbar-right" ref={menuRef}>
        <button
          type="button"
          className="navbar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <button type="button" className="user-pill" onClick={() => setOpen((prev) => !prev)}>
          <Avatar name={patient?.name || "Paciente"} size="sm" />
          <span>{patient?.name || "Paciente"}</span>
        </button>
        {open ? (
          <div className="dropdown">
            <div className="dropdown-header">
              <strong>{patient?.name || "Paciente"}</strong>
              <span>{patient?.email || ""}</span>
            </div>
            <button type="button" onClick={() => navigate("/profile")}>Mi perfil</button>
            <button type="button" onClick={() => navigate("/profile#password")}>Cambiar contrasena</button>
            <div className="dropdown-divider" />
            <button type="button" className="danger" onClick={() => { logout(); navigate("/login"); }}>
              Cerrar sesion
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default TopNav;

