import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const strengthLabel = (p) => {
  if (!p) return null;
  if (p.length < 6) return { label: 'Too short', w: '20%', color: '#ef4444' };
  if (p.length < 8) return { label: 'Weak',      w: '40%', color: '#f97316' };
  const has = [/[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(p)).length;
  if (has === 0) return { label: 'Fair',   w: '55%',  color: '#eab308' };
  if (has === 1) return { label: 'Good',   w: '75%',  color: '#84cc16' };
  return{ label: 'Strong', w: '100%', color: '#22c55e' };
};

export default function Register() {
  const { register } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const strength = strengthLabel(form.password);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to JobTrackr 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full name',        type: 'text',                          placeholder: 'Alex Johnson',     icon: '◈' },
    { key: 'email',    label: 'Email',             type: 'email',                         placeholder: 'you@example.com',  icon: '◉' },
    { key: 'password', label: 'Password',          type: showPass ? 'text' : 'password',  placeholder: 'Min 6 characters', icon: '◆' },
    { key: 'confirm',  label: 'Confirm password',  type: showPass ? 'text' : 'password',  placeholder: 'Re-enter password',icon: '◆' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', background: dark ? '#080b12' : '#f0f2f8', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        .reg-input { width:100%;background:transparent;border:none;outline:none;font-size:15px;font-family:'DM Sans',sans-serif;color:inherit;padding:0; }
        .reg-input::placeholder{opacity:0.35;}
        .reg-field{border-radius:14px;padding:14px 16px;transition:all 0.2s;display:flex;align-items:center;gap:12px;}
        .field-focused{transform:translateY(-1px);}
        .reg-submit{width:100%;border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.25s;letter-spacing:0.3px;}
        .reg-submit:hover:not(:disabled){transform:translateY(-2px);}
        .reg-submit:disabled{opacity:0.6;cursor:not-allowed;}
        .spin{animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .fade-up{animation:fadeUp 0.5s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
        .str-bar{height:3px;border-radius:99px;transition:all 0.4s ease;}
      `}</style>

      {/* Left decorative panel */}
      <div className="hidden lg:flex" style={{ width:'45%',flexDirection:'column',justifyContent:'space-between',padding:'52px',position:'relative',overflow:'hidden',background: dark?'#0d1117':'#1a1f2e' }}>
        <div className="orb" style={{ width:360,height:360,top:-80,left:-80,background:'rgba(99,102,241,0.25)' }}/>
        <div className="orb" style={{ width:280,height:280,bottom:60,right:-60,background:'rgba(139,92,246,0.2)' }}/>
        <div className="orb" style={{ width:200,height:200,top:'45%',left:'30%',background:'rgba(59,130,246,0.15)' }}/>

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:72 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>◈</div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff',letterSpacing:'-0.5px' }}>JobTrackr</span>
          </div>
          <h2 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:42,lineHeight:1.1,color:'#fff',marginBottom:16,letterSpacing:'-1px' }}>
            Your career,<br/>
            <span style={{ background:'linear-gradient(90deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>organized.</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.45)',fontSize:16,lineHeight:1.7,maxWidth:320 }}>
            Track every application, interview, and offer in one place. Never lose an opportunity again.
          </p>
        </div>

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:32 }}>
            {[{ n:'2,400+',l:'Jobs tracked daily'},{ n:'89%',l:'Users land faster'},{ n:'4.2×',l:'More organized'},{ n:'Free',l:'Always free'}].map(({ n, l }) => (
              <div key={n} style={{ background:'rgba(255,255,255,0.06)',borderRadius:14,padding:'18px 16px',border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:24,color:'#fff',letterSpacing:'-0.5px' }}>{n}</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',gap:10 }}>
            {['Track','Analyse','Succeed'].map(t => (
              <div key={t} style={{ padding:'8px 14px',borderRadius:99,border:'1px solid rgba(255,255,255,0.12)',fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',position:'relative' }}>
        <button onClick={toggle} style={{ position:'absolute',top:20,right:20,width:38,height:38,borderRadius:10,border: dark?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)',background: dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>
          {dark ? '☀️' : '🌙'}
        </button>

        <div className="fade-up" style={{ width:'100%',maxWidth:420 }}>
          <div className="lg:hidden" style={{ display:'flex',alignItems:'center',gap:8,marginBottom:36 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>◈</div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color: dark?'#fff':'#111' }}>JobTrackr</span>
          </div>

          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:30,letterSpacing:'-0.8px',color: dark?'#fff':'#0f1117',marginBottom:6 }}>Create account</h1>
            <p style={{ color: dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)',fontSize:15 }}>Join and start tracking today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {fields.map(({ key, label, type, placeholder, icon }, idx) => (
                <div key={key} className="fade-up" style={{ animationDelay:`${idx*60}ms` }}>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase',color: dark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)',marginBottom:6 }}>{label}</label>
                  <div className={`reg-field ${focused===key?'field-focused':''}`} style={{ background: dark?'rgba(255,255,255,0.05)':'#fff', border: focused===key?'1.5px solid #6366f1': dark?'1.5px solid rgba(255,255,255,0.08)':'1.5px solid rgba(0,0,0,0.08)', boxShadow: focused===key?'0 0 0 4px rgba(99,102,241,0.12)':'none', color: dark?'#fff':'#0f1117' }}>
                    <span style={{ fontSize:13,opacity:0.4,flexShrink:0 }}>{icon}</span>
                    <input type={type} required placeholder={placeholder}
                      value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                      className="reg-input" style={{ color: dark?'#fff':'#0f1117' }} />
                    {key === 'password' && (
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ background:'none',border:'none',cursor:'pointer',fontSize:13,opacity:0.4,flexShrink:0,padding:0,color:'inherit' }}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    )}
                  </div>
                  {key === 'password' && form.password && strength && (
                    <div style={{ marginTop:8,paddingLeft:2 }}>
                      <div style={{ background: dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)',borderRadius:99,height:3,overflow:'hidden' }}>
                        <div className="str-bar" style={{ width:strength.w,background:strength.color }} />
                      </div>
                      <span style={{ fontSize:11,color:strength.color,fontWeight:600,marginTop:4,display:'block' }}>{strength.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="reg-submit" style={{ marginTop:24, background: loading?'rgba(99,102,241,0.6)':'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', boxShadow: loading?'none':'0 8px 24px rgba(99,102,241,0.35)' }}>
              {loading ? (
                <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ marginTop:24,textAlign:'center',fontSize:14,color: dark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#818cf8',fontWeight:600,textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}