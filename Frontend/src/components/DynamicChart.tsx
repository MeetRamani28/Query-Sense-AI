import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DynamicChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>> | null;
  chartType: "bar" | "line" | "pie" | "table" | "none";
  explanation?: string | null;
}

const COLORS = [
  "#0284c7",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#fb7185",
];

export const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  chartType,
  explanation,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
        No data returned to render visualization.
      </div>
    );
  }

  const keys = Object.keys(data[0]);
  const xAxisKey = keys[0];
  const valueKeys = keys.slice(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      {explanation && (
        <div className="p-3 bg-slate-800/60 rounded-lg text-sm text-sky-300 border border-sky-500/20">
          💡 <span className="font-semibold">Insight:</span> {explanation}
        </div>
      )}

      <div className="h-80 w-full">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#475569",
                  color: "#f8fafc",
                }}
              />
              <Legend />
              {valueKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#475569",
                  color: "#f8fafc",
                }}
              />
              <Legend />
              {valueKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={3}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#475569",
                  color: "#f8fafc",
                }}
              />
              <Legend />
              <Pie
                data={data}
                dataKey={valueKeys[0] || keys[1]}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {(chartType === "table" || chartType === "none") && (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-sm text-left text-slate-300 border-collapse">
              <thead className="text-xs uppercase bg-slate-800 text-slate-400 sticky top-0">
                <tr>
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 border-b border-slate-700"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-slate-800 hover:bg-slate-800/40"
                  >
                    {keys.map((key) => (
                      <td key={key} className="px-4 py-3">
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
