import { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import type { CASResponse } from './types';

export default function App() {
  const [data, setData] = useState<CASResponse | null>(null);

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cas-portfolio.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return data ? (
    <Dashboard data={data} onReset={() => setData(null)} onDownload={handleDownload} />
  ) : (
    <FileUpload onData={setData} />
  );
}
