"use client";

import { cn } from "@/lib/utils";
import { Ticket } from "./Ticket";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar/avatar";
import { Badge } from "@/components/ui/Badge/badge";

interface Props {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (t: Ticket) => void;
}

export function TicketList({ tickets, selectedTicket, onSelectTicket }: Props) {
  const statusColor = (s: Ticket["status"]) => {
    switch (s) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "solved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const priorityColor = (p: Ticket["priority"]) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fmt = (d: Date) =>
    d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-1 py-3 pr-2">
      {tickets.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelectTicket(t)}
          className={cn(
            "p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
            selectedTicket?.id === t.id && "bg-blue-50 border border-blue-200"
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{t.user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {t.user.name}
                </p>
                <p className="text-xs text-gray-500">{fmt(t.updatedAt)}</p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {t.description}
              </p>

              <div className="flex flex-wrap gap-1">
                <Badge className={statusColor(t.status)}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </Badge>
                <Badge className={priorityColor(t.priority)}>
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}{" "}
                  priority
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {t.department}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
