import { useState } from 'react';

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   emoji: '📋', color: 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300' },
  screening: { label: 'Screening', emoji: '🔍', color: 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300' },
  interview: { label: 'Interview', emoji: '🎙️', color: 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-300' },
  offer:     { label: 'Offer',     emoji: '🤝', color: 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/20 dark:border-orange-600 dark:text-orange-300' },
  approved:  { label: 'Approved',  emoji: '✅', color: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300' },
  rejected:  { label: 'Rejected',  emoji: '❌', color: 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300' },
  withdrawn: { label: 'Withdrawn', emoji: '↩️', color: 'bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400' },
};

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    emoji: '🟢', color: 'bg-slate-50 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300' },
  medium: { label: 'Medium', emoji: '🟡', color: 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-300' },
  high:   { label: 'High',   emoji: '🔴', color: 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-900/20 dark:border-rose-600 dark:text-rose-300' },
};

const JOB_TYPES = ['full-time','part-time','contract','internship','freelance'];
const JOB_TYPE_LABELS = { 'full-time':'Full-time','part-time':'Part-time','contract':'Contract','internship':'Internship','freelance':'Freelance' };
const SOURCES = ['linkedin','indeed','glassdoor','company-website','referral','other'];
const SOURCE_LABELS = { linkedin:'LinkedIn', indeed:'Indeed', glassdoor:'Glassdoor', 'company-website':'Company Website', referral:'Referral', other:'Other' };
const CURRENCIES = ['USD','EUR','GBP','INR','CAD','AUD'];

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30">
        <span className="text-xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FloatingInput({ label, required, icon, type = 'text', placeholder, value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="relative group">
      <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-900
        ${focused
          ? 'border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
        {icon && <span className={`pl-3.5 text-base transition-opacity ${focused ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>}
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused || !label ? placeholder : ''}
          className={`w-full bg-transparent text-gray-800 dark:text-gray-100 text-sm outline-none
            ${icon ? 'pl-2 pr-4 py-3.5' : 'px-4 py-3.5'}
            placeholder:text-gray-300 dark:placeholder:text-gray-600`}
          {...props}
        />
        {required && <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />}
      </div>
      {label && (
        <label className={`absolute transition-all duration-200 pointer-events-none font-medium
          ${active ? '-top-2.5 text-xs px-1 bg-white dark:bg-gray-900 rounded text-indigo-500' : 'top-3.5 text-sm text-gray-400 dark:text-gray-500'}
          ${icon ? 'left-10' : 'left-4'}`}>
          {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
    </div>
  );
}

function FloatingTextarea({ label, placeholder, value, onChange, rows = 3, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className={`relative rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-900
        ${focused
          ? 'border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
        {icon && <span className={`absolute left-3.5 top-3.5 text-base transition-opacity ${focused ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>}
        <textarea
          rows={rows} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ''}
          className={`w-full bg-transparent text-gray-800 dark:text-gray-100 text-sm outline-none resize-none
            ${icon ? 'pl-10' : 'px-4'} pr-4 py-3.5
            placeholder:text-gray-300 dark:placeholder:text-gray-600`}
        />
      </div>
      {label && (
        <label className={`absolute transition-all duration-200 pointer-events-none font-medium
          ${focused || value ? '-top-2.5 text-xs px-1 bg-white dark:bg-gray-900 rounded text-indigo-500' : 'top-3.5 text-sm text-gray-400 dark:text-gray-500'}
          ${icon ? 'left-10' : 'left-4'}`}>{label}
        </label>
      )}
    </div>
  );
}

function ChipSelector({ options, value, onChange, configMap }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const cfg = configMap[opt];
        const selected = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold
              transition-all duration-150 active:scale-95
              ${selected
                ? `${cfg.color} shadow-sm scale-105`
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
            <span>{cfg.emoji}</span>{cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function PillSelector({ options, labelMap, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150 active:scale-95
            ${value === opt
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 scale-105'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500'}`}>
          {labelMap[opt]}
        </button>
      ))}
    </div>
  );
}

function DateInput({ label, icon, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
        {icon} {label}
      </label>
      <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-900
        ${focused
          ? 'border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
        <input
          type="date"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-gray-800 dark:text-gray-100 text-sm outline-none px-4 py-3 [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
    </div>
  );
}

export default function JobForm({ initialData = {}, onSubmit, loading, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    company: '', position: '', location: '', jobUrl: '',
    status: 'applied', priority: 'medium',
    jobType: 'full-time', source: 'other',
    salaryMin: '', salaryMax: '', salaryCurrency: 'USD',
    appliedDate: new Date().toISOString().split('T')[0],
    interviewDate: '', followUpDate: '',
    description: '', notes: '', tags: '',
    ...initialData,
    salaryMin: initialData.salary?.min || '',
    salaryMax: initialData.salary?.max || '',
    salaryCurrency: initialData.salary?.currency || 'USD',
    tags: (initialData.tags || []).join(', '),
    appliedDate: initialData.appliedDate
      ? new Date(initialData.appliedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    interviewDate: initialData.interviewDate
      ? new Date(initialData.interviewDate).toISOString().split('T')[0] : '',
    followUpDate: initialData.followUpDate
      ? new Date(initialData.followUpDate).toISOString().split('T')[0] : '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target?.value ?? e }));
  const setDirect = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      company: form.company, position: form.position,
      location: form.location, jobUrl: form.jobUrl,
      jobType: form.jobType, status: form.status,
      priority: form.priority, source: form.source,
      description: form.description, notes: form.notes,
      appliedDate: form.appliedDate,
      salary: {
        min: form.salaryMin ? Number(form.salaryMin) : undefined,
        max: form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: form.salaryCurrency,
      },
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      interviewDate: form.interviewDate || undefined,
      followUpDate: form.followUpDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <SectionCard icon="🏢" title="Basic Information" subtitle="Where are you applying?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput label="Company Name" required icon="🏢"
            placeholder="Google, Amazon, Stripe..."
            value={form.company} onChange={set('company')} />
          <FloatingInput label="Position / Role" required icon="💼"
            placeholder="Software Engineer, Designer..."
            value={form.position} onChange={set('position')} />
          <FloatingInput label="Location" icon="📍"
            placeholder="Remote, New York, Bangalore..."
            value={form.location} onChange={set('location')} />
          <FloatingInput label="Job URL" icon="🔗" type="url"
            placeholder="https://linkedin.com/jobs/..."
            value={form.jobUrl} onChange={set('jobUrl')} />
        </div>
      </SectionCard>

      <SectionCard icon="📊" title="Status & Details" subtitle="Track where you stand">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Application Status</p>
            <ChipSelector
              options={Object.keys(STATUS_CONFIG)}
              value={form.status}
              onChange={setDirect('status')}
              configMap={STATUS_CONFIG}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Priority</p>
              <ChipSelector
                options={Object.keys(PRIORITY_CONFIG)}
                value={form.priority}
                onChange={setDirect('priority')}
                configMap={PRIORITY_CONFIG}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Job Type</p>
              <PillSelector
                options={JOB_TYPES} labelMap={JOB_TYPE_LABELS}
                value={form.jobType} onChange={setDirect('jobType')}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Source</p>
              <PillSelector
                options={SOURCES} labelMap={SOURCE_LABELS}
                value={form.source} onChange={setDirect('source')}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="💰" title="Salary" subtitle="Optional — helps with negotiation">
        <div className="grid grid-cols-3 gap-4">
          <FloatingInput label="Min Salary" icon="💵" type="number"
            placeholder="50000" value={form.salaryMin} onChange={set('salaryMin')} />
          <FloatingInput label="Max Salary" icon="💵" type="number"
            placeholder="80000" value={form.salaryMax} onChange={set('salaryMax')} />
          <div className="relative">
            <div className="relative rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 transition-all">
              <span className="absolute left-3.5 top-3.5 text-base opacity-40">🌐</span>
              <select value={form.salaryCurrency} onChange={set('salaryCurrency')}
                className="w-full bg-transparent text-gray-800 dark:text-gray-100 text-sm outline-none pl-10 pr-4 py-3.5 appearance-none cursor-pointer">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
            <label className="-top-2.5 left-10 absolute text-xs px-1 bg-white dark:bg-gray-900 rounded text-indigo-500 font-medium">
              Currency
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="📅" title="Dates" subtitle="Keep track of your timeline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateInput label="Applied Date"   icon="📋" value={form.appliedDate}   onChange={set('appliedDate')} />
          <DateInput label="Interview Date" icon="🎙️" value={form.interviewDate} onChange={set('interviewDate')} />
          <DateInput label="Follow-up Date" icon="🔔" value={form.followUpDate}  onChange={set('followUpDate')} />
        </div>
      </SectionCard>

      <SectionCard icon="📝" title="Notes & Tags" subtitle="Your personal notes and labels">
        <div className="space-y-4">
          <FloatingTextarea label="Job Description" icon="📄"
            placeholder="Paste the job description here..."
            value={form.description} onChange={set('description')} rows={4} />
          <FloatingTextarea label="Personal Notes" icon="💭"
            placeholder="Contacts, impressions, things to follow up on..."
            value={form.notes} onChange={set('notes')} rows={3} />
          <FloatingInput label="Tags" icon="🏷️"
            placeholder="react, remote, startup, senior"
            value={form.tags} onChange={set('tags')} />
          {form.tags && (
            <div className="flex flex-wrap gap-2 pt-1">
              {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                    bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700
                    text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <button
        type="submit"
        disabled={loading || !form.company || !form.position}
        className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600
          text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
          transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving application...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">✨ {submitLabel}</span>
        )}
      </button>

    </form>
  );
}