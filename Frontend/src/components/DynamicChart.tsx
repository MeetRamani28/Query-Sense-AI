import React, { useRef } from "react";
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
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const chartRef = useRef<HTMLDivElement>(null);

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

  const exportToCSV = () => {
    const headers = keys.join(",");
    const rows = data.map((row) =>
      keys.map((k) => `"${String(row[k]).replace(/"/g, '""')}"`).join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#0f172a",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`query_report_${Date.now()}.pdf`);
  };

  return (
    <div
      ref={chartRef}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {explanation ? (
          <div className="p-2.5 bg-slate-800/60 rounded-lg text-xs text-sky-300 border border-sky-500/20 flex-1">
            💡 <span className="font-semibold">Insight:</span> {explanation}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

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
          <div className="overflow-x-auto max-h-72 no-scrollbar">
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
