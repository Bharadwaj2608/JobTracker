import { useState } from 'react';
import api from '../utils/api';
import { XMarkIcon, EnvelopeIcon, SparklesIcon, PlusIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  applied:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  screening: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  interview: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  offer:     'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  rejected:  'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const PLACEHOLDER = `From: recruiter@google.com
Date: 2024-03-15
Subject: Your application for Software Engineer at Google
Body: Thank you for applying to the Software Engineer position at Google. We have received your application and will review it shortly.

---

From: noreply@linkedin.com
Date: 2024-03-14
Subject: Your application was sent to Meta
Body: Your application for the Frontend Developer role at Meta has been submitted successfully.`;

export default function EmailImport({ onClose, onImported }) {
  const [step, setStep]         = useState('paste');
  const [rawText, setRawText]   = useState('');
  const [parsed, setParsed]     = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving]     = useState(false);

  const handleScan = async () => {
    const text = rawText.trim();
    if (!text) { toast.error('Paste some email content first'); return; }
    setStep('scanning');

    const blocks = text
      .split(/\n---+\n|\n\n(?=From:)/i)
      .map(b => b.trim())
      .filter(Boolean);

    const emails = blocks.map(block => ({
      from:    block.match(/^From:\s*(.+)/im)?.[1]?.trim()    || '',
      date:    block.match(/^Date:\s*(.+)/im)?.[1]?.trim()    || '',
      subject: block.match(/^Subject:\s*(.+)/im)?.[1]?.trim() || '',
      body:    block.replace(/^(From|Date|Subject):.*\n?/gim, '').trim(),
    }));

    try {
      const res = await api.post('/email-import/scan', { emails });
      const results = res.data.parsed || [];
      if (!results.length) {
        toast('No job-related emails found.', { icon: '🔍' });
        setStep('paste');
        return;
      }
      setParsed(results);
      setSelected(new Set(results.map((_, i) => i)));
      setStep('review');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed');
      setStep('paste');
    }
  };

  const handleAdd = async () => {
    if (!selected.size) { toast.error('Select at least one job'); return; }
    setSaving(true);
    try {
      const jobs = [...selected].map(i => parsed[i]);
      const res  = await api.post('/email-import/add', { jobs });
      toast.success(`${res.data.added} job${res.data.added !== 1 ? 's' : ''} added!`);
      onImported?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add jobs');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Import from Emails</h2>
              <p className="text-xs text-gray-400">AI extracts job details automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {step === 'paste' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-700 dark:text-indigo-300">
                <p className="font-semibold mb-1">How to use:</p>
                <ol className="list-decimal ml-4 space-y-1 text-xs">
                  <li>Open Gmail / Outlook and find job-related emails</li>
                  <li>Copy the email content (subject, from, body)</li>
                  <li>Paste below and click <strong>Scan with AI</strong></li>
                </ol>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Paste Email Content
                </label>
                <textarea
                  rows={12}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={PLACEHOLDER}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:border-indigo-500 transition-all resize-none
                    placeholder:text-gray-300 dark:placeholder:text-gray-600 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple emails with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">---</code>
                </p>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 dark:text-white">Scanning with AI...</p>
                <p className="text-sm text-gray-400 mt-1">Extracting job details from your emails</p>
              </div>
              <div className="flex gap-1 mt-2">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Found <span className="font-bold text-indigo-600 dark:text-indigo-400">{parsed.length}</span> job{parsed.length !== 1 ? 's' : ''} — select which to add
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(parsed.map((_, i) => i)))}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setSelected(new Set())}
                    className="text-xs text-gray-500 hover:underline">None</button>
                </div>
              </div>

              {parsed.map((job, i) => (
                <div key={i} onClick={() => toggleSelect(i)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selected.has(i)
                      ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 opacity-60'}`}>

                  <div className={`absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${selected.has(i) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {selected.has(i) && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  <div className="pr-8">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{job.position}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">at {job.company}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${STATUS_STYLE[job.status] || STATUS_STYLE.applied}`}>
                        {job.status}
                      </span>
                      {job.location && (
                        <span className="text-xs px-2 py-0.5 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                          📍 {job.location}
                        </span>
                      )}
                      {job.appliedDate && (
                        <span className="text-xs px-2 py-0.5 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                          📅 {job.appliedDate}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${
                        job.confidence === 'high' ? 'text-emerald-600 dark:text-emerald-400' :
                        job.confidence === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-500 dark:text-red-400'}`}>
                        {job.confidence === 'high' ? '✓ High' : job.confidence === 'medium' ? '~ Medium' : '! Low'} confidence
                      </span>
                    </div>
                    {job.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">{job.notes}</p>
                    )}
                  </div>
                </div>
              ))}

              {parsed.some(j => j.confidence === 'low') && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <ExclamationCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">Some items have low confidence — review before adding</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          {step === 'paste' && (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold
                  text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Cancel
              </button>
              <button onClick={handleScan}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold
                  flex items-center justify-center gap-2 transition-all shadow-md">
                <SparklesIcon className="w-4 h-4" /> Scan with AI
              </button>
            </>
          )}
          {step === 'review' && (
            <>
              <button onClick={() => { setStep('paste'); setParsed([]); setSelected(new Set()); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold
                  text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                ← Back
              </button>
              <button onClick={handleAdd} disabled={saving || !selected.size}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold
                  flex items-center justify-center gap-2 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><PlusIcon className="w-4 h-4" /> Add {selected.size} Job{selected.size !== 1 ? 's' : ''}</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}