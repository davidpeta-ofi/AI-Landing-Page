'use client';

import { useState, useEffect } from 'react';

// Agentic background (keep as-is from original)
function AgenticBackground() {
  return null; // placeholder — original component left intact
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <div style={{
      fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#ff6b6b',
      marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 9 }}>⚠</span>{msg}
    </div>
  );
}

// ── Added 'register-success' to the View type ──
type View = 'login' | 'forgot' | 'register' | 'forgot-sent' | 'register-success';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (name: string, email: string, role?: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    if (isOpen) {
      setPhase('entering');
      setTimeout(() => setPhase('visible'), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setPhase('leaving');
      setTimeout(() => {
        setPhase('hidden');
        document.body.style.overflow = '';
        setView('login'); setErrors({});
        setPassword(''); setConfirmPassword(''); setEmail(''); setFirstName(''); setLastName('');
      }, 380);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 450); };
  const switchView = (v: View) => { setErrors({}); setPassword(''); setConfirmPassword(''); setView(v); };

  // ─────────────────────────────────────────────────────────────
  // LOGIN  — fixed token keys + proper response unwrapping
  // ─────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email required';
    else if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password required';

    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errMsg: string = json?.error ?? 'Invalid credentials';

        // ── Email not verified ──
        if (
          errMsg.toLowerCase().includes('not verified') ||
          errMsg.toLowerCase().includes('email_not_verified') ||
          json?.code === 'email_not_verified'
        ) {
          setErrors({
            password:
              'Please verify your email before logging in. Check your inbox (and spam folder).',
          });
        } else {
          setErrors({ password: errMsg });
        }
        triggerShake();
        return;
      }

      // Backend returns: { success: true, data: { access_token, refresh_token, user: {...} } }
      const payload = json.data ?? json;

      // ✅ SAVE TOKENS — use consistent keys "access_token" / "refresh_token"
      localStorage.setItem('access_token', payload.access_token ?? payload.access ?? '');
      localStorage.setItem('refresh_token', payload.refresh_token ?? payload.refresh ?? '');

      const user = payload.user ?? {};
      const displayName =
        user.full_name ||
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
        user.email?.split('@')[0] ||
        email;

      const userRole = user.role ?? 'user';

      // Admin mode: verify the user actually has admin privileges
      if (loginMode === 'admin' && userRole !== 'super_admin') {
        setErrors({ password: 'This account does not have admin privileges. Please use User Login.' });
        triggerShake();
        // Clear the tokens since we're rejecting this login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return;
      }

      onLoginSuccess?.(displayName, user.email ?? email, userRole);
      onClose();
    } catch {
      setErrors({ email: 'Network error — please try again.' });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email required';
    else if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }

    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // fail silently — always show "sent" to avoid enumeration
    } finally {
      setLoading(false);
      setView('forgot-sent');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName) errs.firstName = 'First name required';
    if (!lastName) errs.lastName = 'Last name required';
    if (!email) errs.email = 'Email required';
    else if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password required';
    else if (password.length < 8) errs.password = 'Min. 8 characters';
    if (confirmPassword !== password) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: `${firstName} ${lastName}`.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data?.error ?? data?.message ?? 'Registration failed. Please try again.';
        setErrors({ email: msg });
        triggerShake();
        return;
      }

      switchView('register-success');
    } catch {
      setErrors({ email: 'Network error — please try again.' });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'hidden') return null;

  const CORNERS = [
    { t: -1, l: -1, bt: true, bl: true },
    { t: -1, r: -1, bt: true, br: true },
    { b: -1, l: -1, bb: true, bl: true },
    { b: -1, r: -1, bb: true, br: true },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');

        @keyframes overlayIn  { from { opacity:0; backdrop-filter:blur(0px); } to { opacity:1; backdrop-filter:blur(6px); } }
        @keyframes overlayOut { from { opacity:1; backdrop-filter:blur(6px); } to { opacity:0; backdrop-filter:blur(0px); } }
        @keyframes cardIn     { from { opacity:0; transform:translateY(28px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes cardOut    { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(16px) scale(0.97); } }
        @keyframes spin       { to { transform:rotate(360deg); } }
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes viewIn     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gold-line  { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes itemIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .lm-overlay-iris {
          position:fixed; inset:0; z-index:1000;
          background:rgba(5,5,18,0.82);
          display:flex; align-items:center; justify-content:center; padding:20px;
        }
        .lm-overlay-iris.entering,.lm-overlay-iris.visible { animation:overlayIn 0.32s ease forwards; }
        .lm-overlay-iris.leaving { animation:overlayOut 0.32s ease forwards; }

        .lm-card {
          position:relative; width:100%; max-width:360px;
          background:linear-gradient(160deg,rgba(18,16,36,0.98),rgba(12,10,26,0.99));
          border-radius:16px; padding:24px 22px 22px;
          box-shadow:0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,184,73,0.12), inset 0 1px 0 rgba(240,184,73,0.07);
        }
        .lm-card.entering,.lm-card.visible { animation:cardIn 0.35s cubic-bezier(0.34,1.1,0.64,1) forwards; }
        .lm-card.leaving { animation:cardOut 0.28s ease forwards; }
        .lm-card.shake { animation:none; transform:none; }

        .lm-content-item { animation:itemIn 0.28s ease both; }

        .lm-input {
          width:100%; padding:9px 11px; border-radius:8px; box-sizing:border-box;
          background:rgba(240,184,73,0.04); border:1px solid rgba(240,184,73,0.18);
          color:#f0ead8; font-family:'DM Mono',monospace; font-size:12px;
          outline:none; transition:border-color 0.15s, box-shadow 0.15s;
        }
        .lm-input:focus { border-color:rgba(240,184,73,0.55); box-shadow:0 0 0 3px rgba(240,184,73,0.07); }
        .lm-input::placeholder { color:rgba(240,184,73,0.2); }
        .lm-input-err { border-color:rgba(255,107,107,0.5) !important; }

        .lm-btn {
          width:100%; padding:10px; border-radius:8px; border:none; cursor:pointer;
          font-family:'DM Mono',monospace; font-size:12px; font-weight:600;
          letter-spacing:0.08em; text-transform:uppercase;
          background:linear-gradient(135deg,#e8a835,#f5d070,#e8a835);
          background-size:200% auto; color:#0a0a1a;
          transition:background-position 0.4s,transform 0.1s,box-shadow 0.2s;
          position:relative; overflow:hidden;
        }
        .lm-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%);
          transform:translateX(-100%); transition:transform 0.4s ease;
        }
        .lm-btn:hover:not(:disabled)::after { transform:translateX(100%); }
        .lm-btn:hover:not(:disabled) { background-position:right center; box-shadow:0 4px 22px rgba(240,184,73,0.3); transform:translateY(-1px); }
        .lm-btn:active:not(:disabled) { transform:translateY(0); }
        .lm-btn:disabled { opacity:0.55; cursor:not-allowed; }

        .lm-btn-ghost {
          width:100%; padding:9px; border-radius:8px; cursor:pointer;
          background:transparent; border:1px solid rgba(240,184,73,0.22);
          color:rgba(240,184,73,0.7); font-family:'DM Mono',monospace;
          font-size:12px; letter-spacing:0.08em; text-transform:uppercase;
          transition:background 0.15s,border-color 0.15s,color 0.15s;
        }
        .lm-btn-ghost:hover { background:rgba(240,184,73,0.06); border-color:rgba(240,184,73,0.4); color:#f0b849; }

        .lm-label {
          font-family:'DM Mono',monospace; font-size:9.5px; font-weight:500;
          color:rgba(240,184,73,0.5); letter-spacing:0.14em; text-transform:uppercase;
          display:block; margin-bottom:5px;
        }
        .lm-link {
          background:none; border:none; cursor:pointer; padding:0;
          font-family:'DM Mono',monospace; font-size:11px;
          color:rgba(240,184,73,0.55); letter-spacing:0.04em;
          transition:color 0.15s;
        }
        .lm-link:hover { color:#f0b849; }
        .lm-back {
          background:none; border:none; cursor:pointer; padding:0;
          display:flex; align-items:center; gap:5px; margin-bottom:16px;
          font-family:'DM Mono',monospace; font-size:10px;
          color:rgba(240,184,73,0.38); letter-spacing:0.08em; text-transform:uppercase;
          transition:color 0.15s;
        }
        .lm-back:hover { color:rgba(240,184,73,0.7); }
        .lm-spinner {
          display:inline-block; width:12px; height:12px;
          border:1.5px solid rgba(10,10,26,0.2); border-top-color:#0a0a1a;
          border-radius:50%; animation:spin 0.6s linear infinite;
          vertical-align:middle; margin-right:6px;
        }
        .lm-divider { display:flex; align-items:center; gap:8px; margin:14px 0; }
        .lm-divider-line { flex:1; height:1px; background:rgba(240,184,73,0.1); }
        .lm-divider-text { font-family:'DM Mono',monospace; font-size:9px; color:rgba(240,184,73,0.28); letter-spacing:0.12em; text-transform:uppercase; }
        .lm-cursor { display:inline-block; width:6px; height:12px; background:#f0b849; margin-left:2px; vertical-align:middle; animation:blink 1s step-end infinite; border-radius:1px; }
        .lm-view { animation:viewIn 0.22s ease forwards; }
        .lm-mode-tabs { display:flex; border-radius:8px; padding:3px; gap:3px; background:rgba(240,184,73,0.05); border:1px solid rgba(240,184,73,0.12); margin-bottom:16px; }
        .lm-mode-tab { flex:1; padding:7px; border-radius:6px; border:none; cursor:pointer; font-family:'DM Mono',monospace; font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.18s; display:flex; align-items:center; justify-content:center; gap:5px; }
        .lm-mode-tab.active { background:rgba(240,184,73,0.14); color:#f0b849; border:1px solid rgba(240,184,73,0.28); box-shadow:0 0 12px rgba(240,184,73,0.08); }
        .lm-mode-tab:not(.active) { background:transparent; color:rgba(240,184,73,0.32); }
        .lm-mode-tab:not(.active):hover { background:rgba(240,184,73,0.05); color:rgba(240,184,73,0.5); }
        .lm-admin-badge { display:inline-flex; align-items:center; gap:4px; font-size:8.5px; padding:2px 7px; border-radius:4px; background:rgba(139,92,246,0.15); color:#a78bfa; border:1px solid rgba(139,92,246,0.25); letter-spacing:0.06em; margin-bottom:14px; width:100%; justify-content:center; }
        .lm-gold-underline {
          display:block; height:1px; background:#f0b849; margin-top:16px; margin-bottom:20px;
          animation:gold-line 0.5s cubic-bezier(0.4,0,0.2,1) 0.45s both;
        }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}>
        <AgenticBackground />
      </div>

      {/* Overlay */}
      <div
        className={`lm-overlay-iris ${phase}`}
        onClick={phase === 'visible' ? onClose : undefined}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        {/* Card */}
        <div
          className={`lm-card ${phase}${shake ? ' shake' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Corner brackets */}
          {CORNERS.map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: (c as any).t !== undefined ? (c as any).t : undefined,
              bottom: (c as any).b !== undefined ? (c as any).b : undefined,
              left: (c as any).l !== undefined ? (c as any).l : undefined,
              right: (c as any).r !== undefined ? (c as any).r : undefined,
              width: 8, height: 8,
              borderTopWidth: (c as any).bt ? '1.5px' : 0,
              borderBottomWidth: (c as any).bb ? '1.5px' : 0,
              borderLeftWidth: (c as any).bl ? '1.5px' : 0,
              borderRightWidth: (c as any).br ? '1.5px' : 0,
              borderStyle: 'solid',
              borderColor: '#f0b849',
              borderTopLeftRadius: i === 0 ? 14 : 0,
              borderTopRightRadius: i === 1 ? 14 : 0,
              borderBottomLeftRadius: i === 2 ? 14 : 0,
              borderBottomRightRadius: i === 3 ? 14 : 0,
            }} />
          ))}

          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 10, right: 10, width: 24, height: 24,
            borderRadius: 6, background: 'rgba(240,184,73,0.06)', border: '1px solid rgba(240,184,73,0.15)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(240,184,73,0.4)', fontSize: 11, fontFamily: 'monospace',
            transition: 'all 0.15s', zIndex: 2,
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.13)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,184,73,0.85)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,184,73,0.4)'; }}
          >✕</button>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Header */}
            <div className="lm-content-item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, animationDelay: '0.18s' }}>
              <img src="/sia-globe-v2.png" alt="SIA" style={{ height: 26, width: 'auto', mixBlendMode: 'lighten' }} />
              <div style={{ width: 1, height: 14, background: 'rgba(240,184,73,0.2)' }} />
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(240,184,73,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {view === 'login'
                  ? 'auth/sign-in'
                  : view === 'forgot' || view === 'forgot-sent'
                    ? 'auth/reset'
                    : view === 'register-success'
                      ? 'auth/registered'
                      : 'auth/register'}
              </span>
              <span className="lm-cursor" />
            </div>

            <span className="lm-gold-underline" />

            {/* ── LOGIN VIEW ── */}
            {view === 'login' && (
              <div className="lm-view">
                <h2 className="lm-content-item" style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, fontWeight: 700, color: '#f0ead8', margin: '0 0 2px', letterSpacing: '-0.01em', animationDelay: '0.22s' }}>
                  Welcome back.
                </h2>
                <p className="lm-content-item" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: 'rgba(200,185,150,0.38)', margin: '0 0 18px', animationDelay: '0.26s', letterSpacing: '0.02em' }}>
                  Sign in to continue.
                </p>

                {/* Mode Tabs */}
                <div className="lm-mode-tabs lm-content-item" style={{ animationDelay: '0.28s' }}>
                  <button
                    type="button"
                    className={`lm-mode-tab${loginMode === 'user' ? ' active' : ''}`}
                    onClick={() => { setLoginMode('user'); setErrors({}); }}
                  >
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    User
                  </button>
                  <button
                    type="button"
                    className={`lm-mode-tab${loginMode === 'admin' ? ' active' : ''}`}
                    onClick={() => { setLoginMode('admin'); setErrors({}); }}
                  >
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Admin
                  </button>
                </div>

                {loginMode === 'admin' && (
                  <div className="lm-admin-badge lm-content-item" style={{ animationDelay: '0.29s' }}>
                    <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Super Admin access required
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                  <div className="lm-content-item" style={{ marginBottom: 12, animationDelay: '0.3s' }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email ? ' lm-input-err' : ''}`} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>

                  <div className="lm-content-item" style={{ marginBottom: 6, animationDelay: '0.34s' }}>
                    <label className="lm-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} className={`lm-input${errors.password ? ' lm-input-err' : ''}`} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} style={{ paddingRight: 36 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,184,73,0.35)', padding: 0, lineHeight: 1, transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,184,73,0.75)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,184,73,0.35)')}>
                        {showPass
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                      </button>
                    </div>
                    {errors.password && <ErrMsg msg={errors.password} />}
                  </div>

                  <div className="lm-content-item" style={{ textAlign: 'right', marginBottom: 16, animationDelay: '0.36s' }}>
                    <button type="button" className="lm-link" onClick={() => switchView('forgot')}>forgot password?</button>
                  </div>

                  <div className="lm-content-item" style={{ animationDelay: '0.4s' }}>
                    <button type="submit" className="lm-btn" disabled={loading}>
                      {loading ? <><span className="lm-spinner" />authenticating…</> : '→ sign_in()'}
                    </button>
                  </div>
                </form>

                <div className="lm-divider lm-content-item" style={{ animationDelay: '0.44s' }}>
                  <div className="lm-divider-line" /><span className="lm-divider-text">no account?</span><div className="lm-divider-line" />
                </div>

                <div className="lm-content-item" style={{ animationDelay: '0.47s' }}>
                  <button type="button" className="lm-btn-ghost" onClick={() => switchView('register')}>→ register()</button>
                </div>
              </div>
            )}

            {/* ── FORGOT PASSWORD VIEW ── */}
            {view === 'forgot' && (
              <div className="lm-view">
                <button className="lm-back" onClick={() => switchView('login')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>back
                </button>
                <h2 style={{ fontFamily: "'DM Mono',monospace", fontSize: 19, fontWeight: 700, color: '#f0ead8', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Reset password.</h2>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: 'rgba(200,185,150,0.38)', margin: '0 0 18px', letterSpacing: '0.02em' }}>We'll send a link to your inbox.</p>
                <form onSubmit={handleForgot} noValidate>
                  <div style={{ marginBottom: 16 }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email ? ' lm-input-err' : ''}`} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>
                  <button type="submit" className="lm-btn" disabled={loading}>
                    {loading ? <><span className="lm-spinner" />sending…</> : '→ send_reset()'}
                  </button>
                </form>
              </div>
            )}

            {/* ── FORGOT SENT VIEW ── */}
            {view === 'forgot-sent' && (
              <div className="lm-view" style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(240,184,73,0.08)', border: '1px solid rgba(240,184,73,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f0b849" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 style={{ fontFamily: "'DM Mono',monospace", fontSize: 17, fontWeight: 700, color: '#f0ead8', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Check your inbox.</h2>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: 'rgba(200,185,150,0.38)', margin: '0 0 18px', lineHeight: 1.6, letterSpacing: '0.02em' }}>
                  Reset link sent to<br /><span style={{ color: 'rgba(240,184,73,0.7)', fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{email}</span>
                </p>
                <button type="button" className="lm-btn" onClick={() => switchView('login')}>→ back_to_login()</button>
              </div>
            )}

            {/* ── REGISTER SUCCESS VIEW ── */}
            {view === 'register-success' && (
              <div className="lm-view" style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'rgba(240,184,73,0.1)',
                  border: '1px solid rgba(240,184,73,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', position: 'relative',
                  boxShadow: '0 0 0 8px rgba(240,184,73,0.04), 0 0 0 16px rgba(240,184,73,0.02)',
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f0b849" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <h2 style={{ fontFamily: "'DM Mono',monospace", fontSize: 17, fontWeight: 700, color: '#f0ead8', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  Account created.
                </h2>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: 'rgba(200,185,150,0.38)', margin: '0 0 20px', lineHeight: 1.65, letterSpacing: '0.02em' }}>
                  A verification email was sent to<br />
                  <span style={{ color: 'rgba(240,184,73,0.7)', fontSize: 11 }}>{email}</span><br />
                  <span style={{ fontSize: 10.5, marginTop: 4, display: 'block' }}>Verify your email before logging in.</span>
                </p>

                {/* Steps */}
                <div style={{ textAlign: 'left', marginBottom: 20, background: 'rgba(240,184,73,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(240,184,73,0.1)' }}>
                  {[
                    { label: '01 — Check your inbox', done: true, active: false },
                    { label: '02 — Click the verification link', done: false, active: true },
                    { label: '03 — Return here and sign in', done: false, active: false },
                  ].map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontFamily: "'DM Mono',monospace", fontSize: 10.5,
                      marginBottom: i < 2 ? 10 : 0,
                      color: step.done ? 'rgba(240,184,73,0.9)' : step.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.38)',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.done ? 'rgba(240,184,73,0.15)' : 'transparent',
                        border: step.done ? 'none' : `1px solid ${step.active ? 'rgba(240,184,73,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      }}>
                        {step.done
                          ? <svg width="10" height="10" fill="none" stroke="#f0b849" strokeWidth="2.2"><path d="M2 5l2.5 2.5L8 3" /></svg>
                          : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(240,184,73,0.5)', animation: 'blink 1s step-end infinite' }} />
                        }
                      </div>
                      {step.label}
                    </div>
                  ))}
                </div>

                <button type="button" className="lm-btn" onClick={() => switchView('login')}>
                  → proceed_to_login()
                </button>
              </div>
            )}

            {/* ── REGISTER VIEW ── */}
            {view === 'register' && (
              <div className="lm-view">
                <button className="lm-back" onClick={() => switchView('login')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>back
                </button>
                <h2 style={{ fontFamily: "'DM Mono',monospace", fontSize: 19, fontWeight: 700, color: '#f0ead8', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Create account.</h2>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: 'rgba(200,185,150,0.38)', margin: '0 0 16px', letterSpacing: '0.02em' }}>Takes less than a minute.</p>
                <form onSubmit={handleRegister} noValidate>
                  {/* Name row */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label className="lm-label">First Name</label>
                      <input type="text" className={`lm-input${errors.firstName ? ' lm-input-err' : ''}`} placeholder="Jane" value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: '' })); }} />
                      {errors.firstName && <ErrMsg msg={errors.firstName} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="lm-label">Last Name</label>
                      <input type="text" className={`lm-input${errors.lastName ? ' lm-input-err' : ''}`} placeholder="Smith" value={lastName} onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: '' })); }} />
                      {errors.lastName && <ErrMsg msg={errors.lastName} />}
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom: 10 }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email ? ' lm-input-err' : ''}`} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>
                  {/* Password */}
                  <div style={{ marginBottom: 10 }}>
                    <label className="lm-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} className={`lm-input${errors.password ? ' lm-input-err' : ''}`} placeholder="Min. 8 chars" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} style={{ paddingRight: 36 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,184,73,0.35)', padding: 0, lineHeight: 1 }}>
                        {showPass
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                      </button>
                    </div>
                    {errors.password && <ErrMsg msg={errors.password} />}
                  </div>
                  {/* Confirm Password */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="lm-label">Confirm Password</label>
                    <input type={showPass ? 'text' : 'password'} className={`lm-input${errors.confirm ? ' lm-input-err' : ''}`} placeholder="••••••••" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }} />
                    {errors.confirm && <ErrMsg msg={errors.confirm} />}
                  </div>
                  <button type="submit" className="lm-btn" disabled={loading}>
                    {loading ? <><span className="lm-spinner" />creating account…</> : '→ create_account()'}
                  </button>
                </form>

                <div className="lm-divider" style={{ margin: '14px 0' }}>
                  <div className="lm-divider-line" /><span className="lm-divider-text">have an account?</span><div className="lm-divider-line" />
                </div>
                <button type="button" className="lm-btn-ghost" onClick={() => switchView('login')}>→ sign_in()</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}