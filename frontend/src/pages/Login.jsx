import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { api } from "../services/api.js";

const Login = () => {
  const { token, login, register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    birthDate: "",
    phone: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  useEffect(() => {
    setErrors({});
  }, [mode]);

  const validate = (field, value) => {
    if (!value) return "Campo requerido";
    if (field === "email" && !/\S+@\S+\.\S+/.test(value)) return "Email inválido";
    if (field === "password" && value.length < 6) return "Mínimo 6 caracteres";
    return "";
  };

  const form = mode === "login" ? loginForm : registerForm;
  const isValid = useMemo(
    () =>
      mode === "forgot"
        ? /\S+@\S+\.\S+/.test(forgotEmail)
        : Object.values(errors).every((v) => !v) &&
          Object.values(form).every((v) => v !== ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, forgotEmail, Object.values(errors).join(), Object.values(form).join()]
  );

  const onBlur = (event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const onChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(loginForm.email, loginForm.password);
        pushToast({ type: "success", title: "Bienvenido", message: "Sesión iniciada" });
        navigate("/dashboard");
      } else if (mode === "register") {
        await register(registerForm);
        pushToast({ type: "success", title: "Registro completo", message: "Ahora puedes ingresar" });
        setMode("login");
      } else {
        // forgot
        try {
          await api.post("/api/auth/forgot-password", { email: forgotEmail });
        } catch {
          // always show generic message regardless of backend response
        }
        pushToast({
          type: "success",
          title: "Correo enviado",
          message: "Si el email existe, recibirás instrucciones",
        });
        setForgotEmail("");
        setMode("login");
      }
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = () => {
    if (loading) return "Cargando...";
    if (mode === "login") return "Ingresar";
    if (mode === "register") return "Crear cuenta";
    return "Enviar instrucciones";
  };

  return (
    <div className="login-layout">
      <div className="card login-card">
        <div className="login-logo">
          <span className="logo-icon">+</span>
          <div>
            <h2>Patient Portal</h2>
            <p className="text-secondary">Accede a tus citas médicas</p>
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="login-toggle">
            <button
              type="button"
              className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode("register")}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          {mode === "register" && (
            <>
              <label className="field" htmlFor="field-fullName">
                <span className="label">Nombre completo</span>
                <input
                  id="field-fullName"
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={onChange(setRegisterForm)}
                  onBlur={onBlur}
                />
                {errors.fullName && (
                  <span className="error-text" role="alert">{errors.fullName}</span>
                )}
              </label>
              <label className="field" htmlFor="field-reg-email">
                <span className="label">Email</span>
                <input
                  id="field-reg-email"
                  name="email"
                  value={registerForm.email}
                  onChange={onChange(setRegisterForm)}
                  onBlur={onBlur}
                />
                {errors.email && (
                  <span className="error-text" role="alert">{errors.email}</span>
                )}
              </label>
              <label className="field" htmlFor="field-reg-password">
                <span className="label">Contraseña</span>
                <input
                  id="field-reg-password"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={onChange(setRegisterForm)}
                  onBlur={onBlur}
                />
                {errors.password && (
                  <span className="error-text" role="alert">{errors.password}</span>
                )}
              </label>
              <label className="field" htmlFor="field-birthDate">
                <span className="label">Fecha de nacimiento</span>
                <input
                  id="field-birthDate"
                  type="date"
                  name="birthDate"
                  value={registerForm.birthDate}
                  onChange={onChange(setRegisterForm)}
                />
              </label>
              <label className="field" htmlFor="field-phone">
                <span className="label">Teléfono</span>
                <input
                  id="field-phone"
                  name="phone"
                  value={registerForm.phone}
                  onChange={onChange(setRegisterForm)}
                />
              </label>
            </>
          )}

          {mode === "login" && (
            <>
              <label className="field" htmlFor="field-email">
                <span className="label">Email</span>
                <input
                  id="field-email"
                  name="email"
                  value={loginForm.email}
                  onChange={onChange(setLoginForm)}
                  onBlur={onBlur}
                />
                {errors.email && (
                  <span className="error-text" role="alert">{errors.email}</span>
                )}
              </label>
              <label className="field" htmlFor="field-password">
                <span className="label">Contraseña</span>
                <input
                  id="field-password"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={onChange(setLoginForm)}
                  onBlur={onBlur}
                />
                {errors.password && (
                  <span className="error-text" role="alert">{errors.password}</span>
                )}
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode("forgot")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          {mode === "forgot" && (
            <>
              <p className="text-secondary">
                Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña.
              </p>
              <label className="field" htmlFor="field-forgot-email">
                <span className="label">Email</span>
                <input
                  id="field-forgot-email"
                  type="email"
                  name="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode("login")}
              >
                Volver al inicio de sesión
              </button>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
            {submitLabel()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
