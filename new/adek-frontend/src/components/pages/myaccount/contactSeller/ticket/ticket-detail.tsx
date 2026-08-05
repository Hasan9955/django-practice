"use client";

import { useState, useEffect } from "react";
import { FileText, Paperclip, Send, Check } from "lucide-react";
import { Ticket, Message as IMessage, Attachment } from "./Ticket";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Input } from "@/components/ui/Input/Input";
import { Card, CardContent } from "@/components/ui/Card/Card";
import {
  IncomingMessage,
  useTicketWebSocket,
} from "@/utils/hooks/useTicketWebSocket";

interface Props {
  ticket: Ticket;
  receiverId: string | null;
  onSendMessage: (id: string, content: string, atts?: Attachment[]) => void;
  onUpdateStatus?: (id: string, status: Ticket["status"]) => void;
}

export function TicketDetail({ ticket, receiverId, onSendMessage }: Props) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<IMessage[]>(ticket.messages);

  const { sendMessage: wsSend } = useTicketWebSocket({
    ticketId: ticket.id,
    receiverId,
    onMessage: (inc: IncomingMessage) => {
      const newMsg: IMessage = {
        id: inc.id,
        content: inc.content,
        timestamp: inc.timestamp,
        isSupport: inc.isSupport,
      };
      setMessages((p) => [...p, newMsg]); // Only local state, do not sync parent
    },
  });

  const send = () => {
    const content = msg.trim();
    if (!content) return;
    wsSend(content);
    onSendMessage(ticket.id, content); // sync parent only for outgoing
    setMsg("");
  };

  useEffect(() => setMessages(ticket.messages), [ticket.messages]);

  const statusBadge = (s: Ticket["status"]) =>
    ({
      pending: "bg-yellow-100 text-yellow-800",
      solved: "bg-green-100 text-green-800",
      refund: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      open: "bg-blue-100 text-blue-800",
    }[s] || "bg-gray-100 text-gray-800");

  const priorityBadge = (p: Ticket["priority"]) =>
    ({
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }[p] || "bg-gray-100 text-gray-800");

  const fmt = (d: Date) =>
    d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="mx-4 mt-4 rounded-xl bg-[#EEE] p-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          {ticket.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge className={statusBadge(ticket.status)}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
          <Badge className={priorityBadge(ticket.priority)}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}{" "}
            priority
          </Badge>
          <Badge variant="outline">{ticket.department}</Badge>
        </div>
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} user={ticket.user} fmt={fmt} />
        ))}
        {ticket.status === "solved" && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Ticket solved</span>
            </div>
          </div>
        )}
      </section>

      {/* Input */}
      {ticket.status !== "solved" && (
        <footer className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{ticket.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                className="flex-1"
              />
              <Button size="sm" variant="ghost">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={send} disabled={!msg.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  user,
  fmt,
}: {
  msg: IMessage;
  user: Ticket["user"];
  fmt: (d: Date) => string;
}) {
  const isSupport = msg.isSupport;
  const bubbleClass = isSupport
    ? "bg-blue-50 border border-blue-200"
    : "bg-gray-50";

  return (
    <div
      className={`flex items-start gap-3 ${
        isSupport ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {isSupport ? "Support" : user.name}
          </span>
          <span className="text-xs text-gray-500">{fmt(msg.timestamp)}</span>
        </div>

        <div className={`rounded-lg p-3 mb-2 ${bubbleClass}`}>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {msg.content}
          </p>
        </div>

        {msg.attachments?.length ? (
          <div className="flex flex-wrap gap-2">
            {msg.attachments.map((a) => (
              <Card key={a.id} className="w-36">
                <CardContent className="p-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-600 truncate">
                    {a.name}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
