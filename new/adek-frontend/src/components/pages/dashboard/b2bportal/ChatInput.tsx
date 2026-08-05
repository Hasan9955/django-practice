import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Paperclip, Send } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({ value, onChange, onSend, onKeyPress }: Props) => (
  <div className="border-t border-gray-200 p-4 bg-[#EEE] rounded-b-lg">
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="p-2">
        <Paperclip className="w-4 h-4" />
      </Button>
      <Input
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        className="flex-1"
      />
      <Button
        size="sm"
        className="px-3 bg-blue-600 hover:bg-blue-700"
        onClick={onSend}
        disabled={value.trim() === ""}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  </div>
);
