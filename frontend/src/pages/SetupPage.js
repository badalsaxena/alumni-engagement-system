import { useState, useEffect } from 'react';
import { Database, Copy, Check } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function SetupPage() {
  const [sql, setSql] = useState('');
  const [tablesExist, setTablesExist] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/setup/check`).then(r => r.json()).then(d => setTablesExist(d.tables_exist));
    fetch(`${API}/api/setup/sql`).then(r => r.json()).then(d => setSql(d.sql));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold" data-testid="setup-title">Database Setup</h1>
          <p className="text-white/40 mt-2">Run this SQL in your Supabase Dashboard SQL Editor to create the required tables.</p>
        </div>
        <div className={`glass-panel p-4 flex items-center gap-3 ${tablesExist ? 'border-green-500/30' : 'border-yellow-500/30'}`} data-testid="setup-status">
          <Database className={`w-5 h-5 ${tablesExist ? 'text-green-400' : 'text-yellow-400'}`} />
          <span className={tablesExist ? 'text-green-400' : 'text-yellow-400'}>
            {tablesExist === null ? 'Checking...' : tablesExist ? 'Tables exist - you are all set!' : 'Tables not found - please run the SQL below'}
          </span>
        </div>
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">SQL Migration Script</h2>
            <button onClick={handleCopy} className="btn-secondary text-sm flex items-center gap-2" data-testid="copy-sql-btn">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-md p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-white/60 font-mono whitespace-pre-wrap">{sql}</pre>
          </div>
          <div className="text-sm text-white/30 space-y-1">
            <p>Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-white/20">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Paste the SQL above and click "Run"</li>
              <li>Refresh this page to verify</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
