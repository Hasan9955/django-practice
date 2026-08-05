/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import React from "react";

type AvatarProps = {
  name?: string;
  src?: string;
  size?: string;
};

export const AvatarWithFallback = ({
  name = "",
  src,
  size = "w-8 h-8",
}: AvatarProps) => {
  const [errored, setErrored] = React.useState(false);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !errored) {
    return (
      <Image
        src={src}
        onError={() => setErrored(true)}
        className={`rounded-full ${size} object-cover`}
        width={30}
        height={30}
        alt={name}
      />
    );
  }

  return (
    <div
      className={`rounded-full ${size} flex items-center justify-center bg-gray-300 text-gray-700`}
    >
      <span className="text-xs font-medium">{initials || "?"}</span>
    </div>
  );
};

interface Props {
  message: any;
}

export const MessageItem = ({ message }: Props) => (
  <div
    className={`flex ${message.isUser ? "justify-end" : "items-start gap-3"}`}
  >
    {!message.isUser && (
      <AvatarWithFallback
        name={message.sender}
        src={message.avatar}
        size="w-8 h-8"
      />
    )}
    <div
      className={`rounded-lg p-3 max-w-md ${
        message.isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <p className="text-sm">{message.content}</p>
      <p
        className={`text-xs mt-1 ${
          message.isUser ? "text-blue-100" : "text-gray-500"
        }`}
      >
        {message.time}
      </p>
    </div>
  </div>
);
