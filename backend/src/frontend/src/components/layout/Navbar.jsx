import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../services/auth.jsx";
import useWebSocket from "../../services/useWebSocket.js";
import api, { normalize } from "../../services/api.js";

const Navbar = () => {
  const { paciente, token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { messages } = useWebSocket(paciente?.id, token);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadUnread = async () => {
    if (!token) return;
    try {
      const data = await api.get("/api/patient/notifications?page=0&size=10&read=false", token);
      const normal = normalize(data);
      setUnreadCount(normal.list?.length || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnread();
  }, [token]);

  useEffect(() => {
    if (messages?.length) loadUnread();
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div
          className="logo"
          onClick={() => navigate("/dashboard")}
          onKeyDown={(event) => event.key === "Enter" && navigate("/dashboard")}
          role="button"
          tabIndex={0}
        >
          <span className="logo-icon">+</span>
          <span className="logo-text">Patient Portal</span>
        </div>
      </div>

      <nav className="navbar-links desktop-only">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}
        >
          Inicio
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}
        >
          Citas
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) => `nav-with-badge ${isActive ? "active" : ""}`}
        >
          Notificaciones
          {unreadCount > 0 ? <span className="nav-badge">{unreadCount}</span> : null}
        </NavLink>
        <NavLink to="/ws-demo" className={({ isActive }) => (isActive ? "active" : "")}
        >
          Tiempo Real
        </NavLink>
      </nav>

      <div className="navbar-right" ref={menuRef}>
        <button
          type="button"
          className="user-pill"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar nombre={paciente?.nombre || "Paciente"} size="sm" />
          <span>{paciente?.nombre || "Paciente"}</span>
        </button>
        {menuOpen ? (
          <div className="dropdown">
            <div className="dropdown-header">
              <strong>{paciente?.nombre || "Paciente"}</strong>
              <span>{paciente?.email || ""}</span>
            </div>
            <button type="button" onClick={() => {
              setMenuOpen(false);
              navigate("/profile");
            }}>Mi perfil</button>
            <button type="button" onClick={() => {
              setMenuOpen(false);
              navigate("/profile#cambiar-password");
            }}>
              Cambiar contraseña
            </button>
            <div className="dropdown-divider" />
            <button type="button" className="danger" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        ) : null}
      </div>

      {drawerOpen ? (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div className="logo">
                <span className="logo-icon">+</span>
                <span className="logo-text">Patient Portal</span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menu"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <nav className="drawer-links">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setDrawerOpen(false)}
              >
                Inicio
              </NavLink>
              <NavLink
                to="/appointments"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setDrawerOpen(false)}
              >
                Citas
              </NavLink>
              <NavLink
                to="/notifications"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setDrawerOpen(false)}
              >
                Notificaciones
              </NavLink>
              <NavLink
                to="/ws-demo"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setDrawerOpen(false)}
              >
                Tiempo Real
              </NavLink>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
