import React, { createContext, useContext, useState, useCallback } from "react";

const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [clientAlerts, setClientAlerts] = useState([]);

  const pushAlert = useCallback((alert) => {
    setClientAlerts((prev) => {
      const exists = prev.some((a) => a.id === alert.id);
      if (exists) {
        return prev.map((a) =>
          a.id === alert.id ? { ...a, ...alert, createdAt: new Date().toISOString(), isRead: false } : a
        );
      }
      return [
        {
          id: alert.id || ("client-" + Date.now()),
          title: alert.title,
          message: alert.message,
          severity: alert.severity || "warning",
          type: alert.type || "system",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  const dismissAlert = useCallback((id) => {
    setClientAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markClientAlertRead = useCallback((id) => {
    setClientAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  }, []);

  const markAllClientAlertsRead = useCallback(() => {
    setClientAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  const unreadCount = clientAlerts.filter((a) => !a.isRead).length;

  return (
    <AlertsContext.Provider
      value={{
        clientAlerts,
        pushAlert,
        dismissAlert,
        markClientAlertRead,
        markAllClientAlertsRead,
        unreadCount,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertsContext);
