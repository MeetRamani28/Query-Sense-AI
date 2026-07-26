import React, { useState } from "react";
import {
  Code,
  Check,
  Copy,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

interface SqlViewerProps {
  sqlQuery: string | null;
  retryCount: number;
  explanation?: string | null;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({
  sqlQuery,
  retryCount,
  explanation,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!sqlQuery) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-sky-400" />
          <span>SYNTHESIZED SQL QUERY</span>
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" /> Read-Only AST
          </span>
        </div>

        <div className="flex items-center gap-3">
          {retryCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              <RefreshCw className="w-3 h-3 animate-spin" /> Retried:{" "}
              {retryCount}x
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800/80 no-scrollbar">
        <code>{sqlQuery}</code>
      </pre>

      {explanation && (
        <div className="border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explain SQL Logic</span>
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showExplanation && (
            <div className="mt-2 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
              💡{" "}
              <span className="font-semibold text-slate-200">
                Query Breakdown:
              </span>{" "}
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
