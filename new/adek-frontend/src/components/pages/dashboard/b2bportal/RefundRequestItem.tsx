/* eslint-disable @typescript-eslint/no-explicit-any */

const AvatarWithFallback = ({ name }: { name?: string }) => {
  const getInitials = (n?: string) => {
    if (!n) return "U";
    const parts = n.trim().split(/\s+/);
    const initials = parts
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || "U";
  };

  const initials = getInitials(name);

  return (
    <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gray-300 flex items-center justify-center text-sm text-white">
      {initials}
    </div>
  );
};

interface Props {
  request: any;
  contact: any;
  selected: boolean;
  onClick: () => void;
}

export const RefundRequestItem = ({
  request,
  contact,
  selected,
  onClick,
}: Props) => {
  const requestNumber = ["7", "8", "9", "10"][request.index] || "10";

  return (
    <div
      className={`rounded-lg p-4 cursor-pointer transition-colors ${
        selected
          ? "bg-blue-100 border border-blue-300"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500">Respond in 2h ago</span>
        <span className="text-xs text-orange-500 font-medium">
          #445TTH5E{requestNumber}
        </span>
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Product refund request
      </h4>
      <div className="flex items-center gap-3">
        <AvatarWithFallback name={contact?.name} />
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>{contact?.name || "Unknown User"}</span>
          <span className="text-gray-500">Product: DCL13...</span>
        </div>
      </div>
    </div>
  );
};
