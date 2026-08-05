/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/dialog";
import { Label } from "@/components/ui/Label/label";
import { Textarea } from "@/components/ui/Textarea/textarea";
import { Input } from "@/components/ui/Input/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/select";
import { Button } from "@/components/ui/Button/Button";
import type { Ticket, ApiTicketResponse } from "./Ticket";
import { toast } from "sonner";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (
    ticket: Omit<
      Ticket,
      "id" | "createdAt" | "updatedAt" | "user" | "messages"
    >,
    apiResponse?: ApiTicketResponse
  ) => void;
  createTicketMutation: any;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onCreateTicket,
  createTicketMutation,
}: CreateTicketModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "" as Ticket["priority"] | "",
    department: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map frontend priority to backend format (HIGH, MEDIUM, LOW)
  const mapPriorityToBackend = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    };
    return priorityMap[priority] || "MEDIUM";
  };

  // Map frontend department to backend format
  const mapDepartmentToBackend = (department: string): string => {
    const departmentMap: Record<string, string> = {
      "Finance department": "SALES",
    };
    return departmentMap[department] || "SALES";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.title ||
      !formData.description ||
      !formData.priority ||
      !formData.department
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API with correct field names
      const apiPayload = {
        ticketName: formData.title,
        ticketDescription: formData.description,
        priority: mapPriorityToBackend(formData.priority),
        department: mapDepartmentToBackend(formData.department),
      };

      console.log("Sending API payload:", apiPayload);

      // Call the mutation
      const response = await createTicketMutation(apiPayload).unwrap();
      if (response || response.success) {
        toast.success("Ticket created successfully");
      } else {
        toast.error("Failed to create ticket");
      }

      // Pass both ticket data AND API response to parent
      onCreateTicket(
        {
          title: formData.title,
          description: formData.description,
          status: "pending" as const,
          priority: formData.priority as Ticket["priority"],
          department: formData.department,
          receiverId:
            (response as any)?.receiverId ??
            (response as any)?.data?.receiverId ??
            "",
        } as Omit<
          Ticket,
          "id" | "createdAt" | "updatedAt" | "user" | "messages"
        >,
        response // Pass API response as second parameter
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "",
        department: "",
      });

      // Close modal
      onClose();
    } catch (err: any) {
      console.error("Failed to create ticket:", err);
      setError(
        err?.data?.message || "Failed to create ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      priority: "",
      department: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create new ticket
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Ticket name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Help needed for payment failure"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Ticket Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              disabled={isSubmitting}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              value={new Date().toLocaleDateString()}
              disabled
              className="w-full bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority level <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  priority: value as Ticket["priority"],
                })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) =>
                setFormData({ ...formData, department: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance department">
                  Finance Department
                </SelectItem>
                <SelectItem value="Technical support">
                  Technical Support
                </SelectItem>
                <SelectItem value="Billing department">
                  Billing Department
                </SelectItem>
                <SelectItem value="Customer service">
                  Customer Service
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-transparent order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 order-1 sm:order-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create ticket"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
