// src/App.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api';

// ─── Tiny helpers ────────────────────────────────
const sanitizeText = (s) => String(s || '').replace(/[<>"'&]/g, c =>
  ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;", '&':'&amp;' }[c]));

function Toast({ msg, type, onHide }) {
  useEffect(() => { if (msg) { const t = setTimeout(onHide, 3500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  const bg = type === 'success' ? '#2A4A3C' : type === 'error' ? '#C0392B' : '#1C1A16';
  return (
    <div style={{position:'fixed',bottom:24,right:24,background:bg,color:'#fff',padding:'12px 22px',borderRadius:10,fontSize:14,zIndex:9999,boxShadow:'0 4px 20px rgba(0,0,0,.2)',maxWidth:340,animation:'slideUp .3s ease'}}>
      {msg}
    </div>
  );
}

// ─── AUTH MODAL ──────────────────────────────────
function AuthModal({ onClose, initialMode = 'signup', onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) return setError('Name is required.');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        await signup(form.name.trim(), form.email.trim(), form.password);
      } else {
        await login(form.email.trim(), form.password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={ov} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <button onClick={onClose} style={closeBtn}>×</button>
        {mode === 'signup' && (
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{display:'inline-block',background:'#E6EFEB',borderRadius:20,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#2A4A3C',letterSpacing:'.05em',marginBottom:12}}>
              ✨ Sign Up — It's Completely Free!
            </div>
            <h2 style={mh}>Create your account</h2>
            <p style={ms}>Start building your professional profile today</p>
          </div>
        )}
        {mode === 'login' && (
          <div style={{textAlign:'center',marginBottom:20}}>
            <h2 style={mh}>Welcome back</h2>
            <p style={ms}>Sign in to continue to ProofCraft</p>
          </div>
        )}
        {error && <div style={errBox}>{error}</div>}
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div style={field}>
              <label style={lbl}>Full Name</label>
              <input style={inp} type="text" value={form.name} onChange={set('name')} placeholder="Omar Hassan" required autoFocus />
            </div>
          )}
          <div style={field}>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="omar@email.com" required autoFocus={mode==='login'} />
          </div>
          <div style={field}>
            <label style={lbl}>Password {mode==='signup'&&<span style={{fontWeight:400,color:'#9C9890'}}>(min. 8 characters)</span>}</label>
            <input style={inp} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} style={sbtn}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Free Account →' : 'Sign In →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'#5C5850'}}>
          {mode==='signup' ? <>Already have an account? <span style={link} onClick={()=>{setMode('login');setError('');}}>Sign in</span></>
           : <>Don't have an account? <span style={link} onClick={()=>{setMode('signup');setError('');}}>Sign up free</span></>}
        </p>
        {mode==='signup' && <p style={{fontSize:11,color:'#9C9890',textAlign:'center',marginTop:10}}>By creating an account you agree to our Terms of Service.</p>}
      </div>
    </div>
  );
}
const ov={position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20};
const modal={background:'#fff',borderRadius:16,padding:32,maxWidth:440,width:'100%',maxHeight:'90vh',overflowY:'auto',position:'relative',boxShadow:'0 20px 60px rgba(0,0,0,.15)'};
const closeBtn={position:'absolute',top:14,right:16,background:'none',border:'none',fontSize:24,cursor:'pointer',color:'#9C9890',lineHeight:1};
const mh={fontFamily:"'Playfair Display',serif",fontSize:26,margin:'0 0 6px',color:'#1C1A16'};
const ms={fontSize:14,color:'#5C5850',margin:0};
const errBox={background:'#FEF2F0',border:'1px solid #FECACA',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#C0392B',marginBottom:14};
const field={marginBottom:14};
const lbl={display:'block',fontSize:13,fontWeight:600,color:'#5C5850',marginBottom:5};
const inp={width:'100%',padding:'10px 13px',border:'1px solid #C8C3B7',borderRadius:8,fontSize:14,color:'#1C1A16',outline:'none',boxSizing:'border-box',fontFamily:'inherit'};
const sbtn={width:'100%',padding:'12px',background:'#2A4A3C',color:'#fff',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:6,fontFamily:'inherit'};
const link={color:'#3D6E5A',cursor:'pointer',fontWeight:600};

// ─── NAV ─────────────────────────────────────────
function Nav({ page, goto, onAuthClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{background:'#fff',borderBottom:'1px solid #DDD9CF',position:'sticky',top:0,zIndex:200,height:60}}>
      <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px',height:60,display:'flex',alignItems:'center',gap:0}}>
        <div onClick={()=>goto('home')} style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:'#2A4A3C',fontWeight:700,cursor:'pointer',marginRight:40,flexShrink:0}}>
          Proof<span style={{color:'#9B7228'}}>Craft</span>
        </div>
        <div style={{display:'flex',gap:0,flex:1}}>
          {['home','cv-builder','case-studies','about','feedback'].map(p => (
            <div key={p} onClick={()=>goto(p)} style={{padding:'0 14px',height:60,display:'flex',alignItems:'center',fontSize:14,fontWeight:page===p?600:400,color:page===p?'#2A4A3C':'#5C5850',cursor:'pointer',borderBottom:`2px solid ${page===p?'#2A4A3C':'transparent'}`,transition:'all .15s',whiteSpace:'nowrap'}}>
              {p==='home'?'Home':p==='cv-builder'?'CV Builder':p==='case-studies'?'Case Studies':p==='about'?'About':'Feedback'}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,marginLeft:'auto'}}>
          {user ? (
            <>
              <span style={{fontSize:13,color:'#5C5850',display:'flex',alignItems:'center'}}>Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={logout} style={{padding:'7px 14px',fontSize:13,border:'1px solid #C8C3B7',borderRadius:8,background:'transparent',color:'#5C5850',cursor:'pointer',fontFamily:'inherit'}}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={()=>onAuthClick('login')} style={{padding:'7px 14px',fontSize:13,border:'1px solid #C8C3B7',borderRadius:8,background:'transparent',color:'#5C5850',cursor:'pointer',fontFamily:'inherit'}}>Sign In</button>
              <button onClick={()=>onAuthClick('signup')} style={{padding:'7px 18px',fontSize:13,background:'#2A4A3C',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Get Started Free</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── HOME PAGE ───────────────────────────────────
function HomePage({ goto, onAuthClick, toast }) {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [content, setContent] = useState({});
  const [stats, setStats] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get('/public/faqs'),
      api.get('/public/testimonials'),
      api.get('/public/content'),
      api.get('/public/stats')
    ]).then(([f, t, c, s]) => {
      if (f.status==='fulfilled') setFaqs(f.value.data);
      if (t.status==='fulfilled') setTestimonials(t.value.data);
      if (c.status==='fulfilled') setContent(c.value.data);
      if (s.status==='fulfilled') setStats(s.value.data);
    });
  }, []);

  const cta = user ? ()=>goto('cv-builder') : ()=>onAuthClick('signup');

  return (
    <div>
      {/* Hero */}
      <section style={{background:'#2A4A3C',color:'#fff',padding:'100px 0 80px',position:'relative',overflow:'hidden'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:20,padding:'5px 14px',fontSize:12,fontWeight:700,color:'rgba(255,255,255,.9)',marginBottom:24,letterSpacing:'.05em'}}>
            ✦ FREE FOR STUDENTS &amp; JOB SEEKERS
          </div>
          <h1 style={{color:'#fff',fontSize:'clamp(28px,5vw,52px)',fontFamily:"'Playfair Display',serif",marginBottom:20,maxWidth:720,lineHeight:1.15}}>
            {content.hero_headline || <>Turn Your Experience Into <em style={{color:'#D4A843',fontStyle:'italic'}}>Proof Recruiters Can Trust</em></>}
          </h1>
          <p style={{color:'rgba(255,255,255,.8)',fontSize:17,maxWidth:560,marginBottom:36,lineHeight:1.7}}>
            {content.hero_sub || 'Build structured case studies that show how you think — and craft a professional CV that gets you interviews. No design skills needed.'}
          </p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <button onClick={cta} style={{padding:'14px 32px',background:'#9B7228',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              Build My CV Free
            </button>
            <button onClick={()=>user?goto('case-studies'):onAuthClick('signup')} style={{padding:'14px 32px',background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,.4)',borderRadius:10,fontSize:16,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              Create Case Study
            </button>
          </div>
          {stats && (
            <div style={{display:'flex',gap:40,marginTop:52,paddingTop:40,borderTop:'1px solid rgba(255,255,255,.15)',flexWrap:'wrap'}}>
              {[
                {num: stats.users > 0 ? stats.users.toLocaleString() : '—', label:'Users Registered'},
                {num: stats.cvs > 0 ? stats.cvs.toLocaleString() : '—', label:'CVs Created'},
                {num: stats.publishedCases > 0 ? stats.publishedCases.toLocaleString() : '—', label:'Case Studies Published'},
                {num:'Free', label:'No Hidden Fees'}
              ].map((s,i)=>(
                <div key={i}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,color:'#fff',fontWeight:700}}>{s.num}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.6)',marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{padding:'80px 0'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:8}}>How It Works</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3.5vw,36px)'}}>From project to proof in minutes</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,position:'relative'}}>
            <div style={{position:'absolute',top:28,left:'12.5%',right:'12.5%',height:1,background:'#DDD9CF'}}></div>
            {[['1','Choose a Template','Pick from Modern, Classic, or Minimal CV templates.'],
              ['2','Fill Your Details','Add experience, skills, and education with our guided editor.'],
              ['3','Customize','Adjust fonts, colors, layout, and sections until it feels right.'],
              ['4','Export & Share','Download as PDF or share via a unique link.']
            ].map(([n,title,desc])=>(
              <div key={n} style={{textAlign:'center',padding:'0 12px',position:'relative',zIndex:1}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:'#2A4A3C',color:'#fff',fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 0 0 6px #F8F6F1'}}>{n}</div>
                <h4 style={{fontSize:14,fontWeight:700,marginBottom:8}}>{title}</h4>
                <p style={{fontSize:13,color:'#5C5850',lineHeight:1.6}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'80px 0',background:'#fff'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:8}}>Features</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3.5vw,36px)'}}>Everything you need to stand out</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            {[
              {icon:'📄',title:'3 Professional Templates',desc:'Modern sidebar, Classic professional, and Minimal elegant — all ATS-friendly.'},
              {icon:'✍️',title:'Rich Text Editor',desc:'Bold, italic, bullet points, hyperlinks — full formatting control for your CV.'},
              {icon:'🎨',title:'Full Customization',desc:'Colors, fonts, sizes, section order. Drag to rearrange. Make it uniquely yours.'},
              {icon:'🧠',title:'Case Study Builder',desc:'A 6-step workflow that surfaces your thinking process — not just what you built.'},
              {icon:'🔗',title:'Shareable Links',desc:'Every CV and case study gets a unique URL you can paste into any application.'},
              {icon:'🆓',title:'Free Forever',desc:'No paywalls or watermarks on the free tier. Professional results at zero cost.'},
            ].map((f,i)=>(
              <div key={i} style={{background:'#F8F6F1',border:'1px solid #DDD9CF',borderRadius:10,padding:24}}>
                <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
                <h4 style={{fontSize:15,fontWeight:700,marginBottom:8}}>{f.title}</h4>
                <p style={{fontSize:13,color:'#5C5850',lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section style={{padding:'80px 0'}}>
          <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:8}}>Success Stories</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3.5vw,36px)'}}>People who got hired with ProofCraft</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
              {testimonials.map((t,i)=>(
                <div key={i} style={{background:'#fff',border:'1px solid #DDD9CF',borderRadius:16,padding:28,position:'relative'}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,color:'#B8D5C8',lineHeight:1,position:'absolute',top:16,left:22,opacity:.5}}>"</div>
                  <p style={{paddingTop:28,fontSize:14,lineHeight:1.75,color:'#5C5850'}}>"<span>{t.quote}</span>"</p>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginTop:20,paddingTop:16,borderTop:'1px solid #DDD9CF'}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'#2A4A3C',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:13,flexShrink:0}}>{t.initials||t.name?.slice(0,2)}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700}}>{t.name}</div>
                      <div style={{fontSize:12,color:'#9C9890'}}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section style={{padding:'80px 0',background:'#fff'}}>
          <div style={{maxWidth:780,margin:'0 auto',padding:'0 24px'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:8}}>FAQ</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3.5vw,36px)'}}>Frequently Asked Questions</h2>
            </div>
            {faqs.map((f,i)=>(
              <div key={f._id||i} style={{borderBottom:'1px solid #DDD9CF'}}>
                <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{padding:'18px 0',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontWeight:600,fontSize:15,color:openFaq===i?'#2A4A3C':'#1C1A16'}}>
                  <span>{f.question}</span>
                  <span style={{fontSize:20,color:'#9C9890',transition:'transform .3s',transform:openFaq===i?'rotate(45deg)':'none'}}>+</span>
                </div>
                {openFaq===i && <div style={{paddingBottom:16}}><p style={{fontSize:14,color:'#5C5850',lineHeight:1.75,margin:0}}>{f.answer}</p></div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{padding:'80px 0'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <div style={{background:'#2A4A3C',borderRadius:24,padding:'60px 48px',textAlign:'center',color:'#fff'}}>
            <h2 style={{color:'#fff',fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,32px)',marginBottom:12}}>
              {content.cta_headline||'Ready to stand out from the crowd?'}
            </h2>
            <p style={{color:'rgba(255,255,255,.75)',marginBottom:32,fontSize:16}}>
              {content.cta_sub||'Join thousands of students and professionals already using ProofCraft.'}
            </p>
            <button onClick={cta} style={{padding:'14px 36px',background:'#9B7228',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              {user?'Go to CV Builder':'Create Free Account →'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#1C1A16',color:'rgba(255,255,255,.6)',padding:'60px 0 32px'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:32,marginBottom:40}}>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:'#fff',marginBottom:12}}>Proof<span style={{color:'#D4A843'}}>Craft</span></div>
              <p style={{fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.7}}>{content.footer_tagline||'Turn your experience into proof recruiters can trust.'}</p>
            </div>
            <div><h4 style={{color:'#fff',fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14}}>Product</h4>
              {['CV Builder','Case Studies','Templates'].map(l=><div key={l} onClick={()=>goto(l==='CV Builder'?'cv-builder':'case-studies')} style={{fontSize:13,color:'rgba(255,255,255,.45)',marginBottom:8,cursor:'pointer'}}>{l}</div>)}
            </div>
            <div><h4 style={{color:'#fff',fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14}}>Company</h4>
              {['About Us','Feedback'].map(l=><div key={l} onClick={()=>goto(l==='About Us'?'about':'feedback')} style={{fontSize:13,color:'rgba(255,255,255,.45)',marginBottom:8,cursor:'pointer'}}>{l}</div>)}
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:20,display:'flex',justifyContent:'space-between',fontSize:12,flexWrap:'wrap',gap:8}}>
            <span>© 2025 ProofCraft. All rights reserved.</span>
            <span>proofcraft.online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── FEEDBACK PAGE ───────────────────────────────
function FeedbackPage({ toast }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', email: user?.email||'', subject: '', message: '', rating: 5 });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/feedback', form);
      setDone(true);
      toast('Feedback sent! Thank you 🙏', 'success');
    } catch(err) {
      toast(err.response?.data?.error||'Failed to send. Please try again.', 'error');
    } finally { setSending(false); }
  };

  return (
    <div>
      <div style={{background:'#2A4A3C',color:'#fff',padding:'60px 0'}}>
        <div style={{maxWidth:780,margin:'0 auto',padding:'0 24px'}}>
          <p style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>Feedback</p>
          <h1 style={{color:'#fff',fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,4vw,42px)',marginBottom:10}}>Share Your Feedback</h1>
          <p style={{color:'rgba(255,255,255,.75)',fontSize:16}}>Help us improve ProofCraft. We read every message.</p>
        </div>
      </div>
      <div style={{maxWidth:640,margin:'0 auto',padding:'48px 24px'}}>
        {done ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:10}}>Thank you for your feedback!</h2>
            <p style={{color:'#5C5850'}}>We've received your message and will get back to you if needed.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{background:'#fff',border:'1px solid #DDD9CF',borderRadius:12,padding:32}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <div><label style={lbl}>Your Name *</label><input style={inp} type="text" value={form.name} onChange={set('name')} placeholder="Omar Hassan" required /></div>
              <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="omar@email.com" required /></div>
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>Subject *</label><input style={inp} type="text" value={form.subject} onChange={set('subject')} placeholder="e.g. Feature request / Bug report" required /></div>
            <div style={{marginBottom:14}}>
              <label style={lbl}>Rating</label>
              <div style={{display:'flex',gap:8}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} type="button" onClick={()=>setForm(p=>({...p,rating:n}))} style={{width:40,height:40,borderRadius:'50%',border:`2px solid ${form.rating>=n?'#2A4A3C':'#DDD9CF'}`,background:form.rating>=n?'#E6EFEB':'#fff',fontSize:16,cursor:'pointer',transition:'all .15s'}}>{'⭐'}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}><label style={lbl}>Message *</label><textarea style={{...inp,minHeight:120,resize:'vertical'}} value={form.message} onChange={set('message')} placeholder="Tell us what you think, what's missing, or how we can improve…" required maxLength={2000} /><p style={{fontSize:11,color:'#9C9890',marginTop:4}}>{form.message.length}/2000</p></div>
            <button type="submit" disabled={sending} style={{...sbtn,marginTop:0}}>{sending?'Sending…':'Send Feedback →'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────
function AboutPage({ goto, onAuthClick }) {
  const { user } = useAuth();
  const [content, setContent] = useState({});
  useEffect(() => { api.get('/public/content').then(r=>setContent(r.data)).catch(()=>{}); }, []);

  return (
    <div>
      <div style={{background:'#2A4A3C',color:'#fff',padding:'80px 0 60px'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>
          <p style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>About ProofCraft</p>
          <h1 style={{color:'#fff',fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,4vw,48px)',maxWidth:680,marginBottom:16}}>{content.about_headline||'We believe every professional deserves a fair shot'}</h1>
          <p style={{color:'rgba(255,255,255,.75)',fontSize:17,maxWidth:560}}>{content.about_sub||'ProofCraft was built because talented people were being overlooked — not because they lacked skill, but because they lacked the tools to show it.'}</p>
        </div>
      </div>
      <section style={{padding:'80px 0'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:12}}>Our Story</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,32px)',marginBottom:20}}>{content.story_title||'Born from frustration, built with purpose'}</h2>
            <p style={{color:'#5C5850',lineHeight:1.75,marginBottom:16}}>{content.story_p1||'The idea started when our founder struggled to explain their thinking during job applications. They had built real projects, solved real problems — but a two-page CV couldn\'t capture any of that. So they built the tool they wished existed.'}</p>
            <p style={{color:'#5C5850',lineHeight:1.75}}>{content.story_p2||'We believe the gap between skills and proof of skills is one of the most solvable problems in hiring — and we\'re solving it, one case study at a time.'}</p>
          </div>
          <div style={{background:'#E6EFEB',borderRadius:16,aspectRatio:'4/3',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #B8D5C8',overflow:'hidden'}}>
            {content.about_photo ? <img src={content.about_photo} alt="Team" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{textAlign:'center',color:'#9C9890',padding:24}}>
              <div style={{fontSize:40,marginBottom:8}}>🏗️</div>
              <p style={{fontSize:13}}>Photo managed from Admin panel</p>
            </div>}
          </div>
        </div>
      </section>
      <section style={{padding:'80px 0',background:'#fff'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:40}}>Our Values</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:24}}>
            {[['🎯','Clarity First','We strip away ambiguity. Structure creates clarity — for candidates and recruiters alike.'],
              ['⚖️','Equal Access','Professional tools shouldn\'t cost money. ProofCraft is free because opportunity should be universal.'],
              ['💡','Show the Thinking','Outputs are easy to fake. Thinking is hard to fake. We help make your real reasoning visible.']
            ].map(([icon,title,desc])=>(
              <div key={title} style={{background:'#F8F6F1',borderRadius:10,padding:28,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>{icon}</div>
                <h4 style={{fontSize:16,fontWeight:700,marginBottom:10}}>{title}</h4>
                <p style={{fontSize:13,color:'#5C5850',lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'60px 0'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <div style={{background:'#2A4A3C',borderRadius:20,padding:'50px 40px',color:'#fff'}}>
            <h2 style={{color:'#fff',fontFamily:"'Playfair Display',serif",marginBottom:12}}>Ready to get started?</h2>
            <p style={{color:'rgba(255,255,255,.75)',marginBottom:28}}>It takes less than 5 minutes to create your first case study or CV.</p>
            <button onClick={user?()=>goto('cv-builder'):()=>onAuthClick('signup')} style={{padding:'14px 36px',background:'#9B7228',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{user?'Go to CV Builder':'Create Free Account →'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── CV BUILDER (connected) ───────────────────────
function CVBuilderPage({ toast, onAuthClick }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [cvId, setCvId] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [color, setColor] = useState('#2A4A3C');
  const [font, setFont] = useState('Playfair Display');
  const [size, setSize] = useState('md');
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState('personal');
  const [form, setForm] = useState({fname:'',lname:'',title:'',email:'',phone:'',location:'',linkedin:'',website:'',summary:'',skillsTech:'',skillsSoft:'',langs:'',certs:''});
  const [exps, setExps] = useState([]);
  const [edus, setEdus] = useState([]);
  const previewRef = useRef(null);

  const setF = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const saveCV = async () => {
    if (!user) { onAuthClick('signup'); return; }
    setSaving(true);
    try {
      const payload = { title: `${form.fname} ${form.lname} — CV`.trim()||'My CV', template, color, font, data: { form, exps, edus } };
      if (cvId) { await api.put(`/cv/${cvId}`, payload); }
      else { const r = await api.post('/cv', payload); setCvId(r.data._id); }
      toast('CV saved successfully!', 'success');
    } catch { toast('Failed to save. Please try again.', 'error'); }
    setSaving(false);
  };

  const share = async () => {
    if (!user) { onAuthClick('signup'); return; }
    if (!cvId) { toast('Save your CV first.', 'error'); return; }
    try {
      const r = await api.post(`/cv/${cvId}/share`);
      navigator.clipboard?.writeText(r.data.url);
      toast('Share link copied!', 'success');
    } catch { toast('Failed to generate share link.', 'error'); }
  };

  const name = `${form.fname} ${form.lname}`.trim() || 'Your Name';
  const contacts = [form.email,form.phone,form.location].filter(Boolean);
  const sz = {sm:.87,md:1,lg:1.1}[size];
  const allSkills = [...(form.skillsTech?.split(',').map(s=>s.trim()).filter(Boolean)||[]),...(form.skillsSoft?.split(',').map(s=>s.trim()).filter(Boolean)||[])];

  const expHtml = exps.map(e=>`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between"><span style="font-size:${14*sz}px;font-weight:600">${sanitizeText(e.role)}</span><span style="font-size:${11*sz}px;color:#9C9890">${sanitizeText(e.start)}${e.end?' – '+sanitizeText(e.end):''}</span></div><div style="font-size:${12*sz}px;color:${color};font-weight:600;margin-bottom:3px">${sanitizeText(e.company)}</div><div style="font-size:${12*sz}px;color:#5C5850;line-height:1.6">${e.desc||''}</div></div>`).join('') || '<p style="font-size:12px;color:#9C9890">Add experience from the Content tab</p>';
  const eduHtml = edus.map(e=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span style="font-size:${13*sz}px;font-weight:600">${sanitizeText(e.degree)}</span><span style="font-size:${11*sz}px;color:#9C9890">${sanitizeText(e.year)}</span></div><div style="font-size:${12*sz}px;color:#5C5850">${sanitizeText(e.school)}</div></div>`).join('') || '<p style="font-size:12px;color:#9C9890">Add education from the Content tab</p>';

  const previewHtml = template === 'modern' ? `
    <div style="font-family:'Lato',sans-serif;font-size:${13*sz}px">
      <div style="background:${color};color:#fff;padding:28px 32px">
        <div style="font-family:'${font}',serif;font-size:${30*sz}px;font-weight:700;margin-bottom:3px">${sanitizeText(name)}</div>
        <div style="opacity:.8;font-size:${13*sz}px;margin-bottom:10px">${sanitizeText(form.title||'Your Title')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px 20px;font-size:${11*sz}px;opacity:.7">${contacts.map(c=>`<span>${sanitizeText(c)}</span>`).join('')}</div>
      </div>
      <div style="display:grid;grid-template-columns:190px 1fr">
        <div style="background:#F2EFE8;padding:20px 16px">
          ${allSkills.length?`<div style="margin-bottom:16px"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color};border-bottom:1px solid ${color};padding-bottom:4px;margin-bottom:8px">Skills</div>${allSkills.slice(0,8).map((s,i)=>`<div style="margin-bottom:5px"><div style="font-size:${11*sz}px;margin-bottom:2px">${sanitizeText(s)}</div><div style="height:3px;background:#E2DDD6;border-radius:2px"><div style="height:3px;background:${color};border-radius:2px;width:${Math.max(50,95-i*7)}%"></div></div></div>`).join('')}</div>`:''}
          ${form.langs?`<div style="margin-bottom:16px"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color};border-bottom:1px solid ${color};padding-bottom:4px;margin-bottom:8px">Languages</div><div style="font-size:11px;color:#5C5850">${sanitizeText(form.langs)}</div></div>`:''}
        </div>
        <div style="padding:20px 24px">
          ${form.summary?`<div style="margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin-bottom:10px">Summary</div><div style="font-size:${12.5*sz}px;color:#5C5850;line-height:1.6">${sanitizeText(form.summary)}</div></div>`:''}
          <div style="margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin-bottom:10px">Experience</div>${expHtml}</div>
          <div style="margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin-bottom:10px">Education</div>${eduHtml}</div>
        </div>
      </div>
    </div>` :
  template === 'classic' ? `
    <div style="font-family:'Lato',sans-serif;padding:36px 40px;font-size:${13*sz}px">
      <div style="font-family:'${font}',serif;font-size:${32*sz}px;font-weight:700;margin-bottom:3px">${sanitizeText(name)}</div>
      <div style="font-size:${13.5*sz}px;color:#5C5850;margin-bottom:10px">${sanitizeText(form.title||'Your Title')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px 14px;font-size:${11.5*sz}px;color:#5C5850;padding-bottom:12px;border-bottom:2px solid #1C1A16;margin-bottom:20px">${contacts.join(' · ')}</div>
      ${form.summary?`<div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #DDD9CF;padding-bottom:5px;margin-bottom:10px">Summary</div><p style="font-size:${13*sz}px;color:#5C5850;line-height:1.7">${sanitizeText(form.summary)}</p></div>`:''}
      <div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #DDD9CF;padding-bottom:5px;margin-bottom:10px">Experience</div>${expHtml}</div>
      <div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #DDD9CF;padding-bottom:5px;margin-bottom:10px">Education</div>${eduHtml}</div>
      ${allSkills.length?`<div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #DDD9CF;padding-bottom:5px;margin-bottom:10px">Skills</div><div style="display:flex;flex-wrap:wrap;gap:6px">${allSkills.map(s=>`<span style="background:#F2EFE8;border-radius:4px;padding:3px 10px;font-size:${11.5*sz}px">${sanitizeText(s)}</span>`).join('')}</div></div>`:''}
    </div>` :
  `<div style="font-family:'Lato',sans-serif;padding:36px 40px;font-size:${13*sz}px">
    <div style="font-size:${20*sz}px;font-weight:300;letter-spacing:5px;text-transform:uppercase;margin-bottom:4px">${sanitizeText(name).toUpperCase()}</div>
    <div style="font-size:${10*sz}px;letter-spacing:2.5px;text-transform:uppercase;color:#9C9890;margin-bottom:10px">${sanitizeText(form.title||'Your Title').toUpperCase()}</div>
    <div style="font-size:${11*sz}px;color:#9C9890;margin-bottom:24px">${contacts.map(sanitizeText).join(' · ')}</div>
    <div style="height:.5px;background:#DDD9CF;margin-bottom:24px"></div>
    ${form.summary?`<div style="margin-bottom:20px"><div style="font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#9C9890;margin-bottom:10px">Profile</div><p style="font-size:${12.5*sz}px;color:#5C5850;line-height:1.7">${sanitizeText(form.summary)}</p></div>`:''}
    <div style="margin-bottom:20px"><div style="font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#9C9890;margin-bottom:10px">Experience</div>${expHtml}</div>
    <div style="margin-bottom:20px"><div style="font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#9C9890;margin-bottom:10px">Education</div>${eduHtml}</div>
    ${allSkills.length?`<div style="margin-bottom:20px"><div style="font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#9C9890;margin-bottom:10px">Skills</div><div style="display:flex;flex-wrap:wrap;gap:8px">${allSkills.map(s=>`<span style="font-size:${12*sz}px;color:#5C5850">— ${sanitizeText(s)}</span>`).join('')}</div></div>`:''}
  </div>`;

  const sidebarStyle = {background:'#fff',borderRight:'1px solid #DDD9CF',width:320,flexShrink:0,overflow:'auto',maxHeight:'calc(100vh - 60px)',position:'sticky',top:60};
  const tabStyle = (active) => ({padding:'10px 8px',flex:1,textAlign:'center',fontSize:12,fontWeight:600,color:active?'#2A4A3C':'#9C9890',cursor:'pointer',borderBottom:`2px solid ${active?'#2A4A3C':'transparent'}`,transition:'all .15s'});
  const colors = ['#2A4A3C','#1E3A5F','#4A1942','#7B2D00','#1A3A4A','#2D2D2D','#5C4033','#3D2B1F'];
  const fonts = ['Playfair Display','Merriweather','Raleway','Source Serif 4','Libre Baskerville'];

  return (
    <div style={{display:'flex',minHeight:'calc(100vh - 60px)'}}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{display:'flex',borderBottom:'1px solid #DDD9CF',background:'#fff',position:'sticky',top:0,zIndex:10}}>
          {['content','design','template'].map(t=>(
            <div key={t} style={tabStyle(activeTab===t)} onClick={()=>setActiveTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
          ))}
        </div>
        <div style={{padding:18}}>
          {activeTab==='content' && <>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
              {['personal','summary','experience','education','skills'].map(s=>(
                <button key={s} onClick={()=>setActiveSection(s)} style={{padding:'5px 10px',fontSize:12,border:`1px solid ${activeSection===s?'#2A4A3C':'#DDD9CF'}`,borderRadius:20,background:activeSection===s?'#E6EFEB':'transparent',color:activeSection===s?'#2A4A3C':'#5C5850',cursor:'pointer',fontFamily:'inherit',fontWeight:activeSection===s?600:400}}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            {activeSection==='personal' && <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={lbl}>First Name</label><input style={inp} value={form.fname} onChange={setF('fname')} placeholder="Omar" /></div>
                <div><label style={lbl}>Last Name</label><input style={inp} value={form.lname} onChange={setF('lname')} placeholder="Hassan" /></div>
              </div>
              <div style={{marginBottom:10}}><label style={lbl}>Title</label><input style={inp} value={form.title} onChange={setF('title')} placeholder="Product Manager" /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={setF('email')} placeholder="omar@email.com" /></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={setF('phone')} placeholder="+20 100…" /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={lbl}>Location</label><input style={inp} value={form.location} onChange={setF('location')} placeholder="Cairo, Egypt" /></div>
                <div><label style={lbl}>LinkedIn</label><input style={inp} value={form.linkedin} onChange={setF('linkedin')} placeholder="linkedin.com/in/…" /></div>
              </div>
            </>}
            {activeSection==='summary' && <div><label style={lbl}>Professional Summary</label><textarea style={{...inp,minHeight:100,resize:'vertical'}} value={form.summary} onChange={setF('summary')} placeholder="2–3 sentence overview of your background and value…" /></div>}
            {activeSection==='experience' && <>
              {exps.map((e,i)=>(
                <div key={i} style={{background:'#F8F6F1',border:'1px solid #DDD9CF',borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:13,fontWeight:700}}>{e.role||'New Experience'}</span><button onClick={()=>setExps(p=>p.filter((_,j)=>j!==i))} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#9C9890'}}>×</button></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={lbl}>Role</label><input style={inp} value={e.role} onChange={ev=>setExps(p=>p.map((x,j)=>j===i?{...x,role:ev.target.value}:x))} placeholder="Product Manager" /></div>
                    <div><label style={lbl}>Company</label><input style={inp} value={e.company} onChange={ev=>setExps(p=>p.map((x,j)=>j===i?{...x,company:ev.target.value}:x))} placeholder="Acme Corp" /></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={lbl}>Start</label><input style={inp} value={e.start} onChange={ev=>setExps(p=>p.map((x,j)=>j===i?{...x,start:ev.target.value}:x))} placeholder="Jan 2022" /></div>
                    <div><label style={lbl}>End</label><input style={inp} value={e.end} onChange={ev=>setExps(p=>p.map((x,j)=>j===i?{...x,end:ev.target.value}:x))} placeholder="Present" /></div>
                  </div>
                  <div><label style={lbl}>Description</label><textarea style={{...inp,minHeight:70,resize:'vertical'}} value={e.desc} onChange={ev=>setExps(p=>p.map((x,j)=>j===i?{...x,desc:ev.target.value}:x))} placeholder="Key achievements and responsibilities…" /></div>
                </div>
              ))}
              <button onClick={()=>setExps(p=>[...p,{role:'',company:'',start:'',end:'',desc:''}])} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,width:'100%',padding:'9px',border:'1.5px dashed #C8C3B7',borderRadius:8,background:'transparent',color:'#9C9890',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Add Experience</button>
            </>}
            {activeSection==='education' && <>
              {edus.map((e,i)=>(
                <div key={i} style={{background:'#F8F6F1',border:'1px solid #DDD9CF',borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:13,fontWeight:700}}>{e.degree||'New Education'}</span><button onClick={()=>setEdus(p=>p.filter((_,j)=>j!==i))} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#9C9890'}}>×</button></div>
                  <div style={{marginBottom:8}}><label style={lbl}>Degree</label><input style={inp} value={e.degree} onChange={ev=>setEdus(p=>p.map((x,j)=>j===i?{...x,degree:ev.target.value}:x))} placeholder="BSc Computer Science" /></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div><label style={lbl}>School</label><input style={inp} value={e.school} onChange={ev=>setEdus(p=>p.map((x,j)=>j===i?{...x,school:ev.target.value}:x))} placeholder="Cairo University" /></div>
                    <div><label style={lbl}>Year</label><input style={inp} value={e.year} onChange={ev=>setEdus(p=>p.map((x,j)=>j===i?{...x,year:ev.target.value}:x))} placeholder="2022" /></div>
                  </div>
                </div>
              ))}
              <button onClick={()=>setEdus(p=>[...p,{degree:'',school:'',year:''}])} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,width:'100%',padding:'9px',border:'1.5px dashed #C8C3B7',borderRadius:8,background:'transparent',color:'#9C9890',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Add Education</button>
            </>}
            {activeSection==='skills' && <>
              <div style={{marginBottom:12}}><label style={lbl}>Technical Skills</label><input style={inp} value={form.skillsTech} onChange={setF('skillsTech')} placeholder="SQL, Python, Figma, Jira…" /><p style={{fontSize:11,color:'#9C9890',marginTop:4}}>Comma-separated</p></div>
              <div style={{marginBottom:12}}><label style={lbl}>Soft Skills</label><input style={inp} value={form.skillsSoft} onChange={setF('skillsSoft')} placeholder="Leadership, Communication…" /></div>
              <div style={{marginBottom:12}}><label style={lbl}>Languages</label><input style={inp} value={form.langs} onChange={setF('langs')} placeholder="Arabic (Native), English (Fluent)" /></div>
              <div><label style={lbl}>Certifications</label><textarea style={{...inp,minHeight:70,resize:'vertical'}} value={form.certs} onChange={setF('certs')} placeholder="Google PM Certificate 2024…" /></div>
            </>}
          </>}

          {activeTab==='design' && <>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#9C9890',marginBottom:10}}>Accent Color</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {colors.map(c=>(
                  <div key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${color===c?'#1C1A16':'transparent'}`,transition:'all .15s'}} title={c}></div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#9C9890',marginBottom:10}}>Heading Font</div>
              {fonts.map(f=>(
                <div key={f} onClick={()=>setFont(f)} style={{padding:'9px 12px',border:`1px solid ${font===f?'#2A4A3C':'#DDD9CF'}`,borderRadius:8,cursor:'pointer',marginBottom:6,background:font===f?'#E6EFEB':'transparent',transition:'all .15s'}}>
                  <div style={{fontFamily:`'${f}',serif`,fontSize:15,fontWeight:600,color:font===f?'#2A4A3C':'#1C1A16'}}>{f}</div>
                  <div style={{fontFamily:`'${f}',serif`,fontSize:12,color:'#9C9890',marginTop:2}}>Sample text in this font</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#9C9890',marginBottom:10}}>Text Size</div>
              <div style={{display:'flex',gap:8}}>
                {['sm','md','lg'].map(s=>(
                  <div key={s} onClick={()=>setSize(s)} style={{flex:1,padding:'8px',textAlign:'center',border:`1px solid ${size===s?'#2A4A3C':'#DDD9CF'}`,borderRadius:8,cursor:'pointer',background:size===s?'#E6EFEB':'transparent',color:size===s?'#2A4A3C':'#5C5850',fontWeight:size===s?700:400,fontSize:13,transition:'all .15s'}}>{s.toUpperCase()}</div>
                ))}
              </div>
            </div>
          </>}

          {activeTab==='template' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {[['modern','Modern','Sidebar'],['classic','Classic','Traditional'],['minimal','Minimal','Clean']].map(([id,name,sub])=>(
                <div key={id} onClick={()=>setTemplate(id)} style={{border:`2px solid ${template===id?'#2A4A3C':'#DDD9CF'}`,borderRadius:10,overflow:'hidden',cursor:'pointer',transition:'all .15s'}}>
                  <div style={{height:100,background:id==='modern'?color:'#fff',display:'flex',alignItems:'flex-start',justifyContent:'flex-start',padding:'8px',overflow:'hidden'}}>
                    <div style={{fontSize:id==='modern'?9:8,fontFamily:`'Playfair Display',serif`,color:id==='modern'?'#fff':'#1C1A16',fontWeight:600,lineHeight:1.3}}>Your<br/>Name<br/><span style={{fontSize:7,fontWeight:400,opacity:.7,fontFamily:'Lato,sans-serif'}}>{sub}</span></div>
                    {template===id && <div style={{marginLeft:'auto',background:'#2A4A3C',color:'#fff',borderRadius:20,padding:'2px 6px',fontSize:9,fontWeight:700}}>✓</div>}
                  </div>
                  <div style={{padding:'7px 9px',borderTop:'1px solid #DDD9CF',background:'#fff'}}>
                    <div style={{fontSize:11,fontWeight:600}}>{name}</div>
                    <div style={{fontSize:10,color:'#9C9890'}}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div style={{flex:1,padding:24,background:'#F2EFE8',overflow:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:600}}>Live Preview</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={saveCV} disabled={saving} style={{padding:'8px 18px',fontSize:13,background:saving?'#9C9890':'#2A4A3C',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>{saving?'Saving…':'Save CV'}</button>
            <button onClick={share} style={{padding:'8px 18px',fontSize:13,background:'#9B7228',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Share Link</button>
          </div>
        </div>
        <div style={{background:'#fff',boxShadow:'0 8px 32px rgba(0,0,0,.1)',minHeight:700,borderRadius:4}}>
          <div dangerouslySetInnerHTML={{__html: previewHtml}} ref={previewRef} />
        </div>
      </div>
    </div>
  );
}

// ─── CASE STUDIES ────────────────────────────────
function CaseStudiesPage({ toast, onAuthClick }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [view, setView] = useState('list'); // list | builder | published
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [published, setPublished] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) api.get('/casestudies').then(r=>setItems(r.data)).catch(()=>{});
  }, [user]);

  const steps = [
    {label:'Project Info', fields:[{k:'title',l:'Project Title *',ph:'e.g. Workshop Portal'},{k:'desc',l:'Description',ph:'One or two sentences…',multi:true},{k:'cat',l:'Category',sel:['Product Management','Software Development','UX Design','Data Analysis','Other']},{k:'link',l:'Live Link',ph:'https://…'}]},
    {label:'Problem', fields:[{k:'problem',l:'What problem are you solving? *',ph:'Describe clearly…',multi:true},{k:'users',l:'Target users *',ph:'e.g. Small business owners'},{k:'why',l:'Why does this matter?',ph:'Impact of leaving it unsolved…',multi:true}]},
    {label:'Solution', fields:[{k:'solution',l:'Your solution *',ph:'What did you build?',multi:true},{k:'features',l:'Key features',ph:'Main components…',multi:true}]},
    {label:'Decisions', fields:[{k:'decisions',l:'Key decisions *',ph:'Most critical choices and why…',multi:true},{k:'alts',l:'Alternatives considered',ph:'Other approaches evaluated…',multi:true},{k:'tradeoffs',l:'Trade-offs',ph:'What did you compromise on?',multi:true}]},
    {label:'Challenges', fields:[{k:'challenges',l:'Main challenges',ph:'Obstacles you faced…',multi:true},{k:'overcome',l:'How you overcame them',ph:'Solutions to the challenges…',multi:true}]},
    {label:'Results', fields:[{k:'results',l:'Outcomes & impact *',ph:'What changed after building this?',multi:true},{k:'metrics',l:'Metrics',ph:'e.g. 40% reduction in time'},{k:'github',l:'GitHub / Demo link',ph:'https://github.com/…'}]}
  ];

  const publish = async () => {
    if (!user) { onAuthClick('signup'); return; }
    if (!data.title) { toast('Please add a project title','error'); return; }
    setSaving(true);
    try {
      const r = await api.post('/casestudies', { title: data.title, category: data.cat, status: 'draft', data });
      const p = await api.post(`/casestudies/${r.data._id}/publish`);
      setItems(prev=>[...prev, p.data.cs]);
      setPublished({ ...data, shareUrl: p.data.url });
      setView('published');
      toast('Case study published!','success');
    } catch { toast('Failed to publish. Please try again.','error'); }
    setSaving(false);
  };

  const fStyle = {background:'#F8F6F1',border:'1px solid #DDD9CF',borderRadius:10,padding:'12px 14px',cursor:'pointer',transition:'all .15s',marginBottom:10};

  if (!user) return (
    <div style={{maxWidth:600,margin:'60px auto',padding:'0 24px',textAlign:'center'}}>
      <div style={{width:72,height:72,background:'#E6EFEB',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>📝</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:10}}>Sign up to create case studies</h2>
      <p style={{color:'#5C5850',marginBottom:24}}>Case studies turn invisible skills into visible proof. Show recruiters how you think, not just what you built.</p>
      <button onClick={()=>onAuthClick('signup')} style={{...sbtn,width:'auto',padding:'12px 32px'}}>Sign Up Free →</button>
    </div>
  );

  return (
    <div style={{display:'flex',minHeight:'calc(100vh - 60px)'}}>
      <div style={{width:260,background:'#fff',borderRight:'1px solid #DDD9CF',padding:18,overflow:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h4 style={{fontSize:14}}>My Case Studies</h4>
          <button onClick={()=>{setData({});setStep(0);setView('builder');}} style={{padding:'4px 10px',fontSize:12,background:'#2A4A3C',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>+ New</button>
        </div>
        {items.length===0?<p style={{fontSize:13,color:'#9C9890',textAlign:'center',marginTop:24}}>No case studies yet</p>:
        items.map((cs,i)=>(
          <div key={i} onClick={()=>{setPublished(cs.data);setView('published');}} style={{...fStyle,border:`1px solid ${view==='published'&&published===cs.data?'#2A4A3C':'#DDD9CF'}`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{cs.title||'Untitled'}</div>
            <div style={{fontSize:11,color:'#9C9890'}}>{cs.category||''} · <span style={{color:cs.status==='published'?'#2A4A3C':'#9C9890',fontWeight:600}}>{cs.status}</span></div>
          </div>
        ))}
      </div>
      <div style={{flex:1,padding:28,overflow:'auto'}}>
        {view==='list' && (
          <div style={{maxWidth:560,margin:'60px auto',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🧠</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:10}}>Document your thinking</h2>
            <p style={{color:'#5C5850',marginBottom:24}}>Show recruiters how you approach problems, not just what you built.</p>
            <button onClick={()=>{setData({});setStep(0);setView('builder');}} style={{...sbtn,width:'auto',padding:'12px 32px'}}>Create My First Case Study</button>
          </div>
        )}
        {view==='builder' && (
          <div style={{maxWidth:680}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:'#5C5850',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>← Back</button>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setView('list')} style={{padding:'7px 14px',fontSize:13,border:'1px solid #DDD9CF',borderRadius:8,background:'transparent',cursor:'pointer',fontFamily:'inherit',color:'#5C5850'}}>Save Draft</button>
                <button onClick={publish} disabled={saving} style={{padding:'7px 14px',fontSize:13,background:'#2A4A3C',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>{saving?'Publishing…':'Publish →'}</button>
              </div>
            </div>
            {/* Step indicator */}
            <div style={{display:'flex',alignItems:'center',marginBottom:24,overflowX:'auto'}}>
              {steps.map((s,i)=>(
                <React.Fragment key={i}>
                  {i>0&&<div style={{flex:1,minWidth:16,height:1,background:i<=step?'#2A4A3C':'#DDD9CF'}}></div>}
                  <div onClick={()=>setStep(i)} style={{width:32,height:32,borderRadius:'50%',border:`2px solid ${i<step?'#2A4A3C':i===step?'#2A4A3C':'#DDD9CF'}`,background:i<step?'#2A4A3C':i===step?'transparent':'transparent',color:i<step?'#fff':i===step?'#2A4A3C':'#9C9890',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0,transition:'all .15s'}}>{i<step?'✓':i+1}</div>
                </React.Fragment>
              ))}
            </div>
            <div style={{background:'#fff',border:'1px solid #DDD9CF',borderRadius:12,padding:28}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",marginBottom:20}}>Step {step+1} — {steps[step].label}</h3>
              {steps[step].fields.map(f=>(
                <div key={f.k} style={{marginBottom:14}}>
                  <label style={lbl}>{f.l}</label>
                  {f.sel ? <select style={inp} value={data[f.k]||''} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))}>{f.sel.map(o=><option key={o}>{o}</option>)}</select>
                  : f.multi ? <textarea style={{...inp,minHeight:90,resize:'vertical'}} value={data[f.k]||''} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} />
                  : <input style={inp} type="text" value={data[f.k]||''} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} />}
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
              {step>0?<button onClick={()=>setStep(s=>s-1)} style={{padding:'9px 18px',fontSize:13,border:'1px solid #DDD9CF',borderRadius:8,background:'transparent',cursor:'pointer',fontFamily:'inherit',color:'#5C5850'}}>← Back</button>:<div/>}
              {step<steps.length-1?<button onClick={()=>setStep(s=>s+1)} style={{...sbtn,padding:'9px 22px',marginTop:0,width:'auto'}}>Next →</button>
              :<button onClick={publish} disabled={saving} style={{...sbtn,padding:'9px 22px',marginTop:0,width:'auto',background:'#9B7228'}}>{saving?'Publishing…':'Publish Case Study →'}</button>}
            </div>
          </div>
        )}
        {view==='published' && published && (
          <div style={{maxWidth:700}}>
            <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:'#5C5850',cursor:'pointer',fontSize:14,fontFamily:'inherit',marginBottom:24}}>← All Case Studies</button>
            <div style={{background:'#fff',border:'1px solid #DDD9CF',borderRadius:12,padding:36}}>
              <span style={{display:'inline-block',background:'#E6EFEB',color:'#2A4A3C',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700,marginBottom:14}}>{published.cat||'Project'}</span>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,marginBottom:10,marginTop:8}}>{published.title||published['cs-title']}</h1>
              {published.desc||published['cs-desc']?<p style={{fontSize:16,color:'#5C5850',marginBottom:20}}>{published.desc||published['cs-desc']}</p>:null}
              <hr style={{border:'none',borderTop:'1px solid #DDD9CF',margin:'20px 0'}} />
              {[['problem','The Problem'],['users','Target Users'],['why','Why It Matters'],['solution','Solution'],['features','Key Features'],['decisions','Key Decisions'],['alts','Alternatives'],['tradeoffs','Trade-offs'],['challenges','Challenges'],['overcome','How I Solved Them'],['results','Results & Impact'],['metrics','Metrics']].filter(([k])=>published[k]).map(([k,label])=>(
                <div key={k} style={{marginBottom:22}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#9C9890',marginBottom:7}}>{label}</div>
                  <div style={{fontSize:15,lineHeight:1.75}}>{published[k]}</div>
                </div>
              ))}
              {published.shareUrl&&<div style={{background:'#E6EFEB',border:'1px solid #B8D5C8',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginTop:20}}>
                <span style={{fontFamily:'monospace',fontSize:13,color:'#2A4A3C',flex:1}}>{published.shareUrl}</span>
                <button onClick={()=>{navigator.clipboard?.writeText(published.shareUrl);toast('Copied!','success');}} style={{padding:'6px 12px',fontSize:12,background:'#2A4A3C',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Copy</button>
              </div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────
function AppInner() {
  const [page, setPage] = useState('home');
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'signup'
  const [toast, setToast] = useState({ msg: '', type: '' });
  const { user, loading } = useAuth();

  const goto = useCallback((p) => { setPage(p); window.scrollTo(0,0); }, []);
  const showToast = useCallback((msg, type='') => setToast({ msg, type }), []);
  const openAuth = useCallback((mode='signup') => setAuthModal(mode), []);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontFamily:"'Playfair Display',serif",fontSize:18,color:'#2A4A3C'}}>Loading…</div>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,400;0,700&family=Raleway:wght@300;400;500;600;700&family=Source+Serif+4:wght@300;400;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Lato',sans-serif;background:#F8F6F1}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
      <Nav page={page} goto={goto} onAuthClick={openAuth} />
      {page==='home' && <HomePage goto={goto} onAuthClick={openAuth} toast={showToast} />}
      {page==='cv-builder' && <CVBuilderPage toast={showToast} onAuthClick={openAuth} />}
      {page==='case-studies' && <CaseStudiesPage toast={showToast} onAuthClick={openAuth} />}
      {page==='about' && <AboutPage goto={goto} onAuthClick={openAuth} />}
      {page==='feedback' && <FeedbackPage toast={showToast} />}
      {authModal && <AuthModal initialMode={authModal} onClose={()=>setAuthModal(null)} onSuccess={()=>showToast('Welcome to ProofCraft! 🎉','success')} />}
      <Toast msg={toast.msg} type={toast.type} onHide={()=>setToast({msg:'',type:''})} />
    </>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
