import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

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
    if (field === "email" && !/\S+@\S+\.\S+/.test(value)) return "Email invalido";
    if (field === "password" && value.length < 6) return "Minimo 6 caracteres";
    return "";
  };

  const form = mode === "login" ? loginForm : registerForm;
  const isValid = useMemo(
    () => Object.values(errors).every((value) => !value) && Object.values(form).every((value) => value !== ""),
    [errors, form]
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
        pushToast({ type: "success", title: "Bienvenido", message: "Sesion iniciada" });
        navigate("/dashboard");
      } else {
        await register(registerForm);
        pushToast({ type: "success", title: "Registro completo", message: "Ahora puedes ingresar" });
        setMode("login");
      }
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
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
          <button type="button" className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("login")}>Iniciar sesion</button>
          <button type="button" className={`btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("register")}>Crear cuenta</button>
        </div>
        <form onSubmit={handleSubmit} className="form-stack">
          {mode === "register" ? (
            <>
              <label className="field">
                <span className="label">Nombre completo</span>
                <input name="fullName" value={registerForm.fullName} onChange={onChange(setRegisterForm)} onBlur={onBlur} />
                {errors.fullName ? <span className="error-text">{errors.fullName}</span> : null}
              </label>
              <label className="field">
                <span className="label">Email</span>
                <input name="email" value={registerForm.email} onChange={onChange(setRegisterForm)} onBlur={onBlur} />
                {errors.email ? <span className="error-text">{errors.email}</span> : null}
              </label>
              <label className="field">
                <span className="label">Contrasena</span>
                <input type="password" name="password" value={registerForm.password} onChange={onChange(setRegisterForm)} onBlur={onBlur} />
                {errors.password ? <span className="error-text">{errors.password}</span> : null}
              </label>
              <label className="field">
                <span className="label">Fecha de nacimiento</span>
                <input type="date" name="birthDate" value={registerForm.birthDate} onChange={onChange(setRegisterForm)} />
              </label>
              <label className="field">
                <span className="label">Telefono</span>
                <input name="phone" value={registerForm.phone} onChange={onChange(setRegisterForm)} />
              </label>
            </>
          ) : (
            <>
              <label className="field">
                <span className="label">Email</span>
                <input name="email" value={loginForm.email} onChange={onChange(setLoginForm)} onBlur={onBlur} />
                {errors.email ? <span className="error-text">{errors.email}</span> : null}
              </label>
              <label className="field">
                <span className="label">Contrasena</span>
                <input type="password" name="password" value={loginForm.password} onChange={onChange(setLoginForm)} onBlur={onBlur} />
                {errors.password ? <span className="error-text">{errors.password}</span> : null}
              </label>
              <button type="button" className="btn btn-secondary">Olvidaste tu contrasena</button>
            </>
          )}
          <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
            {loading ? "Cargando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

