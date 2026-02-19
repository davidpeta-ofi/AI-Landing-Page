'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, Edit, Mail, Shield, Bell, Palette,
  CreditCard, User, Check, ChevronRight, Zap,
  Download, Trash2, Eye, EyeOff, Plus, X,
  RefreshCw, Terminal, Wifi, WifiOff, Copy, CheckCircle,
} from 'lucide-react';

// ======================== API CONFIG ========================
// Primary: env var. Fallback: your deployed Render backend.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://sia-backend.onrender.com';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

// Token refresh helper
async function refreshToken(): Promise<string | null> {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refresh) return null;
  try {
    const data = await apiFetch('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const newToken = data.access_token ?? data.access ?? null;
    if (newToken) localStorage.setItem('access_token', newToken);
    return newToken;
  } catch {
    return null;
  }
}

// ======================== TYPES ========================
export type SettingsSection = 'profile' | 'notifications' | 'appearance' | 'privacy' | 'billing' | 'api';

interface UserProfile { first_name: string; last_name: string; email: string; role?: string; }
interface AgentAccess {
  hr: boolean; marketing: boolean;
  hr_subscription?: { plan: string; renews: string; status: string };
  marketing_subscription?: { plan: string; renews: string; status: string };
}
interface AgentStatus { mark: { status: string; active: boolean }; hr: { status: string; active: boolean }; }

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#07060F', bgCard: '#0C0B1C', bgCardHover: '#10102A',
  border: 'rgba(255,255,255,0.065)', borderGold: 'rgba(240,184,73,0.32)',
  gold: '#F0B849', goldDim: 'rgba(240,184,73,0.1)', goldGlow: 'rgba(240,184,73,0.22)',
  green: '#4ADE80', greenDim: 'rgba(74,222,128,0.1)',
  red: '#F87171', redDim: 'rgba(248,113,113,0.09)',
  purple: '#A78BFA', purpleDim: 'rgba(167,139,250,0.1)',
  cyan: '#22D3EE', cyanDim: 'rgba(34,211,238,0.1)',
  text: '#F0EAD8', textSec: 'rgba(200,185,150,0.65)', textMut: 'rgba(200,185,150,0.32)',
  mono: "'DM Mono','JetBrains Mono',monospace",
};

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');
  @keyframes s-fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes s-glow     { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes s-pulse    { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.3);opacity:1} }
  @keyframes s-flow     { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
  @keyframes s-scan     { 0%{top:-2px} 100%{top:100%} }
  @keyframes s-shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  @keyframes s-spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes s-blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes s-slide    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

  .s-scroll::-webkit-scrollbar{width:3px}
  .s-scroll::-webkit-scrollbar-track{background:transparent}
  .s-scroll::-webkit-scrollbar-thumb{background:rgba(240,184,73,.2);border-radius:2px}
  .s-input{outline:none;font-family:${T.mono};color:${T.text};background:rgba(240,184,73,.05);border:1px solid rgba(240,184,73,.22);border-radius:7px;padding:9px 13px;font-size:11.5px;letter-spacing:.02em;width:100%;box-sizing:border-box;transition:border-color .2s;resize:none;}
  .s-input:focus{border-color:rgba(240,184,73,.55);box-shadow:0 0 0 3px rgba(240,184,73,.07)}
  .s-input::placeholder{color:rgba(200,185,150,.22)}
  .s-input option{background:#0C0B1C}
  .s-row:hover{background:rgba(240,184,73,.03) !important}
  .s-nav-item:hover{background:rgba(255,255,255,.03) !important}
  .s-stat:hover{border-color:rgba(240,184,73,.25) !important;background:rgba(240,184,73,.05) !important}
  .s-plan-card:hover{border-color:rgba(240,184,73,.28) !important}
  .s-copy-btn:hover{background:rgba(240,184,73,.15) !important}
  .s-spinner{display:inline-block;width:12px;height:12px;border:2px solid rgba(240,184,73,.2);border-top-color:#F0B849;border-radius:50%;animation:s-spin .7s linear infinite}
`;

// ── Primitive helpers ────────────────────────────────────────────────────────
const Mono = (extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: T.mono, ...extra });

function Label({ children, dim, small }: { children: React.ReactNode; dim?: boolean; small?: boolean }) {
  return <span style={Mono({ fontSize: small ? 8 : 9, letterSpacing: '0.13em', textTransform: 'uppercase', color: dim ? T.textMut : T.gold, fontWeight: 600 })}>{children}</span>;
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 5, height: 5, borderRadius: 2, background: T.gold, boxShadow: `0 0 8px ${T.gold}`, animation: 's-glow 2.5s ease infinite' }} />
      <Label>{children}</Label>
      <div style={{ flex: 1, height: 1, background: 'rgba(240,184,73,0.09)' }} />
    </div>
  );
}

function StatusDot({ active, animate = true }: { active?: boolean; animate?: boolean }) {
  return <div style={{ width: 7, height: 7, borderRadius: 4, flexShrink: 0, background: active ? T.green : 'rgba(255,255,255,0.15)', boxShadow: active ? `0 0 8px ${T.green}` : 'none', animation: active && animate ? 's-pulse 1.8s ease-in-out infinite' : 'none' }} />;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.05)', outline: `1px solid ${on ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.1)'}`, position: 'relative', padding: 0, boxShadow: on ? `0 0 14px rgba(74,222,128,0.18)` : 'none', transition: 'all 0.3s' }}>
      <span style={{ position: 'absolute', top: 4, left: on ? 22 : 4, width: 16, height: 16, borderRadius: 8, background: on ? T.green : 'rgba(255,255,255,0.28)', boxShadow: on ? `0 0 8px ${T.green}` : 'none', transition: 'all 0.3s' }} />
    </button>
  );
}

function GoldBtn({ children, onClick, small, disabled }: { children: React.ReactNode; onClick?: () => void; small?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={Mono({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: small ? '6px 14px' : '9px 22px', borderRadius: 8, border: 'none', cursor: disabled ? 'default' : 'pointer', background: disabled ? 'rgba(240,184,73,0.2)' : `linear-gradient(135deg, #F0B849, #D97706)`, color: disabled ? 'rgba(240,184,73,0.4)' : '#07060F', fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: disabled ? 'none' : '0 0 22px rgba(240,184,73,0.22)', transition: 'filter 0.15s' })}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, danger, small }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} style={Mono({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: small ? '6px 13px' : '8px 17px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${danger ? 'rgba(248,113,113,0.32)' : 'rgba(255,255,255,0.1)'}`, background: danger ? T.redDim : 'rgba(255,255,255,0.03)', color: danger ? T.red : T.textSec, fontSize: small ? 9 : 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s' })}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.25)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}>
      {children}
    </button>
  );
}

function CardBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ borderRadius: 12, border: T.border, background: T.bgCard, overflow: 'hidden', ...style }}>{children}</div>;
}

function Row({ title, desc, children, noBorder }: { title: string; desc?: string; children?: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className="s-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 16, borderBottom: noBorder ? 'none' : `1px solid ${T.border}`, transition: 'background 0.15s' }}>
      <div>
        <div style={{ fontSize: 12, color: T.textSec, fontWeight: 500 }}>{title}</div>
        {desc && <div style={Mono({ fontSize: 9.5, color: T.textMut, marginTop: 3, letterSpacing: '0.02em' })}>{desc}</div>}
      </div>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

function StatCard({ label, value, sub, color, badge, loading }: { label: string; value: string; sub?: string; color?: string; badge?: string; loading?: boolean }) {
  return (
    <div className="s-stat" style={{ padding: 18, borderRadius: 12, border: `1px solid ${color ? color + '25' : T.border}`, background: T.bgCard, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg,transparent,rgba(240,184,73,.025),transparent)`, animation: 's-shimmer 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: color ? `radial-gradient(circle at top right,${color}12,transparent 70%)` : 'none' }} />
      <Label dim>{label}</Label>
      <div style={Mono({ fontSize: 24, fontWeight: 600, color: color ?? T.gold, marginTop: 8, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' })}>
        {loading ? <span className="s-spinner"/> : value}
        {!loading && badge && <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.28)`, letterSpacing: '0.1em', fontWeight: 600 })}>{badge}</span>}
      </div>
      {sub && <div style={Mono({ fontSize: 9, color: T.textMut, marginTop: 5, letterSpacing: '0.04em' })}>{loading ? '···' : sub}</div>}
    </div>
  );
}

function ApiMethodTag({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' }) {
  const colors: Record<string, string[]> = {
    GET: [T.cyan, 'rgba(34,211,238,0.12)'],
    POST: [T.green, 'rgba(74,222,128,0.12)'],
    PUT: [T.gold, 'rgba(240,184,73,0.12)'],
    DELETE: [T.red, 'rgba(248,113,113,0.1)'],
  };
  const [c, bg] = colors[method] ?? [T.textMut, 'transparent'];
  return <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.07em', color: c, background: bg, border: `1px solid ${c}35`, flexShrink: 0 })}>{method}</span>;
}

function SaveBar({ onSave }: { onSave?: () => Promise<void> }) {
  const [st, setSt] = useState<'idle' | 'saving' | 'done'>('idle');
  const save = async () => {
    setSt('saving');
    try { await onSave?.(); } catch {}
    setSt('done');
    setTimeout(() => setSt('idle'), 2200);
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 26, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
      <GhostBtn>Discard</GhostBtn>
      <GoldBtn onClick={save} disabled={st === 'saving'}>
        {st === 'saving' ? <><span className="s-spinner"/> Saving</> : st === 'done' ? <>✓ Saved</> : 'Save Changes'}
      </GoldBtn>
    </div>
  );
}

// ======================== PROFILE SECTION ========================
function ProfileSection({ profile, setProfile, access, agentStatus, apiOnline, loading }: {
  profile: UserProfile; setProfile: (p: UserProfile) => void;
  access: AgentAccess; agentStatus: AgentStatus; apiOnline: boolean; loading: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [buf, setBuf] = useState(profile);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep buf in sync if profile changes from API
  useEffect(() => { setBuf(profile); }, [profile]);

  const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName = `${profile.first_name} ${profile.last_name}`;

  const saveProfile = async () => {
    try {
      await apiFetch('/api/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify({ first_name: buf.first_name, last_name: buf.last_name }),
      });
    } catch { /* optimistic */ }
    setProfile(buf);
    setEditMode(false);
  };

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      {/* ── Hero card ── */}
      <div style={{ borderRadius: 14, border: `1px solid rgba(240,184,73,0.16)`, background: 'rgba(240,184,73,0.025)', padding: '24px 28px', marginBottom: 22, position: 'relative', overflow: 'hidden', boxShadow: `0 0 30px rgba(240,184,73,0.07)` }}>
        <div style={{ position: 'absolute', inset: -1, borderRadius: 14, background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.4) 40%,rgba(245,208,112,0.7) 50%,rgba(240,184,73,0.4) 60%,transparent)', backgroundSize: '300% 100%', animation: 's-flow 4.5s linear infinite', WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: 1, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 76, height: 76, borderRadius: 14, background: 'linear-gradient(135deg,rgba(240,184,73,0.14),rgba(240,184,73,0.06))', border: '1px solid rgba(240,184,73,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              {loading
                ? <span className="s-spinner"/>
                : <span style={Mono({ fontSize: 24, fontWeight: 600, color: T.gold, letterSpacing: '-0.02em' })}>{initials}</span>}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.9) 40%,rgba(245,208,112,1) 50%,rgba(240,184,73,0.9) 60%,transparent)', animation: 's-scan 3s linear infinite', pointerEvents: 'none', zIndex: 2 }} />
            </div>
            {([['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']] as const).map(([v, h], i) => (
              <div key={i} style={{ position: 'absolute', [v]: -1, [h]: -1, width: 8, height: 8, borderTopWidth: v === 'top' ? '1.5px' : 0, borderBottomWidth: v === 'bottom' ? '1.5px' : 0, borderLeftWidth: h === 'left' ? '1.5px' : 0, borderRightWidth: h === 'right' ? '1.5px' : 0, borderStyle: 'solid', borderColor: 'rgba(240,184,73,0.7)', animation: 's-glow 2s ease-in-out infinite', animationDelay: `${i * 0.5}s` }} />
            ))}
            <div style={{ position: 'absolute', bottom: -3, right: -3, width: 12, height: 12, borderRadius: 6, background: T.green, border: `2px solid ${T.bgCard}`, boxShadow: `0 0 8px ${T.green}`, animation: 's-pulse 1.5s ease-in-out infinite' }} />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.gold, animation: 's-pulse 2s ease-in-out infinite' }} />
              <Label>Agent Profile</Label>
            </div>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="s-input" value={buf.first_name} placeholder="First name" onChange={e => setBuf(p => ({ ...p, first_name: e.target.value }))} style={{ fontSize: 13 }} />
                  <input className="s-input" value={buf.last_name} placeholder="Last name" onChange={e => setBuf(p => ({ ...p, last_name: e.target.value }))} style={{ fontSize: 13 }} />
                </div>
                <input className="s-input" value={buf.role ?? ''} placeholder="Job title" onChange={e => setBuf(p => ({ ...p, role: e.target.value }))} />
                <input className="s-input" value={buf.email} placeholder="Email" type="email" onChange={e => setBuf(p => ({ ...p, email: e.target.value }))} />
              </div>
            ) : (
              <>
                <div style={Mono({ fontSize: 21, fontWeight: 600, color: T.text, marginBottom: 4, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 })}>
                  {loading ? <span className="s-spinner"/> : fullName}
                  {!loading && <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.28)`, letterSpacing: '0.1em' })}>ACTIVE</span>}
                </div>
                <div style={Mono({ fontSize: 11.5, color: T.textMut, marginBottom: 12 })}>{loading ? '···' : (profile.role ?? 'Head of Operations')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Mail size={11} color={T.textMut} />
                  <span style={Mono({ fontSize: 10.5, color: 'rgba(240,184,73,0.52)' })}>{loading ? '···' : profile.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  {apiOnline ? <Wifi size={10} color={T.green} /> : <WifiOff size={10} color={T.textMut} />}
                  <span style={Mono({ fontSize: 8.5, color: apiOnline ? 'rgba(74,222,128,0.6)' : T.textMut, letterSpacing: '0.06em' })}>
                    {apiOnline ? `Live · ${BASE_URL}` : 'Demo mode · API offline'}
                  </span>
                </div>
              </>
            )}
          </div>

          <button onClick={() => { if (editMode) { saveProfile(); } else { setBuf(profile); setEditMode(true); } }}
            style={Mono({ padding: '8px 17px', borderRadius: 8, border: `1px solid rgba(240,184,73,0.3)`, background: 'rgba(240,184,73,0.07)', color: T.gold, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 })}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.07)'; }}>
            <Edit size={11} /> {editMode ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {/* ── Performance Metrics ── */}
      <SectionDivider>Performance Metrics</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Documents Processed" value="1,284" sub="+12 this week" color={T.gold} loading={loading} />
        <StatCard label="Agents Used" value={`${[access.hr, access.marketing].filter(Boolean).length}`} sub={[access.hr && 'HR', access.marketing && 'Marketing'].filter(Boolean).join(' · ') || '—'} color={T.cyan} loading={loading} />
        <StatCard label="HR Agent" value={access.hr_subscription?.plan ?? (access.hr ? 'Active' : 'No Access')} badge={access.hr ? (access.hr_subscription?.status ?? 'ACTIVE') : undefined} sub={access.hr ? `Renews ${access.hr_subscription?.renews ?? '—'}` : 'Not subscribed'} color={T.green} loading={loading} />
        <StatCard label="Marketing Agent" value={access.marketing_subscription?.plan ?? (access.marketing ? 'Active' : 'No Access')} badge={access.marketing ? (access.marketing_subscription?.status ?? 'ACTIVE') : undefined} sub={access.marketing ? `Renews ${access.marketing_subscription?.renews ?? '—'}` : 'Not subscribed'} color={T.purple} loading={loading} />
      </div>

      {/* ── Live agent status ── */}
      <SectionDivider>Live Agent Status</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {([['hr', 'HR Agent', '#f0b849'] as const, ['mark', 'Marketing Agent', '#a78bfa'] as const]).map(([key, label, color]) => {
          const st = agentStatus[key];
          return (
            <div key={key} style={{ padding: '14px 16px', borderRadius: 11, border: `1px solid ${color}22`, background: `${color}06`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusDot active={loading ? false : st?.active} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, color: T.textSec }}>{label}</div>
                <div style={Mono({ fontSize: 9, color: st?.active ? T.green : T.textMut, letterSpacing: '0.08em', marginTop: 2 })}>
                  {loading ? '···' : (st?.status ?? 'UNKNOWN')}
                </div>
              </div>
              <div style={Mono({ fontSize: 8.5, color: `${color}55` })}>
                /api/.../agents/{key}/
              </div>
            </div>
          );
        })}
      </div>

      {/* ── API Endpoints ── */}
      <SectionDivider>API Endpoints — Profile</SectionDivider>
      <CardBox>
        {[
          { m: 'GET' as const, path: '/api/auth/profile/', desc: 'Fetch user profile data' },
          { m: 'PUT' as const, path: '/api/auth/profile/update/', desc: 'Update first_name, last_name' },
          { m: 'GET' as const, path: '/api/auth/access/', desc: 'Check agent subscriptions' },
          { m: 'GET' as const, path: '/api/auth/session/validate/', desc: 'Validate current session token' },
        ].map((ep, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <ApiMethodTag method={ep.m} />
            <span style={Mono({ fontSize: 10, color: 'rgba(240,184,73,0.55)', flex: 1 })}>{ep.path}</span>
            <span style={Mono({ fontSize: 9, color: T.textMut })}>{ep.desc}</span>
          </div>
        ))}
      </CardBox>

      {/* Danger zone */}
      <div style={{ borderRadius: 12, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.04)', padding: 18, marginTop: 22 }}>
        <SectionDivider>Danger Zone</SectionDivider>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 3 }}>Delete Account</div>
            <div style={Mono({ fontSize: 9.5, color: T.textMut })}>Permanently delete your account and all data.</div>
          </div>
          <GhostBtn danger><Trash2 size={11} /> Delete</GhostBtn>
        </div>
      </div>
    </div>
  );
}

// ======================== NOTIFICATIONS SECTION ========================
function NotificationsSection() {
  const [n, setN] = useState({ agentCompleted: true, agentError: true, weeklyReport: true, leadAlert: false, docProcessed: true, systemUpdates: false, emailDigest: true, slackPush: false, smsCritical: false });
  const set = (k: keyof typeof n) => (v: boolean) => setN(p => ({ ...p, [k]: v }));

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Active Alerts" value="4" sub="of 9 configured" color={T.gold} />
        <StatCard label="Last Triggered" value="2m" sub="Agent task completed" color={T.green} />
        <StatCard label="Today's Events" value="23" sub="across all agents" color={T.cyan} />
      </div>

      {[
        { label: 'Agent Activity', rows: [
          { k: 'agentCompleted', t: 'Task Completed', d: 'When any agent finishes — GET /api/tenants/v2/agents/status/' },
          { k: 'agentError', t: 'Agent Error', d: 'Critical failures — checked via agent status endpoint' },
          { k: 'leadAlert', t: 'Lead Alerts', d: 'High-intent signals from Marketing Agent (MARK)' },
          { k: 'docProcessed', t: 'Document Processed', d: 'HR Agent file analysis complete' },
        ]},
        { label: 'Reports & Digests', rows: [
          { k: 'weeklyReport', t: 'Weekly Performance Report', d: 'Compiled by PULSE agent — every Monday 09:00' },
          { k: 'systemUpdates', t: 'System Updates', d: 'Platform changes and API version upgrades' },
        ]},
        { label: 'Delivery Channels', rows: [
          { k: 'emailDigest', t: 'Email Digest', d: 'Sent to profile email via /api/auth/profile/' },
          { k: 'slackPush', t: 'Slack Push', d: '#sia-notifications channel integration' },
          { k: 'smsCritical', t: 'SMS — Critical', d: 'Agent errors and subscription alerts only' },
        ]},
      ].map((grp, gi) => (
        <div key={gi} style={{ marginBottom: 16 }}>
          <SectionDivider>{grp.label}</SectionDivider>
          <CardBox>
            {grp.rows.map((r, ri) => (
              <Row key={r.k} title={r.t} desc={r.d} noBorder={ri === grp.rows.length - 1}>
                <Toggle on={n[r.k as keyof typeof n]} onChange={set(r.k as keyof typeof n)} />
              </Row>
            ))}
          </CardBox>
        </div>
      ))}
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 600)); }} />
    </div>
  );
}

// ======================== APPEARANCE SECTION ========================
function AppearanceSection() {
  const [theme, setTheme] = useState<'obsidian' | 'void' | 'dusk'>('obsidian');
  const [accent, setAccent] = useState('gold');
  const [density, setDensity] = useState<'compact' | 'default' | 'spacious'>('default');
  const [fontSize, setFontSize] = useState(12);
  const [animations, setAnimations] = useState(true);
  const [scanlines, setScanlines] = useState(false);
  const [gridOverlay, setGridOverlay] = useState(false);

  const THEMES = [
    { id: 'obsidian', label: 'Obsidian', bg: 'linear-gradient(135deg,#08071a,#0c0b1c)', accent: '#f0b849' },
    { id: 'void', label: 'Void', bg: 'linear-gradient(135deg,#060609,#0a0a10)', accent: '#a78bfa' },
    { id: 'dusk', label: 'Dusk', bg: 'linear-gradient(135deg,#0d0c1a,#120f1e)', accent: '#22d3ee' },
  ];
  const ACCENTS = [
    { id: 'gold', c: '#F0B849', label: 'Gold' },
    { id: 'violet', c: '#A78BFA', label: 'Violet' },
    { id: 'cyan', c: '#22D3EE', label: 'Cyan' },
    { id: 'green', c: '#4ADE80', label: 'Matrix' },
    { id: 'rose', c: '#F87171', label: 'Rose' },
  ];

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        <StatCard label="Theme" value={theme.charAt(0).toUpperCase() + theme.slice(1)} color={T.gold} />
        <StatCard label="Accent" value={ACCENTS.find(a => a.id === accent)?.label ?? 'Gold'} color={ACCENTS.find(a => a.id === accent)?.c} />
      </div>

      <SectionDivider>Interface Theme</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        {THEMES.map(th => (
          <button key={th.id} onClick={() => setTheme(th.id as typeof theme)} style={{ padding: 0, border: 'none', cursor: 'pointer', borderRadius: 12, overflow: 'hidden', outline: `2px solid ${theme === th.id ? T.gold : 'transparent'}`, boxShadow: theme === th.id ? `0 0 24px rgba(240,184,73,0.22)` : 'none', transition: 'all 0.22s' }}>
            <div style={{ height: 64, background: th.bg, position: 'relative' }}>
              {[...Array(7)].map((_, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 15}%`, height: 1, background: 'rgba(255,255,255,0.035)' }} />)}
              <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10, display: 'flex', gap: 4 }}>
                {[2, 1, 1].map((f, i) => <div key={i} style={{ height: 3, flex: f, borderRadius: 2, background: i === 0 ? `${th.accent}cc` : 'rgba(255,255,255,0.1)' }} />)}
              </div>
            </div>
            <div style={{ padding: '8px 12px', background: T.bgCard, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label dim small>{th.label}</Label>
              {theme === th.id && <Check size={10} color={T.gold} />}
            </div>
          </button>
        ))}
      </div>

      <SectionDivider>Accent Color</SectionDivider>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {ACCENTS.map(a => (
          <button key={a.id} onClick={() => setAccent(a.id)} title={a.label} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', background: `${a.c}20`, outline: `2px solid ${accent === a.id ? a.c : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: accent === a.id ? 'scale(1.18)' : 'scale(1)', boxShadow: accent === a.id ? `0 0 18px ${a.c}60` : 'none', transition: 'all 0.2s' }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: a.c }} />
          </button>
        ))}
      </div>

      <SectionDivider>Interface Options</SectionDivider>
      <CardBox style={{ marginBottom: 22 }}>
        <Row title="Interface Density" desc="Controls global spacing rhythm">
          <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', outline: `1px solid rgba(255,255,255,0.09)` }}>
            {(['compact', 'default', 'spacious'] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)} style={Mono({ padding: '6px 12px', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'capitalize', background: density === d ? T.gold : 'transparent', color: density === d ? '#07060F' : T.textMut, transition: 'all 0.15s' })}>{d}</button>
            ))}
          </div>
        </Row>
        <Row title="Base Font Size" desc={`Terminal mono size: ${fontSize}px`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>−</button>
            <span style={Mono({ color: T.gold, fontSize: 13, width: 26, textAlign: 'center' })}>{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(18, f + 1))} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>+</button>
          </div>
        </Row>
        <Row title="Motion & Animations" desc="Smooth transitions, pulse effects"><Toggle on={animations} onChange={setAnimations} /></Row>
        <Row title="CRT Scanlines" desc="Retro terminal overlay effect"><Toggle on={scanlines} onChange={setScanlines} /></Row>
        <Row title="Grid Overlay" desc="Subtle background grid pattern" noBorder><Toggle on={gridOverlay} onChange={setGridOverlay} /></Row>
      </CardBox>
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 700)); }} />
    </div>
  );
}

// ======================== PRIVACY SECTION ========================
function PrivacySection() {
  const [twoFA, setTwoFA] = useState(false);
  const [pub, setPub] = useState(true);
  const [log, setLog] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [timeout_, setTimeout_] = useState('30');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const apiKeyDisplay = apiKey
    ? (showKey ? apiKey : apiKey.slice(0, 12) + '···············')
    : 'No token found';

  const copy = () => {
    if (apiKey) { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Security Score" value="82%" sub="Enable 2FA for 100%" color={T.gold} />
        <StatCard label="Active Sessions" value="3" sub="2 trusted devices" color={T.cyan} />
        <StatCard label="Last Login" value="Now" sub="Pune, IN · Chrome" color={T.green} />
      </div>

      <SectionDivider>Security</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <Row title="Two-Factor Authentication" desc="TOTP / SMS — POST /api/auth/session/validate/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {twoFA && <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.3)`, letterSpacing: '0.1em' })}>ENABLED</span>}
            <Toggle on={twoFA} onChange={setTwoFA} />
          </div>
        </Row>
        <Row title="Session Auto-Logout" desc="Inactivity timeout — refresh via POST /api/auth/refresh/">
          <select value={timeout_} onChange={e => setTimeout_(e.target.value)} className="s-input" style={{ width: 'auto', padding: '6px 12px', fontSize: 10 }}>
            {[['15', '15 min'], ['30', '30 min'], ['60', '1 hour'], ['240', '4 hours'], ['never', 'Never']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Row>
        <Row title="Active Sessions" desc="Manage devices — GET /api/auth/session/validate/" noBorder>
          <GhostBtn small><Eye size={11} /> View</GhostBtn>
        </Row>
      </CardBox>

      {/* Shows actual token from localStorage */}
      <SectionDivider>API Key — Bearer Token (Live from localStorage)</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={12} color={T.gold} />
              <Label>Authorization: Bearer ···</Label>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button className="s-copy-btn" onClick={() => setShowKey(!showKey)} style={Mono({ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 6, border: `1px solid rgba(240,184,73,.22)`, background: 'rgba(240,184,73,.07)', color: T.gold, fontSize: 9, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background .15s' })}>
                {showKey ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Reveal</>}
              </button>
              {showKey && apiKey && (
                <button className="s-copy-btn" onClick={copy} style={Mono({ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 6, border: `1px solid rgba(74,222,128,.22)`, background: 'rgba(74,222,128,.07)', color: T.green, fontSize: 9, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background .15s' })}>
                  {copied ? <><CheckCircle size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                </button>
              )}
              <GhostBtn small><RefreshCw size={10} /> Rotate</GhostBtn>
            </div>
          </div>
          <div style={Mono({ padding: '11px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', border: `1px solid rgba(255,255,255,0.07)`, fontSize: 11, color: showKey ? T.green : T.textMut, letterSpacing: showKey ? '0.02em' : '0.1em', wordBreak: 'break-all', lineHeight: 1.6 })}>
            {apiKeyDisplay}
          </div>
          <div style={Mono({ fontSize: 9, color: T.textMut, marginTop: 8 })}>
            Stored in: localStorage → access_token · Used as: Authorization: Bearer &lt;token&gt;
          </div>
        </div>
      </CardBox>

      <SectionDivider>Token Flow — POST /api/auth/refresh/</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label dim small>Request Body</Label>
              <div style={Mono({ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: `1px solid ${T.border}`, fontSize: 10, color: T.textMut, lineHeight: 1.8 })}>
                {'{'}<br />
                {'  '}<span style={{ color: T.cyan }}>"refresh_token"</span>{': '}<span style={{ color: T.green }}>{'"{refresh_token}"'}</span><br />
                {'}'}
              </div>
            </div>
            <div>
              <Label dim small>Response</Label>
              <div style={Mono({ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: `1px solid ${T.border}`, fontSize: 10, color: T.textMut, lineHeight: 1.8 })}>
                {'{'}<br />
                &nbsp;&nbsp;<span style={{ color: T.cyan }}>"access_token"</span>: <span style={{ color: T.green }}>"sk-sia-···"</span><br />
                {'}'}
              </div>
            </div>
          </div>
        </div>
      </CardBox>

      <SectionDivider>Privacy Controls</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <Row title="Public Agent Profile" desc="Let others discover your setup via /api/auth/profile/"><Toggle on={pub} onChange={setPub} /></Row>
        <Row title="Activity Logging" desc="Audit trail — linked to /api/tenants/ records"><Toggle on={log} onChange={setLog} /></Row>
        <Row title="Anonymous Usage Data" desc="Help improve agent performance models" noBorder><Toggle on={sharing} onChange={setSharing} /></Row>
      </CardBox>

      <SectionDivider>Data Export</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 18px' }}>
          <div style={Mono({ fontSize: 10, color: T.textMut, marginBottom: 14, lineHeight: 1.8 })}>
            Export all account data including agent configs, tenant settings, and processed document metadata.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <GhostBtn><Download size={11} /> JSON</GhostBtn>
            <GhostBtn><Download size={11} /> CSV</GhostBtn>
          </div>
        </div>
      </CardBox>
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 600)); }} />
    </div>
  );
}

// ======================== BILLING SECTION ========================
function BillingSection({ access, loading }: { access: AgentAccess; loading: boolean }) {
  const PLANS = [
    { id: 'starter', name: 'Starter', price: '$0', sub: '/mo', features: ['1 Agent', '100 docs/mo', 'Community support'], color: T.textMut },
    { id: 'pro', name: 'Pro', price: '$12', sub: '/mo', features: ['3 Agents', '5,000 docs/mo', 'Priority support', 'API access'], color: T.gold, active: true },
    { id: 'team', name: 'Team', price: '$49', sub: '/mo', features: ['Unlimited agents', 'Unlimited docs', 'Dedicated support', 'SSO + SAML'], color: T.cyan },
  ];
  const INVOICES = [
    { date: 'Feb 1, 2026', id: 'INV-2026-002', amount: '$12.00' },
    { date: 'Jan 1, 2026', id: 'INV-2026-001', amount: '$12.00' },
    { date: 'Dec 1, 2025', id: 'INV-2025-012', amount: '$12.00' },
  ];

  const activeAgents = [access.hr, access.marketing].filter(Boolean).length;

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Current Plan" value="Pro" color={T.gold} loading={loading} />
        <StatCard label="Monthly Cost" value="$12" sub="Renews Mar 1, 2026" color={T.cyan} loading={loading} />
        <StatCard label="Docs / Month" value="1,284" sub="of 5,000 limit" color={T.green} loading={loading} />
        <StatCard label="Active Agents" value={loading ? '···' : `${activeAgents}/3`} sub={[access.hr && 'HR', access.marketing && 'Marketing'].filter(Boolean).join(' · ') || '—'} color={T.purple} loading={loading} />
      </div>

      <SectionDivider>Plans</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        {PLANS.map(p => (
          <div key={p.id} className="s-plan-card" style={{ borderRadius: 14, padding: 20, border: `1px solid ${p.active ? p.color + '45' : T.border}`, background: p.active ? `${p.color}07` : T.bgCard, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
            {p.active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${p.color},transparent)` }} />}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <Label>{p.name}</Label>
              {p.active && <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.3)`, letterSpacing: '0.1em' })}>ACTIVE</span>}
            </div>
            <div style={Mono({ fontSize: 28, fontWeight: 600, color: p.active ? p.color : T.text, letterSpacing: '-0.5px', marginBottom: 5 })}>
              {p.price}<span style={{ fontSize: 12, fontWeight: 400, color: T.textMut }}>{p.sub}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18, marginTop: 12 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Check size={10} color={p.active ? p.color : T.textMut} />
                  <span style={Mono({ fontSize: 10, color: p.active ? T.textSec : T.textMut })}>{f}</span>
                </div>
              ))}
            </div>
            {p.active
              ? <div style={Mono({ textAlign: 'center', padding: 8, borderRadius: 8, border: `1px solid ${p.color}25`, color: `${p.color}50`, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' })}>Current Plan</div>
              : <GhostBtn><ChevronRight size={11} /> Switch Plan</GhostBtn>}
          </div>
        ))}
      </div>

      <SectionDivider>Payment & Billing</SectionDivider>
      <CardBox style={{ marginBottom: 16 }}>
        <Row title="Payment Method" desc="Visa •••• 4242  ·  Expires 08/27"><GhostBtn small>Update</GhostBtn></Row>
        <Row title="Billing Email" desc="invoices@company.com"><GhostBtn small>Change</GhostBtn></Row>
        <Row title="Billing Cycle" desc="Monthly · Renews March 1, 2026" noBorder><GhostBtn danger small><X size={10} /> Cancel</GhostBtn></Row>
      </CardBox>

      <SectionDivider>Invoice History</SectionDivider>
      <CardBox>
        {INVOICES.map((inv, i) => (
          <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: i < INVOICES.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={Mono({ fontSize: 11.5, color: T.textSec, fontWeight: 600 })}>{inv.date}</div>
              <div style={Mono({ fontSize: 9, color: T.textMut, marginTop: 2 })}>{inv.id} · Pro Plan</div>
            </div>
            <span style={Mono({ fontSize: 14, fontWeight: 600, color: T.text })}>{inv.amount}</span>
            <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.28)`, letterSpacing: '0.1em' })}>PAID</span>
            <button style={Mono({ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, fontSize: 9, fontWeight: 700 })}>PDF ↓</button>
          </div>
        ))}
      </CardBox>
    </div>
  );
}

// ======================== API EXPLORER SECTION ========================
function ApiExplorerSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const ENDPOINTS = [
    {
      section: 'Authentication', color: T.gold, items: [
        { m: 'POST' as const, path: '/api/auth/register/', body: '{ email, password, first_name, last_name }', desc: 'Create new user account' },
        { m: 'POST' as const, path: '/api/auth/login/', body: '{ email, password }', desc: 'Login → returns access_token + refresh_token' },
        { m: 'POST' as const, path: '/api/auth/refresh/', body: '{ refresh_token }', desc: 'Refresh expired access token' },
        { m: 'POST' as const, path: '/api/auth/logout/', body: 'Bearer token required', desc: 'Invalidate session' },
        { m: 'GET' as const, path: '/api/auth/profile/', body: '—', desc: 'Get user profile data' },
        { m: 'PUT' as const, path: '/api/auth/profile/update/', body: '{ first_name, last_name }', desc: 'Update profile' },
        { m: 'GET' as const, path: '/api/auth/access/', body: '—', desc: 'Check agent subscription access' },
        { m: 'GET' as const, path: '/api/auth/session/validate/', body: '—', desc: 'Validate current session token' },
      ],
    },
    {
      section: 'Chatbot (Public)', color: T.cyan, items: [
        { m: 'POST' as const, path: '/api/chat/', body: '{ message, session_id, user_name, user_email }', desc: 'Send chat message — no auth required' },
        { m: 'POST' as const, path: '/api/chat/update-info/', body: '{ session_id, user_name, user_email, company_name }', desc: 'Update visitor info' },
        { m: 'GET' as const, path: '/api/chat/session/{id}/', body: '—', desc: 'Get session info' },
        { m: 'POST' as const, path: '/api/chat/session/reset/', body: '{ session_id }', desc: 'Reset chat session' },
        { m: 'POST' as const, path: '/api/chat/session/close/', body: '{ session_id, delete_messages }', desc: 'Close session' },
      ],
    },
    {
      section: 'Agent Proxy (Authenticated)', color: T.purple, items: [
        { m: 'POST' as const, path: '/api/tenants/v2/agents/mark/chat/', body: '{ message, session_id, context }', desc: 'Chat with Marketing Agent (MARK)' },
        { m: 'POST' as const, path: '/api/tenants/v2/agents/hr/chat/', body: '{ message, session_id }', desc: 'Chat with HR Agent' },
        { m: 'GET' as const, path: '/api/tenants/v2/agents/status/', body: '—', desc: 'Check both agent statuses' },
      ],
    },
    {
      section: 'Waitlist', color: T.green, items: [
        { m: 'POST' as const, path: '/api/waitlist/join/', body: '{ email }', desc: 'Join the product waitlist' },
        { m: 'GET' as const, path: '/api/waitlist/stats/', body: '—', desc: 'Get waitlist statistics' },
      ],
    },
    {
      section: 'Admin — Tenant Management', color: T.red, items: [
        { m: 'GET' as const, path: '/api/tenants/', body: 'Admin auth required', desc: 'List all tenants' },
        { m: 'POST' as const, path: '/api/tenants/', body: '{ name, email, subscribed_agents, monthly_quota }', desc: 'Create new tenant' },
        { m: 'POST' as const, path: '/api/tenants/{tenant_id}/subscription/', body: '{ subscribed_agents, subscription_end }', desc: 'Update subscription' },
        { m: 'POST' as const, path: '/api/tenants/{tenant_id}/agents/', body: '{ agent_type, endpoint_url, timeout_seconds }', desc: 'Configure agent endpoint' },
      ],
    },
  ];

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Base URL" value="sia-backend" sub={BASE_URL} color={T.gold} />
        <StatCard label="Endpoints" value="20" sub="across 5 groups" color={T.cyan} />
        <StatCard label="Auth Type" value="JWT" sub="Bearer token in header" color={T.purple} />
      </div>

      {ENDPOINTS.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 20 }}>
          <SectionDivider>{group.section}</SectionDivider>
          <CardBox>
            {group.items.map((ep, ei) => (
              <div key={ei} style={{ padding: '12px 16px', borderBottom: ei < group.items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <ApiMethodTag method={ep.m} />
                  <span style={Mono({ fontSize: 10.5, color: group.color + 'cc', flex: 1 })}>{ep.path}</span>
                  <button onClick={() => copy(`${BASE_URL}${ep.path}`, `${gi}-${ei}`)} style={Mono({ background: 'none', border: 'none', cursor: 'pointer', color: copied === `${gi}-${ei}` ? T.green : T.textMut, fontSize: 9, display: 'flex', alignItems: 'center', gap: 4, transition: 'color .15s' })}>
                    {copied === `${gi}-${ei}` ? <><CheckCircle size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={Mono({ fontSize: 9, color: T.textMut })}>{ep.desc}</span>
                  <span style={Mono({ fontSize: 9, color: 'rgba(34,211,238,0.45)', marginLeft: 'auto' })}>body: {ep.body}</span>
                </div>
              </div>
            ))}
          </CardBox>
        </div>
      ))}
    </div>
  );
}

// ======================== NAV ========================
const S_NAV: { id: SettingsSection; label: string; sub: string; Icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', sub: 'Identity & agents', Icon: User },
  { id: 'notifications', label: 'Alerts', sub: 'Events & channels', Icon: Bell },
  { id: 'appearance', label: 'Appearance', sub: 'Theme & display', Icon: Palette },
  { id: 'privacy', label: 'Privacy', sub: 'Security & keys', Icon: Shield },
  { id: 'billing', label: 'Billing', sub: 'Plans & invoices', Icon: CreditCard },
  { id: 'api', label: 'API Explorer', sub: 'All 20 endpoints', Icon: Terminal },
];

// ======================== MAIN EXPORT ========================
export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const [active, setActive] = useState<SettingsSection>('profile');
  const [profile, setProfile] = useState<UserProfile>({ first_name: 'Alex', last_name: 'Johnson', email: 'alex.johnson@company.com', role: 'Head of Operations' });
  const [access, setAccess] = useState<AgentAccess>({ hr: true, marketing: true, hr_subscription: { plan: 'Pro', renews: 'Jan 15, 2026', status: 'ACTIVE' }, marketing_subscription: { plan: 'Pro', renews: 'Jan 15, 2026', status: 'ACTIVE' } });
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ mark: { status: 'ACTIVE', active: true }, hr: { status: 'ACTIVE', active: true } });
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [p, a, s] = await Promise.all([
        apiFetch('/api/auth/profile/'),
        apiFetch('/api/auth/access/'),
        apiFetch('/api/tenants/v2/agents/status/'),
      ]);

      setProfile({
        first_name: p.first_name ?? 'Alex',
        last_name: p.last_name ?? 'Johnson',
        email: p.email ?? '',
        role: p.role ?? 'Head of Operations',
      });

      setAccess({
        hr: a.hr ?? a.has_hr ?? false,
        marketing: a.marketing ?? a.has_marketing ?? false,
        hr_subscription: a.hr_subscription ?? (a.hr ? { plan: 'Pro', renews: '—', status: 'ACTIVE' } : undefined),
        marketing_subscription: a.marketing_subscription ?? (a.marketing ? { plan: 'Pro', renews: '—', status: 'ACTIVE' } : undefined),
      });

      setAgentStatus({
        mark: s.mark ?? { status: s.marketing_status ?? 'Unknown', active: s.marketing_active ?? false },
        hr: s.hr ?? { status: s.hr_status ?? 'Unknown', active: s.hr_active ?? false },
      });

      setApiOnline(true);
    } catch (e: any) {
      const msg = e?.message ?? '';
      // Try token refresh on 401
      if (msg.includes('401')) {
        const newToken = await refreshToken();
        if (newToken) { loadAll(); return; }
      }
      setApiError(msg || 'Network error');
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const SECTIONS: Record<SettingsSection, React.ReactElement> = {
    profile: <ProfileSection profile={profile} setProfile={setProfile} access={access} agentStatus={agentStatus} apiOnline={apiOnline} loading={loading} />,
    notifications: <NotificationsSection />,
    appearance: <AppearanceSection />,
    privacy: <PrivacySection />,
    billing: <BillingSection access={access} loading={loading} />,
    api: <ApiExplorerSection />,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: T.mono, background: T.bg, ...(onBack ? {} : { minHeight: '100vh' }) }}>
      <style>{KEYFRAMES}</style>

      {/* ── Sidebar ── */}
      <nav style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}`, background: `linear-gradient(180deg, ${T.bgCard}, ${T.bg})`, padding: '18px 12px', gap: 2, position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,rgba(240,184,73,0.35),transparent)` }} />

        {onBack && (
          <button onClick={onBack} style={Mono({ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px', marginBottom: 14, borderRadius: 8, transition: 'color .15s', width: '100%' })}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.textSec; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMut; }}>
            <ArrowLeft size={12} /> Dashboard
          </button>
        )}

        <div style={{ padding: '0 10px', marginBottom: 10 }}>
          <Label dim>Settings</Label>
        </div>

        {S_NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} className="s-nav-item" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: isActive ? 'rgba(240,184,73,0.1)' : 'transparent', border: `1px solid ${isActive ? 'rgba(240,184,73,0.32)' : 'transparent'}`, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'rgba(240,184,73,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? 'rgba(240,184,73,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
                <item.Icon size={13} color={isActive ? T.gold : T.textMut} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={Mono({ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: isActive ? T.gold : T.textSec, textTransform: 'uppercase' })}>{item.label}</div>
                <div style={Mono({ fontSize: 8.5, color: T.textMut, marginTop: 1 })}>{item.sub}</div>
              </div>
              <ChevronRight size={11} color={isActive ? T.gold : 'transparent'} style={{ flexShrink: 0, transition: 'color .15s' }} />
            </button>
          );
        })}

        {/* API status + retry */}
        <div style={{ marginTop: 'auto', padding: '12px 10px 4px' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <StatusDot active={apiOnline} animate={false} />
              <span style={Mono({ fontSize: 8.5, color: apiOnline ? 'rgba(74,222,128,0.5)' : T.textMut })}>
                {loading ? 'Connecting···' : apiOnline ? 'Live' : 'Demo Mode'}
              </span>
            </div>
            {!loading && !apiOnline && (
              <button onClick={loadAll} style={Mono({ background: 'none', border: `1px solid rgba(240,184,73,.2)`, borderRadius: 4, color: T.gold, fontSize: 8, padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.06em' })}>↺ Retry</button>
            )}
          </div>
          <div style={Mono({ fontSize: 7.5, color: T.textMut, marginTop: 4, wordBreak: 'break-all' })}>{BASE_URL}</div>
          {apiError && <div style={Mono({ fontSize: 7.5, color: 'rgba(248,113,113,0.5)', marginTop: 3 })}>{apiError.slice(0, 50)}</div>}
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="s-scroll" style={{ flex: 1, overflowY: 'auto', padding: '30px 34px', position: 'relative' }}>
        <div style={{ position: 'fixed', top: 0, right: 0, width: 350, height: 350, pointerEvents: 'none', background: 'radial-gradient(circle at top right,rgba(240,184,73,0.04),transparent 70%)' }} />
        <div style={{ position: 'fixed', bottom: 0, left: 220, width: 280, height: 280, pointerEvents: 'none', background: 'radial-gradient(circle at bottom left,rgba(34,211,238,0.03),transparent 70%)' }} />

        <div key={active} style={{ maxWidth: 820, animation: 's-fadeUp 0.3s ease' }}>
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: T.gold, boxShadow: `0 0 10px ${T.gold}`, animation: 's-glow 2.5s ease infinite' }} />
              <Label dim>{S_NAV.find(n => n.id === active)?.sub}</Label>
            </div>
            <h1 style={Mono({ fontSize: 26, fontWeight: 600, color: T.text, margin: 0, letterSpacing: '-0.4px' })}>
              {S_NAV.find(n => n.id === active)?.label}
            </h1>
          </div>

          {SECTIONS[active]}
        </div>
      </main>
    </div>
  );
}