import { useEffect, useMemo, useState } from "react";
import { Client } from "@stomp/stompjs";

const useWebSocket = (patientId, token) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const client = useMemo(() => {
    if (!patientId || !token) return null;
    return new Client({
      brokerURL: "ws://localhost:8083/ws/websocket",
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
    });
  }, [patientId, token]);

  useEffect(() => {
    if (!client || !patientId) return undefined;

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/patient/${patientId}/appointments`, (message) => {
        const payload = JSON.parse(message.body || "{}");
        setMessages((prev) => [payload, ...prev].slice(0, 10));
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = () => {
      setIsConnected(false);
    };

    client.activate();

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [client, patientId]);

  return { messages, isConnected };
};

export default useWebSocket;
