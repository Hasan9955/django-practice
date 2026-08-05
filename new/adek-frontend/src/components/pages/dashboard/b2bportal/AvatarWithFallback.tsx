import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar/avatar";

interface Props {
  name?: string;
  src?: string;
  size?: string; // e.g., 'w-6 h-6'
}

export const AvatarWithFallback = ({ name, src, size = "w-6 h-6" }: Props) => (
  <Avatar className={size}>
    {src && <AvatarImage src={src} />}
    <AvatarFallback>
      {name?.charAt(0) || "U"}
    </AvatarFallback>
  </Avatar>
);
