import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Avatar from "../components/ui/Avatar.jsx";

const Profile = () => {
  const { patient, getProfile, changePassword } = useAuth();
  const { pushToast } = useToast();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => null);
  }, [getProfile]);

  useEffect(() => {
    if (location.hash === "#password") {
      document.getElementById("password")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = "Campo requerido";
    if (!form.newPassword || form.newPassword.length < 6) nextErrors.newPassword = "Mínimo 6 caracteres";
    if (form.newPassword !== form.confirmPassword) nextErrors.confirmPassword = "No coincide";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      pushToast({ type: "success", title: "Actualizado", message: "Contraseña modificada" });
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="text-muted">Inicio / Mi Perfil</div>
          <h2>Mi Perfil</h2>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              <Avatar name={patient?.name || "Paciente"} size="lg" />
              <div>
                <h3>{patient?.name || profile?.fullName}</h3>
                <p className="text-secondary">Paciente</p>
              </div>
            </div>
            <div className="grid" style={{ gap: 10 }}>
              <div>
                <span className="label">Email</span>
                <p>{patient?.email || profile?.email || "-"}</p>
              </div>
              <div>
                <span className="label">Teléfono</span>
                <p>{profile?.phone || "-"}</p>
              </div>
              <div>
                <span className="label">Fecha nacimiento</span>
                <p>{profile?.birthDate || "-"}</p>
              </div>
              <div>
                <span className="label">Rol</span>
                <p>Paciente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="password">
          <div className="card-header">Cambiar contraseña</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-stack">
              <label className="field">
                <span className="label">Contraseña actual</span>
                <input type="password" name="currentPassword" value={form.currentPassword} onChange={onChange} />
                {errors.currentPassword ? <span className="error-text">{errors.currentPassword}</span> : null}
              </label>
              <label className="field">
                <span className="label">Nueva contraseña</span>
                <input type="password" name="newPassword" value={form.newPassword} onChange={onChange} />
                {errors.newPassword ? <span className="error-text">{errors.newPassword}</span> : null}
              </label>
              <label className="field">
                <span className="label">Confirmar contraseña</span>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} />
                {errors.confirmPassword ? <span className="error-text">{errors.confirmPassword}</span> : null}
              </label>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

