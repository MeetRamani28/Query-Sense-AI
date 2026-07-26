import React, { useState } from "react";
import {
  Search,
  Database,
  Cpu,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BarChart2,
  XCircle,
  History,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { submitAnalyticsQuery } from "./services/api";
import type { QueryResponseData, DbConfig } from "./types";
import { DynamicChart } from "./components/DynamicChart";
import { SqlViewer } from "./components/SqlViewer";
import { ConnectDbModal } from "./components/ConnectDbModal";

const SAMPLE_QUESTIONS = [
  "Show me total revenue and order count for each product category",
  "List top 3 customers based on total purchase amount",
  "Which products are currently low in stock (less than 30 units)?",
  "Show total orders grouped by region and status",
];

export const App: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [history, setHistory] = useState<QueryResponseData[]>(() => {
    const savedHistory = localStorage.getItem("qs_query_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [result, setResult] = useState<QueryResponseData | null>(() => {
    const savedResult = localStorage.getItem("qs_active_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });

  const [dbConfig, setDbConfig] = useState<DbConfig | null>(() => {
    const savedConfig = localStorage.getItem("qs_db_config");
    return savedConfig ? JSON.parse(savedConfig) : null;
  });

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const handleSaveDbConfig = (config: DbConfig) => {
    setDbConfig(config);
    localStorage.setItem("qs_db_config", JSON.stringify(config));
  };

  const handleDisconnectDb = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDbConfig(null);
    localStorage.removeItem("qs_db_config");
  };

  const handleSearch = async (queryToSubmit?: string) => {
    const q = queryToSubmit || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await submitAnalyticsQuery(q, dbConfig);
      setResult(res);
      localStorage.setItem("qs_active_result", JSON.stringify(res));

      if (res.sql_query && !res.sql_query.startsWith("FORBIDDEN")) {
        const updatedHistory = [
          res,
          ...history.filter((h) => h.question !== res.question),
        ].slice(0, 15);
        setHistory(updatedHistory);
        localStorage.setItem(
          "qs_query_history",
          JSON.stringify(updatedHistory),
        );
      }

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
      localStorage.removeItem("qs_active_result");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: QueryResponseData) => {
    setQuestion(item.question);
    setResult(item);
    setError(item.error_trace);
    localStorage.setItem("qs_active_result", JSON.stringify(item));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("qs_query_history");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              title="Toggle History Sidebar"
            >
              <History className="w-5 h-5 text-sky-400" />
            </button>

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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 border border-sky-500/30 rounded-lg p-0.5">
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-2 text-xs text-sky-300 px-2.5 py-1 transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-sky-400" />
                <span>
                  {dbConfig ? `DB: ${dbConfig.dbname}` : "Connect Custom DB"}
                </span>
              </button>

              {dbConfig && (
                <button
                  onClick={handleDisconnectDb}
                  title="Disconnect Custom DB"
                  className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>LangGraph Self-Correction Active</span>
            </div>
          </div>
        </div>
      </header>

      <ConnectDbModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onSave={handleSaveDbConfig}
        currentConfig={dbConfig}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-sky-400" /> QUERY HISTORY
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear History"
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[70vh] no-scrollbar">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2">
                    No past queries saved.
                  </p>
                ) : (
                  history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectHistoryItem(item)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                        result?.question === item.question
                          ? "bg-sky-950/60 border-sky-500/40 text-sky-300 font-medium"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                      <span className="truncate">{item.question}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 px-4 py-8 space-y-8 overflow-x-hidden">
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
            <div className="max-w-4xl mx-auto p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-rose-300 text-sm shadow-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-semibold block">
                  {error.startsWith("SCHEMA ERROR")
                    ? "Schema Mismatch Error"
                    : "Execution / Security Error"}
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
                explanation={result.explanation}
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
      </div>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        Query-Sense-AI Engine • Built with LangGraph, PostgreSQL, FastAPI, React
        & Tailwind CSS v4
      </footer>
    </div>
  );
};

export default App;
