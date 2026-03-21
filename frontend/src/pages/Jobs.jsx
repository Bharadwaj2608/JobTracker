import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon, MagnifyingGlassIcon, PencilSquareIcon,
  TrashIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon,
  BriefcaseIcon, EnvelopeIcon, AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import { getStatusConfig, getPriorityConfig, STATUS_CONFIG, JOB_TYPE_CONFIG, SOURCE_CONFIG } from '../utils/helpers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmailImport from './EmailImport';

const STATUSES = Object.keys(STATUS_CONFIG);

const STATUS_PILL = {
  applied:   { bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6', darkBg:'rgba(59,130,246,0.12)',  darkText:'#93c5fd' },
  screening: { bg:'#fefce8', text:'#a16207', dot:'#eab308', darkBg:'rgba(234,179,8,0.12)',   darkText:'#fde047' },
  interview: { bg:'#faf5ff', text:'#7e22ce', dot:'#a855f7', darkBg:'rgba(168,85,247,0.12)',  darkText:'#d8b4fe' },
  offer:     { bg:'#f0fdf4', text:'#15803d', dot:'#22c55e', darkBg:'rgba(34,197,94,0.12)',   darkText:'#86efac' },
  approved:  { bg:'#ecfdf5', text:'#065f46', dot:'#10b981', darkBg:'rgba(16,185,129,0.12)',  darkText:'#6ee7b7' },
  rejected:  { bg:'#fff1f2', text:'#be123c', dot:'#f43f5e', darkBg:'rgba(244,63,94,0.12)',   darkText:'#fda4af' },
  withdrawn: { bg:'#f9fafb', text:'#6b7280', dot:'#9ca3af', darkBg:'rgba(156,163,175,0.12)', darkText:'#d1d5db' },
};

const COMPANY_COLORS = [
  ['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],['#f97316','#eab308'],
  ['#10b981','#06b6d4'],['#3b82f6','#6366f1'],['#8b5cf6','#ec4899'],
  ['#14b8a6','#10b981'],['#f59e0b','#f97316'],
];
const getCompanyColor = (name) => COMPANY_COLORS[(name?.charCodeAt(0)||0) % COMPANY_COLORS.length];

export default function Jobs() {
  const [jobs, setJobs]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [total, setTotal]                   = useState(0);
  const [search, setSearch]                 = useState('');
  const [filters, setFilters]               = useState({ status:'', priority:'', jobType:'', source:'' });
  const [showFilters, setShowFilters]       = useState(false);
  const [deleteId, setDeleteId]             = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [showEmailImport, setShowEmailImport] = useState(false);

  const isDark = document.documentElement.classList.contains('dark');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, search };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    } catch { toast.error('Failed to fetch applications'); }
    finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const handleStatusChange = async (jobId, status) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/status`, { status });
      setJobs(jobs.map(j => j._id === jobId ? res.data.job : j));
      setStatusDropdown(null);
      toast.success(`Moved to ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(j => j._id !== id));
      setTotal(t => t - 1);
      setDeleteId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const clearFilters = () => setFilters({ status:'', priority:'', jobType:'', source:'' });
  const hasFilters   = Object.values(filters).some(Boolean) || search;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const statusCounts = STATUSES.reduce((acc,s) => { acc[s] = jobs.filter(j => j.status===s).length; return acc; }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .jobs-page { font-family:'DM Sans',sans-serif; }
        .job-card  { transition:all 0.2s ease; }
        .job-card:hover { transform:translateY(-2px); }
        .job-card:hover .card-actions { opacity:1; }
        .card-actions { opacity:0; transition:opacity 0.15s; }
        @media(max-width:640px){ .card-actions{opacity:1;} }
        .sdot { width:7px;height:7px;border-radius:50%;display:inline-block; }
        .fchip { border-radius:99px;padding:6px 14px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;white-space:nowrap;font-family:'DM Sans',sans-serif; }
        .fchip:hover { transform:translateY(-1px); }
        .srch input { background:transparent;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;width:100%; }
        .smenu { position:absolute;top:calc(100% + 6px);left:0;z-index:30;border-radius:14px;overflow:hidden;min-width:160px; }
        .sopt  { display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.1s;width:100%;border:none; }
        .abtn  { background:none;border:none;cursor:pointer;padding:7px;border-radius:9px;transition:all 0.15s;display:flex;color:#9ca3af; }
        .abtn:hover  { background:rgba(99,102,241,0.1);color:#6366f1; }
        .dbtn  { background:none;border:none;cursor:pointer;padding:7px;border-radius:9px;transition:all 0.15s;display:flex;color:#9ca3af; }
        .dbtn:hover  { background:rgba(239,68,68,0.1);color:#ef4444; }
        .tag   { font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;letter-spacing:0.3px;text-transform:capitalize; }
        .spin  { animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg);} }
        .fadein { animation:fadeIn 0.3s ease both; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        .slidedown { animation:slideDown 0.2s ease both; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div className="jobs-page fadein" style={{ display:'flex',flexDirection:'column',gap:20 }}>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
          <div>
            <h1 className="text-gray-900 dark:text-white" style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:24,letterSpacing:'-0.6px',lineHeight:1.1,marginBottom:4 }}>
              Applications
            </h1>
            <p className="text-gray-400 dark:text-gray-500" style={{ fontSize:14 }}>
              {total} total · {jobs.filter(j=>['interview','offer'].includes(j.status)).length} active
            </p>
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            <button onClick={() => setShowEmailImport(true)}
              className="dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderRadius:12,border:'1.5px solid #c7d2fe',color:'#4f46e5',background:'rgba(99,102,241,0.04)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
              <EnvelopeIcon style={{ width:15,height:15 }}/>
              From Emails
            </button>
            <Link to="/jobs/add"
              style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 4px 14px rgba(99,102,241,0.3)',whiteSpace:'nowrap' }}>
              <PlusIcon style={{ width:15,height:15 }}/> Add New
            </Link>
          </div>
        </div>

        {/* Status filter pills */}
        {total > 0 && (
          <div style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:2 }}>
            <button onClick={() => setFilters(f=>({...f,status:''}))} className="fchip"
              style={{ background:!filters.status?'#6366f1':'transparent', color:!filters.status?'#fff':'#9ca3af', borderColor:!filters.status?'#6366f1':'rgba(156,163,175,0.3)' }}>
              All <span style={{ opacity:0.7,marginLeft:4 }}>{total}</span>
            </button>
            {STATUSES.filter(s=>statusCounts[s]>0).map(s => {
              const p = STATUS_PILL[s]||STATUS_PILL.applied;
              const active = filters.status===s;
              return (
                <button key={s} onClick={() => setFilters(f=>({...f,status:active?'':s}))} className="fchip"
                  style={{ background:active?p.dot:'transparent', color:active?'#fff':'#9ca3af', borderColor:active?p.dot:'rgba(156,163,175,0.3)' }}>
                  <span className="sdot" style={{ background:p.dot,marginRight:6 }}/>
                  {s} <span style={{ opacity:0.7,marginLeft:4 }}>{statusCounts[s]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search + filter bar */}
        <div className="bg-white dark:bg-gray-800/60" style={{ borderRadius:16,padding:16,border:'1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex',gap:10 }}>
            <div className="srch dark:bg-gray-900/50 dark:border-gray-700"
              style={{ flex:1,display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,border:'1.5px solid rgba(0,0,0,0.08)',background:'rgba(0,0,0,0.02)' }}>
              <MagnifyingGlassIcon style={{ width:16,height:16,opacity:0.4,flexShrink:0 }}/>
              <input placeholder="Search company, role, location…" value={search}
                onChange={e=>setSearch(e.target.value)}
                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-400"/>
              {search && <button onClick={()=>setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',opacity:0.4,fontSize:18,padding:0,lineHeight:1 }}>×</button>}
            </div>
            <button onClick={()=>setShowFilters(!showFilters)}
              className="dark:border-gray-700 dark:text-gray-300"
              style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 14px',borderRadius:12,border:'1.5px solid rgba(0,0,0,0.08)',background:'transparent',cursor:'pointer',fontSize:14,fontWeight:500,fontFamily:'DM Sans,sans-serif',color:showFilters?'#6366f1':undefined,borderColor:showFilters?'#6366f1':undefined }}>
              <AdjustmentsHorizontalIcon style={{ width:15,height:15 }}/>
              Filters
              {activeFilterCount>0 && <span style={{ width:18,height:18,borderRadius:99,background:'#6366f1',color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>{activeFilterCount}</span>}
            </button>
            {hasFilters && (
              <button onClick={()=>{clearFilters();setSearch('');}}
                style={{ padding:'10px 12px',borderRadius:12,border:'1.5px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.05)',color:'#ef4444',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="slidedown" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginTop:12,paddingTop:12,borderTop:'1px solid rgba(0,0,0,0.06)' }}>
              {[
                { key:'status',   label:'Status',   options:STATUSES },
                { key:'priority', label:'Priority',  options:['low','medium','high'] },
                { key:'jobType',  label:'Job Type',  options:Object.keys(JOB_TYPE_CONFIG) },
                { key:'source',   label:'Source',    options:Object.keys(SOURCE_CONFIG) },
              ].map(({ key,label,options }) => (
                <div key={key}>
                  <div style={{ fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',opacity:0.4,marginBottom:5 }}>{label}</div>
                  <select value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}
                    className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 dark:border-gray-700"
                    style={{ width:'100%',padding:'8px 10px',borderRadius:10,border:'1.5px solid rgba(0,0,0,0.08)',fontSize:13,fontFamily:'DM Sans,sans-serif',cursor:'pointer',outline:'none' }}>
                    <option value="">All</option>
                    {options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jobs list */}
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:200 }}>
            <svg className="spin" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="rgba(99,102,241,0.2)" strokeWidth="3"/>
              <path d="M14 3a11 11 0 0 1 11 11" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>

        ) : jobs.length===0 ? (
          <div className="bg-white dark:bg-gray-800/60" style={{ borderRadius:20,padding:'56px 32px',textAlign:'center',border:'1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
              <BriefcaseIcon style={{ width:26,height:26,color:'#818cf8' }}/>
            </div>
            <h3 className="text-gray-800 dark:text-white" style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:18,marginBottom:6 }}>
              {hasFilters?'No results':'No applications yet'}
            </h3>
            <p className="text-gray-400" style={{ fontSize:14,marginBottom:24 }}>
              {hasFilters?'Try adjusting your filters':'Add your first job application to get started'}
            </p>
            {!hasFilters && (
              <Link to="/jobs/add" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 4px 14px rgba(99,102,241,0.3)' }}>
                <PlusIcon style={{ width:15,height:15 }}/> Add Application
              </Link>
            )}
          </div>

        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {jobs.map((job,idx) => {
              const [c1,c2] = getCompanyColor(job.company);
              const sp = STATUS_PILL[job.status]||STATUS_PILL.applied;
              return (
                <div key={job._id} className="job-card bg-white dark:bg-gray-800/60 fadein"
                  style={{ borderRadius:18,border:'1px solid rgba(0,0,0,0.05)',padding:'16px 18px',display:'flex',gap:14,alignItems:'center',animationDelay:`${idx*30}ms` }}>

                  <div style={{ width:46,height:46,borderRadius:13,background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18,fontWeight:700,color:'#fff',fontFamily:'Syne,sans-serif' }}>
                    {job.company[0].toUpperCase()}
                  </div>

                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4 }}>
                      <span className="text-gray-900 dark:text-white" style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15 }}>{job.position}</span>
                      <span className="tag dark:bg-gray-700 dark:text-gray-300" style={{ background:'rgba(0,0,0,0.05)',color:'rgba(0,0,0,0.5)' }}>{job.company}</span>
                      {job.priority==='high' && <span className="tag" style={{ background:'rgba(239,68,68,0.1)',color:'#ef4444' }}>🔥 High</span>}
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      {/* Status pill + dropdown */}
                      <div style={{ position:'relative' }}>
                        <button onClick={()=>setStatusDropdown(statusDropdown===job._id?null:job._id)}
                          style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:99,background:isDark?sp.darkBg:sp.bg,color:isDark?sp.darkText:sp.text,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'DM Sans,sans-serif' }}>
                          <span className="sdot" style={{ background:sp.dot }}/>
                          {job.status}
                          <ChevronDownIcon style={{ width:11,height:11,opacity:0.6 }}/>
                        </button>
                        {statusDropdown===job._id && (
                          <div className="smenu bg-white dark:bg-gray-800 slidedown" style={{ boxShadow:'0 8px 32px rgba(0,0,0,0.12)',border:'1px solid rgba(0,0,0,0.06)' }}>
                            {STATUSES.map(s => {
                              const spc = STATUS_PILL[s]||STATUS_PILL.applied;
                              return (
                                <button key={s} onClick={()=>handleStatusChange(job._id,s)}
                                  className="sopt text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <span className="sdot" style={{ background:spc.dot }}/>
                                  {s}
                                  {job.status===s && <span style={{ marginLeft:'auto',color:'#6366f1' }}>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-400" style={{ fontSize:12 }}>{job.location}</span>
                      <span className="text-gray-300" style={{ fontSize:12 }}>·</span>
                      <span className="text-gray-400" style={{ fontSize:12 }}>{format(new Date(job.appliedDate),'MMM d')}</span>
                      {job.salary?.min && <span style={{ fontSize:12,fontWeight:600,color:'#10b981' }}>${job.salary.min.toLocaleString()}{job.salary.max?`–${job.salary.max.toLocaleString()}`:'+' }</span>}
                      {job.source&&job.source!=='other' && <span className="tag dark:bg-gray-700 dark:text-gray-400" style={{ background:'rgba(0,0,0,0.04)',color:'rgba(0,0,0,0.4)',fontSize:10 }}>{job.source}</span>}
                    </div>
                    {job.notes && <p className="text-gray-400" style={{ marginTop:5,fontSize:12,fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{job.notes}</p>}
                  </div>

                  <div className="card-actions" style={{ display:'flex',gap:2,flexShrink:0 }}>
                    {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer" className="abtn"><ArrowTopRightOnSquareIcon style={{ width:16,height:16 }}/></a>}
                    <Link to={`/jobs/edit/${job._id}`} className="abtn"><PencilSquareIcon style={{ width:16,height:16 }}/></Link>
                    <button onClick={()=>setDeleteId(job._id)} className="dbtn"><TrashIcon style={{ width:16,height:16 }}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete modal */}
        {deleteId && (
          <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)' }}>
            <div className="bg-white dark:bg-gray-900 fadein" style={{ borderRadius:20,padding:28,width:'100%',maxWidth:360,boxShadow:'0 24px 64px rgba(0,0,0,0.2)',border:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width:44,height:44,borderRadius:12,background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                <TrashIcon style={{ width:20,height:20,color:'#ef4444' }}/>
              </div>
              <h3 className="text-gray-900 dark:text-white" style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,marginBottom:6 }}>Delete application?</h3>
              <p className="text-gray-400" style={{ fontSize:14,marginBottom:24 }}>This cannot be undone.</p>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>setDeleteId(null)} className="dark:border-gray-700 dark:text-gray-300"
                  style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid rgba(0,0,0,0.1)',background:'transparent',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
                  Cancel
                </button>
                <button onClick={()=>handleDelete(deleteId)}
                  style={{ flex:1,padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#ef4444,#f43f5e)',color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 14px rgba(239,68,68,0.3)' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showEmailImport && <EmailImport onClose={()=>setShowEmailImport(false)} onImported={fetchJobs}/>}
        {statusDropdown && <div style={{ position:'fixed',inset:0,zIndex:20 }} onClick={()=>setStatusDropdown(null)}/>}
      </div>
    </>
  );
}