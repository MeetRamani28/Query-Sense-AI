import React, { useState } from "react";
import {
  Search,
  Database,
  Cpu,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import { submitAnalyticsQuery } from "./services/api";
import type { QueryResponseData } from "./types";
import { DynamicChart } from "./components/DynamicChart";
import { SqlViewer } from "./components/SqlViewer";

const SAMPLE_QUESTIONS = [
  "Show me total revenue and order count for each product category",
  "List top 3 customers based on total purchase amount",
  "Which products are currently low in stock (less than 30 units)?",
  "Show total orders grouped by region and status",
];

export const App: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (queryToSubmit?: string) => {
    const q = queryToSubmit || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await submitAnalyticsQuery(q);
      setResult(res);
      if (
        res.error_trace &&
        (!res.query_result || res.query_result.length === 0)
      ) {
        setError(res.error_trace);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to execute query.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Query-Sense-AI
              </h1>
              <p className="text-xs text-slate-400">
                Autonomous Text-to-SQL Analytics Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>LangGraph Self-Correction Active</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ask Questions in Natural Language, Get{" "}
            <span className="text-sky-400">Real-Time Insights</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Translates English queries to PostgreSQL, automatically fixes SQL
            errors via LangGraph loops, and renders dynamic charts.
          </p>

          <div className="relative mt-6">
            <div className="flex items-center bg-slate-900 border border-slate-700 focus-within:border-sky-500 rounded-xl p-2 shadow-2xl transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask e.g. Show me total revenue by region..."
                className="w-full bg-transparent border-none px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !question.trim()}
                className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Query</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-500">Try asking:</span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleSearch(q);
                }}
                className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="max-w-4xl mx-auto p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-semibold block">
                Execution / Security Error
              </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <section className="max-w-5xl mx-auto space-y-6">
            <SqlViewer
              sqlQuery={result.sql_query}
              retryCount={result.retry_count}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                <span>
                  DATA VISUALIZATION ({result.chart_type.toUpperCase()})
                </span>
              </div>
              <DynamicChart
                data={result.query_result}
                chartType={result.chart_type}
                explanation={result.explanation}
              />
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        Query-Sense-AI Engine • Built with LangGraph, PostgreSQL, FastAPI, React
        & Tailwind CSS v4
      </footer>
    </div>
  );
};

export default App;
