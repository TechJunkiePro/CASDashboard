import { useState } from 'react';
import axios from 'axios';
import type { CASResponse } from '../types';

interface Props {
  onData: (data: CASResponse) => void;
}

export default function FileUpload({ onData }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a CAS PDF file.'); return; }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const res = await axios.post<CASResponse>('/upload-cas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onData(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Failed to parse CAS file. Check password and try again.');
      } else {
        setError('Unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setError(null);
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-indigo-400">CAS</span> Dashboard
          </h1>
          <p className="text-gray-400 text-sm">Upload your Consolidated Account Statement PDF to see your portfolio analytics</p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cas-file-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-indigo-400 bg-indigo-900/20'
                  : file
                  ? 'border-green-500 bg-green-900/10'
                  : 'border-gray-700 hover:border-indigo-500 bg-gray-800/50'
              }`}
            >
              <input
                id="cas-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); setError(null); }
                }}
              />
              {file ? (
                <div>
                  <div className="text-green-400 text-3xl mb-2">✓</div>
                  <p className="text-green-400 font-medium text-sm">{file.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <div className="text-gray-500 text-4xl mb-3">📄</div>
                  <p className="text-gray-300 font-medium">Drop CAS PDF here</p>
                  <p className="text-gray-500 text-xs mt-1">or click to browse</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">CAS Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter CAS PDF password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-gray-600 text-xs mt-1">Usually your PAN or date of birth</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Parsing CAS...
                </span>
              ) : (
                'Analyse Portfolio →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
