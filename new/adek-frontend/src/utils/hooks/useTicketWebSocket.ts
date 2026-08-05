/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

export interface IncomingMessage {
  id: string;
  content: string;
  timestamp: Date;
  isSupport: boolean;
}

export function useTicketWebSocket({
  ticketId,
  receiverId,
  onMessage,
}: {
  ticketId: string | null;
  receiverId: string | null;
  onMessage: (msg: IncomingMessage) => void;
}) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const currentTicketId = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = (content: string) => {
    if (
      ws.current?.readyState === WebSocket.OPEN &&
      currentTicketId.current &&
      receiverId
    ) {
      ws.current.send(
        JSON.stringify({
          type: "sendTicketMessage",
          ticketId: currentTicketId.current,
          receiverId,
          content,
        })
      );
    }
  };

  const joinChat = () => {
    if (ws.current?.readyState === WebSocket.OPEN && ticketId) {
      currentTicketId.current = ticketId;
      ws.current.send(JSON.stringify({ type: "joinTicketChat", ticketId }));
    }
  };

  useEffect(() => {
    const connect = () => {
      if (ws.current) return;

      const socket = new WebSocket("wss://api.sellapy.com");

      socket.onopen = () => {
        setIsConnected(true);
        if (ticketId) joinChat();
        console.log("WebSocket connected");
      };

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "message" && data.content && data.timestamp) {
            onMessage({
              id: data.messageId || Date.now().toString(),
              content: data.content,
              timestamp: new Date(data.timestamp),
              isSupport: data.senderId !== receiverId,
            });
          }
        } catch (err) {
          console.error("Parse error:", err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        ws.current = null;
        console.log("WebSocket closed. Reconnecting in 3s...");
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      socket.onerror = () => socket.close();

      ws.current = socket;
    };

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
      ws.current = null;
    };
  }, []);

  useEffect(() => {
    if (ticketId && ws.current?.readyState === WebSocket.OPEN) joinChat();
  }, [ticketId]);

  return { sendMessage, isConnected };
}
