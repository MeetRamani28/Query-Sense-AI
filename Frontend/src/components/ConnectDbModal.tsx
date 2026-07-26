import React, { useState } from "react";
import { X, Database, Check } from "lucide-react";
import type { DbConfig } from "../types";

interface ConnectDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DbConfig) => void;
  currentConfig: DbConfig | null;
}

export const ConnectDbModal: React.FC<ConnectDbModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [form, setForm] = useState<DbConfig>(
    currentConfig || {
      host: "localhost",
      port: 5432,
      dbname: "",
      user: "postgres",
      password: "",
    },
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sky-400 font-semibold">
            <Database className="w-5 h-5" />
            <span>Connect Custom PostgreSQL DB</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">
              Host / Server IP
            </label>
            <input
              type="text"
              required
              value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })}
              placeholder="e.g. localhost or db.company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Port</label>
              <input
                type="number"
                required
                value={form.port}
                onChange={(e) =>
                  setForm({ ...form, port: parseInt(e.target.value) || 5432 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Database Name</label>
              <input
                type="text"
                required
                value={form.dbname}
                onChange={(e) => setForm({ ...form, dbname: e.target.value })}
                placeholder="e.g. sales_db"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
