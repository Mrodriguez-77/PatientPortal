# PatientPortal

Monorepo con frontend (Vite + React) y backend (Spring Boot).

## Estructura

- `frontend/`: app Vite React
- `backend/`: app Spring Boot

## Ejecutar en desarrollo

### Frontend (hot reload)

```powershell
cd C:\Users\Marcelo\Documents\IntelliJ_projects\PatientPortal\frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

### Backend

```powershell
cd C:\Users\Marcelo\Documents\IntelliJ_projects\PatientPortal\backend
.\gradlew bootRun
```

## Build y servir desde backend

```powershell
cd C:\Users\Marcelo\Documents\IntelliJ_projects\PatientPortal\frontend
npm run build
```

Luego ejecutar el backend y abrir `http://localhost:8083`.

## Nota

El backend sirve los archivos generados en `backend/src/main/resources/static`.

