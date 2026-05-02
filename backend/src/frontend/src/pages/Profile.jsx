import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useToast, TIPOS } from "../components/ui/Toast.jsx";
import Avatar from "../components/ui/Avatar.jsx";

const Profile = () => {
  const { paciente, getProfile, changePassword } = useAuth();
  const { pushToast } = useToast();
  const location = useLocation();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(setPerfil).catch(() => null);
  }, []);

  useEffect(() => {
    if (location.hash === "#cambiar-password") {
      document.getElementById("cambiar-password")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value) setErrors((prev) => ({ ...prev, [name]: "Campo requerido" }));
  };

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Campo requerido";
    if (!form.newPassword || form.newPassword.length < 6) next.newPassword = "Minimo 6 caracteres";
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = "No coincide";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      pushToast({ tipo: TIPOS.success, titulo: "Actualizado", mensaje: "Contrasena modificada" });
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            Inicio / <strong>Mi Perfil</strong>
          </div>
          <h2>Mi Perfil</h2>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              <Avatar nombre={paciente?.nombre || "Paciente"} size="lg" />
              <div>
                <h3>{paciente?.nombre || perfil?.fullName}</h3>
                <p className="text-secondary">Paciente</p>
              </div>
            </div>
            <div className="grid" style={{ gap: 10 }}>
              <div>
                <span className="label">Email</span>
                <p>{paciente?.email || perfil?.email}</p>
              </div>
              <div>
                <span className="label">Telefono</span>
                <p>{perfil?.phone || "-"}</p>
              </div>
              <div>
                <span className="label">Fecha nacimiento</span>
                <p>{perfil?.birthDate || "-"}</p>
              </div>
              <div>
                <span className="label">Rol</span>
                <p>Paciente</p>
              </div>
              <div>
                <span className="label">Miembro desde</span>
                <p>{perfil?.createdAt || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="cambiar-password">
          <div className="card-header">Cambiar contraseña</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-stack">
              <label className="field">
                <span className="label">Contrasena actual</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.currentPassword ? <span className="error-text">{errors.currentPassword}</span> : null}
              </label>
              <label className="field">
                <span className="label">Nueva contraseña</span>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.newPassword ? <span className="error-text">{errors.newPassword}</span> : null}
              </label>
              <label className="field">
                <span className="label">Confirmar contraseña</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.confirmPassword ? <span className="error-text">{errors.confirmPassword}</span> : null}
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Cargando...
                  </span>
                ) : (
                  "Actualizar"
                )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
