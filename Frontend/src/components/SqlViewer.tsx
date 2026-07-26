import React, { useState } from "react";
import { Code, Check, Copy, ShieldCheck, RefreshCw } from "lucide-react";

interface SqlViewerProps {
  sqlQuery: string | null;
  retryCount: number;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({
  sqlQuery,
  retryCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!sqlQuery) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
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

      <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800/80">
        <code>{sqlQuery}</code>
      </pre>
    </div>
  );
};
