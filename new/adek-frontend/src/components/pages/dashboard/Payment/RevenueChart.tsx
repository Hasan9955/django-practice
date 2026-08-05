interface ChartData {
  period: string;
  baseline: number;
  revenue: number;
}
import { Skeleton } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";

const RevenueChart = ({
  data,
  timeFilter,
  setTimeFilter,
  loading,
}: {
  data: ChartData[];
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  loading: boolean;
}) => {
  if (loading) {
    return <Skeleton active />;
  }
  const chartData = data.map((item) => ({
    month: item?.period,
    value: item.baseline,
    fill: item.revenue ? "#3B82F6" : "#D1D5DB",
  }));

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-sm font-medium">{`${label}: $${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Total revenue status
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Short by:</span>
          <select
            value={timeFilter}
            onChange={(e) =>
              setTimeFilter(e.target.value as "week" | "month" | "year")
            }
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="year">Yearly</option>
            <option value="month">Monthly</option>
            <option value="week">Weekly</option>
          </select>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => `$${value}`}
              domain={[0, 110]}
              ticks={[0, 10, 30, 50, 70, 90, 110]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Bar
              dataKey="value"
              radius={[2, 2, 0, 0]}
              barSize={30}
              fill="#3B82F6"
              fillOpacity={1}
              animationDuration={1000}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
