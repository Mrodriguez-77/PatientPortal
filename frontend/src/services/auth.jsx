import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setLogoutCallback } from "./api.js";

const AuthContext = createContext(null);

const getStored = () => ({
  token: localStorage.getItem("token"),
  patientId: localStorage.getItem("patientId"),
  patientName: localStorage.getItem("patientName"),
  patientEmail: localStorage.getItem("patientEmail"),
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStored().token);
  const [patient, setPatient] = useState({
    id: getStored().patientId,
    name: getStored().patientName,
    email: getStored().patientEmail,
  });

  const setSession = (payload) => {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("patientId", payload.patientId);
    localStorage.setItem("patientName", payload.patientName);
    localStorage.setItem("patientEmail", payload.patientEmail);
    setToken(payload.token);
    setPatient({
      id: payload.patientId,
      name: payload.patientName,
      email: payload.patientEmail,
    });
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("patientId");
    localStorage.removeItem("patientName");
    localStorage.removeItem("patientEmail");
    setToken(null);
    setPatient({ id: null, name: null, email: null });
  };

  useEffect(() => {
    setLogoutCallback(clearSession);
    return () => setLogoutCallback(null);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const data = response?.data || response || {};
    setSession({
      token: data.token,
      patientId: data.id,
      patientName: data.fullName || data.name,
      patientEmail: data.email,
    });
    return data;
  };

  const register = async (payload) => {
    const response = await api.post("/api/auth/register", payload);
    return response?.data || response;
  };

  const getProfile = async () => {
    if (!token) return null;
    const response = await api.get("/api/auth/me", token);
    return response?.data || response;
  };

  const changePassword = async (payload) => {
    if (!token) throw new Error("No hay sesion activa");
    const response = await api.put("/api/auth/change-password", payload, token);
    return response?.data || response;
  };

  const value = useMemo(
    () => ({
      token,
      patient,
      login,
      register,
      getProfile,
      changePassword,
      logout: clearSession,
    }),
    [token, patient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

