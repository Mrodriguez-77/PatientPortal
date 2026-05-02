import React from "react";

const NotificationItem = ({ notificacion, onMark }) => {
  return (
    <div className={`notification-item ${notificacion.leida ? "read" : "unread"}`}>
      <div className={`dot ${notificacion.leida ? "dot-read" : "dot-unread"}`} />
      <div className="notification-content">
        <span className="notification-type">{notificacion.tipo}</span>
        <p>{notificacion.mensaje}</p>
        <span className="text-muted">{notificacion.fechaRelativa}</span>
      </div>
      {!notificacion.leida ? (
        <button type="button" className="btn btn-secondary" onClick={() => onMark(notificacion)}>
          Marcar leída
        </button>
      ) : null}
    </div>
  );
};

export default NotificationItem;
