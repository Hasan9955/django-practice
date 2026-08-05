import { ReactNode } from "react";

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  highlight = false,
}: FeatureCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all ${
        highlight
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 bg-white hover:shadow-lg"
      }`}
    >
      {icon && <div className="text-3xl mb-3">{icon}</div>}
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
