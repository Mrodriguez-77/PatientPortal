import React, { createContext, useContext, useMemo, useState } from "react";
import api from "./api.js";

const AuthContext = createContext(null);

const getStorage = () => ({
  token: localStorage.getItem("token"),
  patientId: localStorage.getItem("patientId"),
  patientName: localStorage.getItem("patientName"),
  patientEmail: localStorage.getItem("patientEmail"),
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStorage().token);
  const [paciente, setPaciente] = useState({
    id: getStorage().patientId,
    nombre: getStorage().patientName,
    email: getStorage().patientEmail,
  });

  const saveSession = (payload) => {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("patientId", payload.patientId);
    localStorage.setItem("patientName", payload.patientName);
    localStorage.setItem("patientEmail", payload.patientEmail);
    setToken(payload.token);
    setPaciente({
      id: payload.patientId,
      nombre: payload.patientName,
      email: payload.patientEmail,
    });
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("patientId");
    localStorage.removeItem("patientName");
    localStorage.removeItem("patientEmail");
    setToken(null);
    setPaciente({ id: null, nombre: null, email: null });
  };

  const login = async (email, password) => {
    const data = await api.post("/api/auth/login", { email, password });
    const perfil = data?.data || {};
    saveSession({
      token: perfil.token,
      patientId: perfil.id,
      patientName: perfil.fullName,
      patientEmail: perfil.email,
    });
    return perfil;
  };

  const register = async (payload) => {
    const data = await api.post("/api/auth/register", payload);
    return data?.data;
  };

  const getProfile = async () => {
    if (!token) return null;
    const data = await api.get("/api/auth/me", token);
    return data?.data;
  };

  const changePassword = async (payload) => {
    if (!token) throw new Error("No hay sesion activa");
    const data = await api.put("/api/auth/change-password", payload, token);
    return data?.data;
  };

  const value = useMemo(
    () => ({
      token,
      paciente,
      login,
      register,
      getProfile,
      changePassword,
      logout: clearSession,
    }),
    [token, paciente]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
