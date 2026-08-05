interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down";
  isLoading?: boolean;
}

const StatCard = ({ title, value, subtitle, isLoading }: StatCardProps) => {
  const TrendIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M8 3L8 13M4 7L8 3L12 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <TrendIcon />
        </div>
      </div>

      {isLoading ? (
        // Skeleton
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
      ) : (
        <>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </>
      )}
    </div>
  );
};

export default StatCard;
