import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useToast, TIPOS } from "../components/ui/Toast.jsx";

const initialLogin = { email: "", password: "" };
const initialRegister = {
  fullName: "",
  email: "",
  password: "",
  birthDate: "",
  phone: "",
};

const Login = () => {
  const { token, login, register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  useEffect(() => {
    setErrors({});
  }, [mode]);

  const validateField = (name, value) => {
    if (!value) return "Campo requerido";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) return "Email invalido";
    if (name === "password" && value.length < 6) return "Minimo 6 caracteres";
    return "";
  };

  const currentForm = mode === "login" ? loginForm : registerForm;

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const canSubmit = useMemo(() => {
    return Object.values(errors).every((error) => !error) &&
      Object.values(currentForm).every((value) => value !== "");
  }, [errors, currentForm]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(loginForm.email, loginForm.password);
        pushToast({ tipo: TIPOS.success, titulo: "Bienvenido", mensaje: "Sesion iniciada" });
        navigate("/dashboard");
      } else {
        await register(registerForm);
        pushToast({ tipo: TIPOS.success, titulo: "Registro completo", mensaje: "Ahora puedes ingresar" });
        setMode("login");
      }
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="card login-card">
        <div className="login-logo">
          <span className="logo-icon">+</span>
          <div>
            <h2>Patient Portal</h2>
            <p className="text-secondary">Accede a tus citas medicas</p>
          </div>
        </div>
        <div className="login-toggle">
          <button
            type="button"
            className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("login")}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={`btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("register")}
          >
            Crear cuenta
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <label className="field">
                <span className="label">Nombre completo</span>
                <input
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleChange(setRegisterForm)}
                  onBlur={handleBlur}
                />
                {errors.fullName ? <span className="error-text">{errors.fullName}</span> : null}
              </label>
              <label className="field">
                <span className="label">Email</span>
                <input
                  name="email"
                  value={registerForm.email}
                  onChange={handleChange(setRegisterForm)}
                  onBlur={handleBlur}
                />
                {errors.email ? <span className="error-text">{errors.email}</span> : null}
              </label>
              <label className="field">
                <span className="label">Contrasena</span>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleChange(setRegisterForm)}
                  onBlur={handleBlur}
                />
                {errors.password ? <span className="error-text">{errors.password}</span> : null}
              </label>
              <label className="field">
                <span className="label">Fecha de nacimiento</span>
                <input
                  type="date"
                  name="birthDate"
                  value={registerForm.birthDate}
                  onChange={handleChange(setRegisterForm)}
                />
              </label>
              <label className="field">
                <span className="label">Telefono</span>
                <input
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleChange(setRegisterForm)}
                />
              </label>
            </>
          ) : (
            <>
              <label className="field">
                <span className="label">Email</span>
                <input
                  name="email"
                  value={loginForm.email}
                  onChange={handleChange(setLoginForm)}
                  onBlur={handleBlur}
                />
                {errors.email ? <span className="error-text">{errors.email}</span> : null}
              </label>
              <label className="field">
                <span className="label">Contrasena</span>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleChange(setLoginForm)}
                  onBlur={handleBlur}
                />
                {errors.password ? <span className="error-text">{errors.password}</span> : null}
              </label>
              <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }}>
                Olvidaste tu contraseña
              </button>
            </>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 16, width: "100%" }}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Cargando...
              </span>
            ) : mode === "login" ? (
              "Ingresar"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
