import { useState } from 'react';
import { analyseResume } from '../utils/aiApi';
import { CloudArrowUpIcon, DocumentTextIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useEffect } from 'react';

function ScoreRing({ score, size = 120, color = '#6366f1' }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" className="dark:stroke-gray-700" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function Badge({ label, color }) {
  const colors = {
    green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    red:    'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    gray:   'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl border text-xs font-semibold ${colors[color]}`}>
      {label}
    </span>
  );
}

function ResultCard({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ResumeAnalyser() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');

  useEffect(() => {
    api.get('/jobs').then(res => setJobs(res.data.jobs)).catch(() => {});
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
    else toast.error('Please upload a PDF file');
  };

  const handleJobSelect = (jobId) => {
    setSelectedJob(jobId);
    const job = jobs.find(j => j._id === jobId);
    if (job?.description) setJobDescription(job.description);
  };

  const handleAnalyse = async () => {
    if (!file) { toast.error('Please upload your resume'); return; }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      if (selectedJob) formData.append('jobId', selectedJob);
      const res = await analyseResume(formData);
      setResult(res.data.result);
      toast.success('Resume analysed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.matchScore >= 75 ? '#10b981'
    : result.matchScore >= 50 ? '#f59e0b' : '#ef4444'
    : '#6366f1';

  const ratingColor = {
    Excellent: 'green', Good: 'indigo', Fair: 'amber', Poor: 'red'
  };

  const matchColor = { Strong: 'green', Moderate: 'amber', Weak: 'red', 'N/A': 'gray' };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl lg:text-3xl text-gray-900 dark:text-white mb-1">
          Resume Analyser 📄
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Upload your resume and get an AI-powered match score against any job
        </p>
      </div>

      {/* Upload + JD Card */}
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 space-y-5">

        {/* PDF Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            📎 Your Resume (PDF)
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('resume-input').click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : file
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
          >
            <input id="resume-input" type="file" accept=".pdf" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                  Drop your resume here or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF only · Max 5MB</p>
              </>
            )}
          </div>
        </div>

        {/* Job selector */}
        {jobs.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              💼 Match Against a Job (Optional)
            </label>
            <div className="relative">
              <select value={selectedJob} onChange={e => handleJobSelect(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm
                  focus:outline-none focus:border-indigo-500 transition-all cursor-pointer">
                <option value="">Select a job application...</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.position} at {j.company}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▾</span>
            </div>
          </div>
        )}

        {/* Job Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            📋 Job Description (Optional — for better match score)
          </label>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for a more accurate match score..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm resize-none
              focus:outline-none focus:border-indigo-500 transition-all
              placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        {/* Analyse Button */}
        <button onClick={handleAnalyse} disabled={loading || !file}
          className="w-full py-3.5 rounded-xl text-sm font-bold
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600
            text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
            transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none">
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analysing your resume...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <SparklesIcon className="w-4 h-4" /> Analyse Resume
            </span>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">

          {/* Score Overview */}
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={result.matchScore} color={scoreColor} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white">Match Score</h2>
                  <Badge label={result.overallRating} color={ratingColor[result.overallRating] || 'gray'} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{result.summary}</p>
                <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    💡 Top Recommendation: {result.topRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'ATS Score', value: `${result.atsScore}/100`, color: result.atsScore >= 70 ? 'green' : result.atsScore >= 50 ? 'amber' : 'red' },
                { label: 'Experience', value: result.experienceMatch, color: matchColor[result.experienceMatch] },
                { label: 'Keywords', value: result.keywordDensity, color: result.keywordDensity === 'High' ? 'green' : result.keywordDensity === 'Medium' ? 'amber' : 'red' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                  <Badge label={value} color={color} />
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard title="Matching Skills" icon="✅">
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.length > 0
                  ? result.matchingSkills.map(s => <Badge key={s} label={s} color="green" />)
                  : <p className="text-sm text-gray-400">None detected</p>}
              </div>
            </ResultCard>
            <ResultCard title="Missing Skills" icon="❌">
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.length > 0
                  ? result.missingSkills.map(s => <Badge key={s} label={s} color="red" />)
                  : <p className="text-sm text-gray-400">None — great match!</p>}
              </div>
            </ResultCard>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard title="Strengths" icon="💪">
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </ResultCard>
            <ResultCard title="Areas to Improve" icon="🔧">
              <ul className="space-y-2">
                {result.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </ResultCard>
          </div>

        </div>
      )}
    </div>
  );
}