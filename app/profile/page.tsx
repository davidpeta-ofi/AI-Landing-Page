'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ======================== API CONFIG ========================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://https://sia-backend-sbw7.onrender.com/';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ======================== TYPES ========================
interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  // role?: string;
}

interface AgentAccess {
  hr: boolean;
  marketing: boolean;
  hr_subscription?: { plan: string; renews: string; status: string };
  marketing_subscription?: { plan: string; renews: string; status: string };
}

interface AgentStatus {
  mark: { status: string; active: boolean };
  hr:   { status: string; active: boolean };
}

interface RecentDoc {
  type: 'HR' | 'Marketing';
  name: string;
  time: string;
  status: 'done' | 'processing';
}

// ── Placeholder / fallback data ─────────────────────────────────────────────
const FALLBACK_PROFILE: UserProfile = {
  first_name: 'Alex', last_name: 'Johnson',
  email: 'alex.johnson@company.com', role: 'Head of Operations',
};
const FALLBACK_ACCESS: AgentAccess = {
  hr: true, marketing: true,
  hr_subscription:        { plan: 'Pro', renews: 'Jan 15, 2026', status: 'ACTIVE' },
  marketing_subscription: { plan: 'Pro', renews: 'Jan 15, 2026', status: 'ACTIVE' },
};
const FALLBACK_STATUS: AgentStatus = {
  mark: { status: 'Active', active: true },
  hr:   { status: 'Active', active: true },
};
const RECENT_DOCS: RecentDoc[] = [
  { type: 'HR',        name: 'Q4_Hiring_Plan.pdf',        time: '2 hours ago', status: 'done' },
  { type: 'Marketing', name: 'Campaign_Brief_Nov.docx',   time: '5 hours ago', status: 'done' },
  { type: 'HR',        name: 'Contractor_Agreements.pdf', time: 'Yesterday',   status: 'done' },
  { type: 'Marketing', name: 'Brand_Guidelines_v3.pptx',  time: '2 days ago',  status: 'done' },
  { type: 'HR',        name: 'Onboarding_Checklist.xlsx', time: '3 days ago',  status: 'done' },
];

const TYPE_COLOR: Record<string, string> = {
  HR: '#f0b849',
  Marketing: '#a78bfa',
};

// ======================== COMPONENT ========================
export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted]       = useState(false);
  const [activeTab, setActiveTab]   = useState<'Overview' | 'Activity'>('Overview');
  const [editMode, setEditMode]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [scanLine, setScanLine]     = useState(0);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState<string | null>(null);

  const [profile, setProfile]       = useState<UserProfile>(FALLBACK_PROFILE);
  const [editBuf, setEditBuf]       = useState<UserProfile>(FALLBACK_PROFILE);
  const [access, setAccess]         = useState<AgentAccess>(FALLBACK_ACCESS);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(FALLBACK_STATUS);
  const [sessionValid, setSessionValid] = useState(false);
  const [docsProcessed]             = useState(1284);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    const iv = setInterval(() => setScanLine(p => (p + 1) % 100), 30);
    return () => clearInterval(iv);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Validate session first — GET /api/auth/session/validate/
      await apiFetch('/api/auth/session/validate/');
      setSessionValid(true);


      
      // GET /api/auth/profile/
      const profileData = await apiFetch('/api/auth/profile/');
      const p: UserProfile = {
        first_name: profileData.first_name ?? 'Alex',
        last_name:  profileData.last_name  ?? 'Johnson',
        email:      profileData.email      ?? 'alex.johnson@company.com',
        // role:       profileData.role       ?? 'Head of Operations',
      };
      setProfile(p);
      setEditBuf(p);

      // GET /api/auth/access/
      const accessData = await apiFetch('/api/auth/access/');
      setAccess({
        hr:        accessData.hr        ?? false,
        marketing: accessData.marketing ?? false,
        hr_subscription:        accessData.hr_subscription        ?? FALLBACK_ACCESS.hr_subscription,
        marketing_subscription: accessData.marketing_subscription ?? FALLBACK_ACCESS.marketing_subscription,
      });

      // GET /api/tenants/v2/agents/status/
      const statusData = await apiFetch('/api/tenants/v2/agents/status/');
      setAgentStatus({
        mark: statusData.mark ?? FALLBACK_STATUS.mark,
        hr:   statusData.hr   ?? FALLBACK_STATUS.hr,
      });
    } catch (e: any) {
      setApiError('Could not reach the SIA backend. Showing demo data.');
      // Keep fallback data already set
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // PUT /api/auth/profile/update/
      await apiFetch('/api/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: editBuf.first_name,
          last_name:  editBuf.last_name,
        }),
      });
      setProfile(editBuf);
      setEditMode(false);
    } catch {
      // Optimistic update anyway (demo mode)
      setProfile(editBuf);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Logout helper ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      // POST /api/auth/logout/
      await apiFetch('/api/auth/logout/', { method: 'POST' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/');
    }
  };

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase();

  const agentsUsed = [access.hr, access.marketing].filter(Boolean).length;
  const agentNames = [access.hr && 'HR', access.marketing && 'Marketing'].filter(Boolean).join(' · ');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        @keyframes pp-fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pp-pulse    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.35)} }
        @keyframes pp-glow     { 0%,100%{box-shadow:0 0 16px rgba(240,184,73,.18)} 50%{box-shadow:0 0 36px rgba(240,184,73,.42)} }
        @keyframes pp-flow     { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes pp-corner   { 0%,100%{opacity:.2} 50%{opacity:.85} }
        @keyframes pp-spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pp-shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes pp-blink    { 0%,100%{opacity:1} 50%{opacity:0} }

        .pp-wrap {
          min-height:100vh;
          background: radial-gradient(ellipse at 65% 12%, #0e0d2a 0%, #080718 44%, #050412 100%);
          font-family:'DM Mono',monospace;
          padding-top:80px; color:#f0ead8;
        }
        .pp-inner { max-width:920px; margin:0 auto; padding:44px 24px 100px; }

        /* ── Top bar ── */
        .pp-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; }
        .pp-back {
          display:inline-flex; align-items:center; gap:7px;
          background:none; border:none; cursor:pointer; padding:0;
          font-family:'DM Mono',monospace; font-size:9.5px;
          color:rgba(240,184,73,.38); letter-spacing:.12em; text-transform:uppercase;
          transition:color .15s;
        }
        .pp-back:hover { color:rgba(240,184,73,.75); }
        .pp-logout-btn {
          font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase;
          padding:6px 14px; border-radius:6px; cursor:pointer;
          border:1px solid rgba(239,68,68,.3); background:rgba(239,68,68,.06);
          color:rgba(239,68,68,.7); transition:all .15s;
        }
        .pp-logout-btn:hover { background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.55); }

        /* ── API status banner ── */
        .pp-api-banner {
          display:flex; align-items:center; gap:10px; padding:10px 16px;
          border-radius:9px; margin-bottom:18px;
          border:1px solid rgba(245,166,35,.25); background:rgba(245,166,35,.06);
          font-size:10px; color:rgba(240,184,73,.7); letter-spacing:.04em;
          animation:pp-fadeUp .3s ease both;
        }

        /* ── Hero ── */
        .pp-hero {
          display:flex; align-items:flex-start; gap:24px;
          padding:26px 28px 22px;
          border-radius:14px; border:1px solid rgba(240,184,73,.15);
          background:rgba(240,184,73,.02);
          margin-bottom:26px; position:relative; overflow:hidden;
          animation:pp-glow 4s ease-in-out infinite;
        }
        .pp-hero::before {
          content:''; position:absolute; inset:-1px; border-radius:inherit;
          background:linear-gradient(90deg, transparent, rgba(240,184,73,.4) 40%, rgba(245,208,112,.7) 50%, rgba(240,184,73,.4) 60%, transparent);
          background-size:300% 100%; animation:pp-flow 4s linear infinite;
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          padding:1px; pointer-events:none;
        }

        /* ── Avatar ── */
        .pp-avatar-wrap { position:relative; flex-shrink:0; width:80px; height:80px; }
        .pp-avatar {
          width:80px; height:80px; border-radius:14px;
          background:linear-gradient(135deg,rgba(240,184,73,.14),rgba(240,184,73,.06));
          border:1px solid rgba(240,184,73,.32);
          display:flex; align-items:center; justify-content:center;
          font-size:26px; font-weight:600; color:#f0b849;
          position:relative; overflow:hidden; letter-spacing:-.02em;
        }
        .pp-avatar-scan {
          position:absolute; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(240,184,73,.9) 40%,rgba(245,208,112,1) 50%,rgba(240,184,73,.9) 60%,transparent);
          pointer-events:none; z-index:2; transition:top .03s linear;
        }
        .pp-status-dot {
          position:absolute; bottom:-3px; right:-3px;
          width:12px; height:12px; border-radius:50%;
          background:#4ade80; border:2px solid #080718;
          box-shadow:0 0 8px rgba(74,222,128,.8);
          animation:pp-pulse 1.5s ease-in-out infinite;
        }
        .pp-corner {
          position:absolute; width:8px; height:8px;
          border-color:rgba(240,184,73,.7); border-style:solid;
          animation:pp-corner 2s ease-in-out infinite; pointer-events:none; z-index:3;
        }
        .pp-corner.tl{top:-1px;left:-1px;border-width:1.5px 0 0 1.5px}
        .pp-corner.tr{top:-1px;right:-1px;border-width:1.5px 1.5px 0 0;animation-delay:.5s}
        .pp-corner.bl{bottom:-1px;left:-1px;border-width:0 0 1.5px 1.5px;animation-delay:1s}
        .pp-corner.br{bottom:-1px;right:-1px;border-width:0 1.5px 1.5px 0;animation-delay:1.5s}

        /* ── Hero info ── */
        .pp-hero-info { flex:1; min-width:0; }
        .pp-tag { display:inline-flex; align-items:center; gap:5px; font-size:9px; color:rgba(240,184,73,.42); letter-spacing:.16em; text-transform:uppercase; margin-bottom:8px; }
        .pp-tag-dot { width:4px; height:4px; border-radius:50%; background:#f0b849; animation:pp-pulse 2s ease-in-out infinite; }
        .pp-name { font-size:22px; font-weight:600; color:#f0ead8; letter-spacing:-.01em; margin:0 0 4px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .pp-role { font-size:11.5px; color:rgba(200,185,150,.42); letter-spacing:.04em; margin-bottom:14px; }
        .pp-email-row { font-size:10.5px; color:rgba(240,184,73,.52); letter-spacing:.04em; display:flex; align-items:center; gap:6px; }
        .pp-session-badge { display:inline-flex; align-items:center; gap:4px; font-size:8.5px; color:rgba(74,222,128,.6); letter-spacing:.08em; margin-top:8px; }

        /* ── Edit button ── */
        .pp-edit-btn {
          margin-left:auto; align-self:flex-start; flex-shrink:0;
          padding:8px 18px; border-radius:7px;
          border:1px solid rgba(240,184,73,.3); background:rgba(240,184,73,.06);
          color:#f0b849; font-family:'DM Mono',monospace;
          font-size:9.5px; letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; transition:all .2s;
        }
        .pp-edit-btn:hover { background:rgba(240,184,73,.13); border-color:rgba(240,184,73,.58); }

        /* ── Inline edit inputs ── */
        .pp-input {
          background:rgba(240,184,73,.06); border:1px solid rgba(240,184,73,.28);
          border-radius:6px; padding:6px 10px;
          color:#f0ead8; font-family:'DM Mono',monospace;
          font-size:inherit; letter-spacing:inherit; outline:none;
          width:100%; transition:border-color .2s; resize:none;
        }
        .pp-input:focus { border-color:rgba(240,184,73,.65); }

        /* ── Tabs ── */
        .pp-tabs { display:flex; gap:2px; border-bottom:1px solid rgba(240,184,73,.1); margin-bottom:28px; }
        .pp-tab {
          padding:10px 20px; background:none; border:none;
          font-family:'DM Mono',monospace; font-size:10px;
          letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; color:rgba(200,185,150,.32);
          border-bottom:2px solid transparent; margin-bottom:-1px;
          transition:color .2s, border-color .2s;
        }
        .pp-tab.active { color:#f0b849; border-bottom-color:#f0b849; }
        .pp-tab:hover:not(.active) { color:rgba(200,185,150,.6); }

        /* ── Stats grid ── */
        .pp-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:28px; }
        @media(min-width:640px){ .pp-stats { grid-template-columns:repeat(4,1fr); } }
        .pp-stat {
          padding:18px; border-radius:12px;
          border:1px solid rgba(240,184,73,.1); background:rgba(240,184,73,.025);
          transition:border-color .2s, background .2s; position:relative; overflow:hidden;
        }
        .pp-stat:hover { border-color:rgba(240,184,73,.28); background:rgba(240,184,73,.055); }
        .pp-stat-shimmer {
          position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(240,184,73,.04),transparent);
          animation:pp-shimmer 3s ease-in-out infinite; pointer-events:none;
        }
        .pp-stat-label { font-size:8.5px; color:rgba(200,185,150,.38); letter-spacing:.13em; text-transform:uppercase; margin-bottom:10px; }
        .pp-stat-val { font-size:22px; font-weight:600; color:#f0b849; letter-spacing:-.02em; margin-bottom:5px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .pp-stat-delta { font-size:9.5px; color:rgba(200,185,150,.3); letter-spacing:.03em; margin-bottom:0; }
        .pp-badge-green { font-size:8px; padding:2px 7px; border-radius:4px; background:rgba(74,222,128,.12); color:#4ade80; border:1px solid rgba(74,222,128,.28); letter-spacing:.08em; }
        .pp-manage-btn { margin-top:12px; font-size:8.5px; padding:4px 10px; border-radius:5px; background:rgba(240,184,73,.08); border:1px solid rgba(240,184,73,.25); color:rgba(240,184,73,.68); font-family:'DM Mono',monospace; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:all .15s; }
        .pp-manage-btn:hover { background:rgba(240,184,73,.16); }

        /* ── Section label ── */
        .pp-slabel { font-size:9.5px; color:rgba(240,184,73,.38); letter-spacing:.14em; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
        .pp-slabel::after { content:''; flex:1; height:1px; background:rgba(240,184,73,.08); }

        /* ── File rows ── */
        .pp-files { display:flex; flex-direction:column; gap:7px; }
        .pp-file {
          display:flex; align-items:center; gap:12px;
          padding:12px 14px; border-radius:10px;
          border:1px solid rgba(240,184,73,.08); background:rgba(255,255,255,.015);
          transition:border-color .2s, background .2s; cursor:default;
        }
        .pp-file:hover { border-color:rgba(240,184,73,.22); background:rgba(240,184,73,.04); }
        .pp-file-tag { font-size:8px; letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:4px; font-weight:500; flex-shrink:0; }
        .pp-file-name { flex:1; font-size:11.5px; color:#f0ead8; letter-spacing:.01em; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pp-file-time { font-size:9.5px; color:rgba(200,185,150,.28); letter-spacing:.03em; flex-shrink:0; }
        .pp-file-done { font-size:8.5px; letter-spacing:.06em; flex-shrink:0; }

        /* ── Activity bars ── */
        .pp-bar-wrap { margin-bottom:20px; }
        .pp-bar-track { height:5px; border-radius:3px; background:rgba(255,255,255,.05); overflow:hidden; }
        .pp-bar-fill  { height:100%; border-radius:3px; transition:width 1s cubic-bezier(.4,0,.2,1); }

        /* ── Loading skeleton ── */
        .pp-skeleton { border-radius:8px; background:rgba(240,184,73,.05); animation:pp-shimmer 2s ease-in-out infinite; }

        /* ── API info panel ── */
        .pp-api-panel {
          margin-top:32px; padding:18px; border-radius:12px;
          border:1px dashed rgba(240,184,73,.18); background:rgba(240,184,73,.03);
        }
        .pp-api-endpoint { display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid rgba(240,184,73,.07); }
        .pp-api-endpoint:last-child { border-bottom:none; }
        .pp-method { font-size:8px; padding:2px 6px; border-radius:3px; font-weight:700; letter-spacing:.06em; flex-shrink:0; }
        .pp-method.get  { background:rgba(6,182,212,.15); color:#06B6D4; border:1px solid rgba(6,182,212,.3); }
        .pp-method.post { background:rgba(34,197,94,.12); color:#22C55E; border:1px solid rgba(34,197,94,.28); }
        .pp-method.put  { background:rgba(245,166,35,.12); color:#F5A623; border:1px solid rgba(245,166,35,.28); }
        .pp-api-path { font-size:9.5px; color:rgba(240,184,73,.55); letter-spacing:.03em; flex:1; }
        .pp-api-desc { font-size:9px; color:rgba(200,185,150,.3); }
      `}</style>

      <div className="pp-wrap">
        <div className="pp-inner" style={{ opacity: mounted ? 1 : 0, transition: 'opacity .3s' }}>

          {/* Top bar */}
          <div className="pp-topbar">
            <button className="pp-back" onClick={() => router.back()}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Dashboard
            </button>
            <button className="pp-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="pp-api-banner">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {/* ── Hero card ── */}
          <div className="pp-hero" style={{ animation: mounted ? 'pp-fadeUp .4s ease both' : 'none' }}>
            <div className="pp-avatar-wrap">
              <div className="pp-avatar">
                {loading ? '··' : initials}
                <div className="pp-avatar-scan" style={{ top: `${scanLine}%` }} />
              </div>
              <span className="pp-corner tl"/><span className="pp-corner tr"/>
              <span className="pp-corner bl"/><span className="pp-corner br"/>
              <div className="pp-status-dot" />
            </div>

            <div className="pp-hero-info">
              <div className="pp-tag"><span className="pp-tag-dot"/>AGENT PROFILE</div>

              {editMode ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <input className="pp-input" style={{ fontSize:13 }} placeholder="First name"
                      value={editBuf.first_name} onChange={e => setEditBuf(p => ({...p, first_name: e.target.value}))} />
                    <input className="pp-input" style={{ fontSize:13 }} placeholder="Last name"
                      value={editBuf.last_name} onChange={e => setEditBuf(p => ({...p, last_name: e.target.value}))} />
                  </div>
                  <input className="pp-input" style={{ fontSize:11.5 }} placeholder="Job title"
                    value={editBuf.role ?? ''} onChange={e => setEditBuf(p => ({...p, role: e.target.value}))} />
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="pp-edit-btn" onClick={handleSave} disabled={saving}
                      style={{ marginLeft:0 }}>{saving ? 'Saving···' : '✓ Save'}</button>
                    <button className="pp-edit-btn" onClick={() => { setEditBuf(profile); setEditMode(false); }}
                      style={{ marginLeft:0, color:'rgba(200,185,150,.5)', borderColor:'rgba(200,185,150,.2)', background:'none' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pp-name">
                    {loading ? <span style={{ height:22, width:200 }} className="pp-skeleton"/> : fullName}
                    <span className="pp-badge-green">ACTIVE</span>
                  </div>
                  <div className="pp-role">{loading ? <span style={{ height:14, width:140, display:'block' }} className="pp-skeleton"/> : profile.role}</div>
                  <div className="pp-email-row">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {loading ? '···' : profile.email}
                  </div>
                  {sessionValid && (
                    <div className="pp-session-badge">
                      <div style={{ width:5, height:5, borderRadius:3, background:'#4ade80', boxShadow:'0 0 6px #4ade80' }}/>
                      Session validated · {BASE_URL}
                    </div>
                  )}
                </>
              )}
            </div>

            {!editMode && (
              <button className="pp-edit-btn" onClick={() => setEditMode(true)}>✎ Edit</button>
            )}
          </div>

          {/* ── Tabs ── */}
          <div className="pp-tabs" style={{ animation: mounted ? 'pp-fadeUp .4s ease .08s both' : 'none' }}>
            {(['Overview', 'Activity'] as const).map(t => (
              <button key={t} className={`pp-tab${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {/* ── OVERVIEW tab ── */}
          {activeTab === 'Overview' && (
            <div style={{ animation:'pp-fadeUp .3s ease both' }}>
              <div className="pp-slabel">performance metrics</div>
              <div className="pp-stats">
                {/* Documents Processed */}
                <div className="pp-stat" style={{ animationDelay:'0s' }}>
                  <div className="pp-stat-shimmer"/>
                  <div className="pp-stat-label">Documents Processed</div>
                  <div className="pp-stat-val">{loading ? '···' : docsProcessed.toLocaleString()}</div>
                  <div className="pp-stat-delta">+12 this week</div>
                </div>
                {/* Agents Used */}
                <div className="pp-stat" style={{ animationDelay:'.06s' }}>
                  <div className="pp-stat-shimmer"/>
                  <div className="pp-stat-label">Agents Used</div>
                  <div className="pp-stat-val">{loading ? '·' : agentsUsed}</div>
                  <div className="pp-stat-delta">{agentNames || '—'}</div>
                </div>
                {/* HR Agent */}
                <div className="pp-stat" style={{ animationDelay:'.12s', borderColor: access.hr ? 'rgba(240,184,73,.22)' : 'rgba(255,255,255,.07)' }}>
                  <div className="pp-stat-shimmer"/>
                  <div className="pp-stat-label">HR Agent</div>
                  <div className="pp-stat-val">
                    {loading ? '···' : (access.hr_subscription?.plan ?? 'Pro')}
                    {access.hr && <span className="pp-badge-green">{access.hr_subscription?.status ?? 'ACTIVE'}</span>}
                  </div>
                  <div className="pp-stat-delta">Renews {access.hr_subscription?.renews ?? 'Jan 15, 2026'}</div>
                  {access.hr && (
                    <button className="pp-manage-btn">Manage →</button>
                  )}
                </div>
                {/* Marketing Agent */}
                <div className="pp-stat" style={{ animationDelay:'.18s', borderColor: access.marketing ? 'rgba(240,184,73,.22)' : 'rgba(255,255,255,.07)' }}>
                  <div className="pp-stat-shimmer"/>
                  <div className="pp-stat-label">Marketing Agent</div>
                  <div className="pp-stat-val">
                    {loading ? '···' : (access.marketing_subscription?.plan ?? 'Pro')}
                    {access.marketing && <span className="pp-badge-green">{access.marketing_subscription?.status ?? 'ACTIVE'}</span>}
                  </div>
                  <div className="pp-stat-delta">Renews {access.marketing_subscription?.renews ?? 'Jan 15, 2026'}</div>
                  {access.marketing && (
                    <button className="pp-manage-btn">Manage →</button>
                  )}
                </div>
              </div>

              {/* Agent status row */}
              <div className="pp-slabel" style={{ marginTop:8 }}>live agent status</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
                {[
                  { key:'hr' as const,   label:'HR Agent',        color:'#f0b849' },
                  { key:'mark' as const, label:'Marketing Agent', color:'#a78bfa' },
                ].map(a => {
                  const st = agentStatus[a.key];
                  return (
                    <div key={a.key} style={{ padding:'14px 16px', borderRadius:10, border:`1px solid ${a.color}20`, background:`${a.color}06`, display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:8, height:8, borderRadius:4, background: st?.active ? '#4ade80' : 'rgba(255,255,255,.2)', boxShadow: st?.active ? '0 0 8px #4ade80' : 'none', animation: st?.active ? 'pp-pulse 1.5s ease-in-out infinite' : 'none', flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:10.5, color:'rgba(200,185,150,.7)', letterSpacing:'.03em' }}>{a.label}</div>
                        <div style={{ fontSize:9, color: st?.active ? '#4ade80' : 'rgba(200,185,150,.3)', letterSpacing:'.08em', textTransform:'uppercase', marginTop:2 }}>{st?.status ?? 'Unknown'}</div>
                      </div>
                      <div style={{ marginLeft:'auto', fontSize:8.5, color: a.color, opacity:.6, letterSpacing:'.1em' }}>
                        {BASE_URL}/api/tenants/v2/agents/{a.key === 'hr' ? 'hr' : 'mark'}/
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Documents */}
              <div className="pp-slabel">recent documents</div>
              <div className="pp-files">
                {RECENT_DOCS.map((f, i) => (
                  <div key={i} className="pp-file" style={{ animation:`pp-fadeUp .3s ease ${i*.05}s both` }}>
                    <span className="pp-file-tag" style={{ background:`${TYPE_COLOR[f.type]}18`, color:TYPE_COLOR[f.type], border:`1px solid ${TYPE_COLOR[f.type]}30` }}>
                      {f.type}
                    </span>
                    <span className="pp-file-name">{f.name}</span>
                    <span className="pp-file-time">{f.time}</span>
                    <span className="pp-file-done" style={{ color: f.status==='done' ? '#4ade80' : '#f0b849' }}>
                      {f.status === 'done' ? '✓ done' : '⟳ processing'}
                    </span>
                  </div>
                ))}
              </div>

              {/* API endpoints reference panel */}
              <div className="pp-api-panel" style={{ marginTop:36 }}>
                <div className="pp-slabel" style={{ marginBottom:14 }}>connected api endpoints</div>
                {[
                  { m:'GET',  path:'/api/auth/profile/',               desc:'User profile data' },
                  { m:'PUT',  path:'/api/auth/profile/update/',        desc:'Update first/last name' },
                  { m:'GET',  path:'/api/auth/access/',                desc:'Agent subscription access' },
                  { m:'GET',  path:'/api/tenants/v2/agents/status/',   desc:'Live agent status' },
                  { m:'GET',  path:'/api/auth/session/validate/',      desc:'Session validity check' },
                  { m:'POST', path:'/api/auth/logout/',                desc:'End session + clear tokens' },
                ].map((ep, i) => (
                  <div key={i} className="pp-api-endpoint">
                    <span className={`pp-method ${ep.m.toLowerCase()}`}>{ep.m}</span>
                    <span className="pp-api-path">{BASE_URL}{ep.path}</span>
                    <span className="pp-api-desc">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIVITY tab ── */}
          {activeTab === 'Activity' && (
            <div style={{ animation:'pp-fadeUp .3s ease both' }}>
              <div className="pp-slabel">agent usage this month</div>
              {[
                { label:'HR Agent',        pct:64, color:'#f0b849', count:'742 docs',  ep:'/api/tenants/v2/agents/hr/chat/' },
                { label:'Marketing Agent', pct:36, color:'#a78bfa', count:'542 docs', ep:'/api/tenants/v2/agents/mark/chat/' },
              ].map((a, i) => (
                <div key={a.label} className="pp-bar-wrap" style={{ animation:`pp-fadeUp .3s ease ${i*.07}s both` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <span style={{ fontSize:11, color:'rgba(200,185,150,.65)', letterSpacing:'.03em' }}>{a.label}</span>
                    <span style={{ fontSize:9.5, color:'rgba(200,185,150,.33)', letterSpacing:'.04em' }}>{a.count} · {a.pct}%</span>
                  </div>
                  <div className="pp-bar-track">
                    <div className="pp-bar-fill" style={{ width:`${a.pct}%`, background:`linear-gradient(90deg,${a.color}99,${a.color})`, boxShadow:`0 0 10px ${a.color}55` }}/>
                  </div>
                  <div style={{ fontSize:8.5, color:`${a.color}55`, marginTop:5, letterSpacing:'.04em' }}>POST {a.ep}</div>
                </div>
              ))}

              <div className="pp-slabel" style={{ marginTop:32 }}>all documents</div>
              <div className="pp-files">
                {RECENT_DOCS.map((f, i) => (
                  <div key={i} className="pp-file" style={{ animation:`pp-fadeUp .3s ease ${i*.05}s both` }}>
                    <span className="pp-file-tag" style={{ background:`${TYPE_COLOR[f.type]}18`, color:TYPE_COLOR[f.type], border:`1px solid ${TYPE_COLOR[f.type]}30` }}>
                      {f.type}
                    </span>
                    <span className="pp-file-name">{f.name}</span>
                    <span className="pp-file-time">{f.time}</span>
                    <span className="pp-file-done" style={{ color:'#4ade80' }}>✓ done</span>
                  </div>
                ))}
              </div>

              {/* Chat API reference */}
              <div className="pp-api-panel" style={{ marginTop:36 }}>
                <div className="pp-slabel" style={{ marginBottom:14 }}>agent chat api endpoints</div>
                {[
                  { m:'POST', path:'/api/tenants/v2/agents/mark/chat/', desc:'Chat with Marketing Agent' },
                  { m:'POST', path:'/api/tenants/v2/agents/hr/chat/',   desc:'Chat with HR Agent' },
                  { m:'GET',  path:'/api/tenants/v2/agents/status/',    desc:'Check both agent statuses' },
                ].map((ep, i) => (
                  <div key={i} className="pp-api-endpoint">
                    <span className={`pp-method ${ep.m.toLowerCase()}`}>{ep.m}</span>
                    <span className="pp-api-path">{ep.path}</span>
                    <span className="pp-api-desc">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}