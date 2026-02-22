'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  isAuthenticated, fetchProfile, fetchAdminStats, fetchAdminUsers,
  fetchAdminTenants, fetchAdminLogs, updateUserStatus, assignUserTenant,
  createTenant, updateTenant, createApiKey, apiFetch,
  type UserProfile,
} from '@/lib/api';

// ======================== DESIGN TOKENS ========================
const C = {
  bg: '#060612',
  bgCard: 'rgba(139, 92, 246, 0.05)',
  bgCardHover: 'rgba(139, 92, 246, 0.10)',
  border: 'rgba(139, 92, 246, 0.15)',
  borderHover: 'rgba(139, 92, 246, 0.30)',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(139, 92, 246, 0.15)',
  gold: '#F5A623',
  goldDim: 'rgba(245, 166, 35, 0.12)',
  green: '#22C55E',
  greenDim: 'rgba(34, 197, 94, 0.12)',
  red: '#EF4444',
  redDim: 'rgba(239, 68, 68, 0.12)',
  blue: '#3B82F6',
  blueDim: 'rgba(59, 130, 246, 0.12)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.75)',
  textMut: 'rgba(255,255,255,0.45)',
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

type Tab = 'overview' | 'users' | 'tenants' | 'logs';

const SUB_TYPE_LABELS: Record<string, string> = {
  none: 'No Access', mark: 'MARK Only', hr: 'HR Only', both: 'Both Agents',
};
const SUB_STATUS_COLORS: Record<string, string> = {
  active: C.green, trial: C.gold, suspended: C.red, cancelled: C.textMut,
};

// ======================== HELPERS ========================
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 5,
      background: color + '22', color,
    }}>
      {label}
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`,
      padding: '16px 18px', ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card>
      <div style={{ fontSize: 10, color: C.textMut, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textMut, marginTop: 5 }}>{sub}</div>}
    </Card>
  );
}

// ======================== CREATE TENANT MODAL ========================
function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    subscription_type: 'none', subscription_status: 'active',
    duration_months: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const now = new Date();
      let subscription_start: string | undefined;
      let subscription_end: string | undefined;
      const months = parseInt(form.duration_months, 10);
      if (form.subscription_type !== 'none' && !isNaN(months) && months > 0) {
        subscription_start = now.toISOString();
        const end = new Date(now);
        end.setMonth(end.getMonth() + months);
        subscription_end = end.toISOString();
      }
      await createTenant({
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        subscription_type: form.subscription_type,
        subscription_status: form.subscription_status,
        subscription_start,
        subscription_end,
        notes: form.notes || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create tenant');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '8px 11px', borderRadius: 8, fontSize: 12,
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
    color: C.text, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: C.textMut, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 480, background:'#0E0C1D', border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:14, fontWeight:800 }}>Create Tenant</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {error && (
            <div style={{ padding:'8px 12px', borderRadius:8, background:C.redDim, border:`1px solid ${C.red}44`, color:C.red, fontSize:11 }}>{error}</div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input style={fieldStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={fieldStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@acme.com" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={fieldStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0100" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Subscription Type</label>
              <select style={fieldStyle} value={form.subscription_type} onChange={e => setForm(f => ({ ...f, subscription_type: e.target.value }))}>
                <option value="none">None</option>
                <option value="mark">MARK Only</option>
                <option value="hr">HR Only</option>
                <option value="both">Both Agents</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={fieldStyle} value={form.subscription_status} onChange={e => setForm(f => ({ ...f, subscription_status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {form.subscription_type !== 'none' && (
            <div>
              <label style={labelStyle}>Duration (months) <span style={{ color: C.textMut, fontWeight: 400, textTransform: 'none', fontSize: 9 }}>— leave blank for no expiry</span></label>
              <input
                style={fieldStyle}
                type="number" min="1" max="120"
                value={form.duration_months}
                onChange={e => setForm(f => ({ ...f, duration_months: e.target.value }))}
                placeholder="e.g. 12 for 1 year"
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...fieldStyle, resize:'vertical', minHeight:60 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." />
          </div>
        </div>
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, background:'none', border:`1px solid ${C.border}`, color:C.textMut, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ padding:'8px 20px', borderRadius:8, fontSize:12, fontWeight:700, background:`linear-gradient(135deg, ${C.purple}, #7c3aed)`, border:'none', color:'#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creating...' : 'Create Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== CREATE API KEY MODAL ========================
function CreateApiKeyModal({ tenantId, tenantName, onClose }: { tenantId: string; tenantName: string; onClose: () => void }) {
  const [name, setName]     = useState('');
  const [saving, setSaving] = useState(false);
  const [key, setKey]       = useState<string | null>(null);
  const [error, setError]   = useState('');

  const handleCreate = async () => {
    if (!name) { setError('Key name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await createApiKey(tenantId, { name });
      // Raw key is in res.raw_key or res.key — shown once
      setKey(res?.raw_key ?? res?.key ?? res?.api_key ?? JSON.stringify(res));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create key');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width:'100%', padding:'8px 11px', borderRadius:8, fontSize:12,
    background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`,
    color:C.text, outline:'none', boxSizing:'border-box',
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget && !key) onClose(); }}>
      <div style={{ width:440, background:'#0E0C1D', border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800 }}>Create API Key</div>
            <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{tenantName}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {error && (
            <div style={{ padding:'8px 12px', borderRadius:8, background:C.redDim, border:`1px solid ${C.red}44`, color:C.red, fontSize:11 }}>{error}</div>
          )}
          {key ? (
            <div>
              <div style={{ padding:'10px 14px', borderRadius:10, background:C.greenDim, border:`1px solid ${C.green}44`, marginBottom:12 }}>
                <div style={{ fontSize:10, color:C.green, fontWeight:700, marginBottom:6 }}>Key created — copy it now. It will not be shown again.</div>
                <div style={{ fontFamily:'monospace', fontSize:12, color:C.text, wordBreak:'break-all', background:'rgba(0,0,0,0.4)', padding:'8px 10px', borderRadius:7 }}>{key}</div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(key); }} style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:700, background:C.greenDim, border:`1px solid ${C.green}44`, color:C.green, cursor:'pointer', width:'100%' }}>
                Copy to Clipboard
              </button>
            </div>
          ) : (
            <div>
              <label style={{ fontSize:10, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4, display:'block' }}>Key Name</label>
              <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Widget, Mobile App" />
            </div>
          )}
        </div>
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, background:'none', border:`1px solid ${C.border}`, color:C.textMut, cursor:'pointer' }}>
            {key ? 'Done' : 'Cancel'}
          </button>
          {!key && (
            <button onClick={handleCreate} disabled={saving} style={{ padding:'8px 20px', borderRadius:8, fontSize:12, fontWeight:700, background:`linear-gradient(135deg, ${C.purple}, #7c3aed)`, border:'none', color:'#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating...' : 'Generate Key'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================== ASSIGN TENANT MODAL ========================
function AssignTenantModal({
  userId, userName, currentTenantId, onClose, onAssigned,
}: {
  userId: string; userName: string; currentTenantId: string | null;
  onClose: () => void; onAssigned: () => void;
}) {
  const [tenants, setTenants]         = useState<any[]>([]);
  const [selectedId, setSelectedId]   = useState<string>(currentTenantId ?? '');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    fetchAdminTenants().then(setTenants).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await assignUserTenant(userId, selectedId || null);
      onAssigned();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to assign tenant');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '8px 11px', borderRadius: 8, fontSize: 12,
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
    color: C.text, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 420, background:'#0E0C1D', border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800 }}>Assign Tenant</div>
            <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{userName}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {error && (
            <div style={{ padding:'8px 12px', borderRadius:8, background:C.redDim, border:`1px solid ${C.red}44`, color:C.red, fontSize:11 }}>{error}</div>
          )}
          <div>
            <label style={{ fontSize:10, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4, display:'block' }}>
              Select Tenant
            </label>
            <select style={fieldStyle} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">— No Tenant (remove access) —</option>
              {tenants.map((t: any) => (
                <option key={t.tenant_id} value={t.tenant_id}>
                  {t.name} ({SUB_TYPE_LABELS[t.subscription_type] ?? t.subscription_type} · {t.subscription_status})
                </option>
              ))}
            </select>
          </div>
          {selectedId && (
            <div style={{ padding:'8px 12px', borderRadius:8, background:C.purpleDim, border:`1px solid ${C.border}`, fontSize:11, color:C.textSec }}>
              User will get access to agents based on the selected tenant&apos;s subscription.
            </div>
          )}
        </div>
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, background:'none', border:`1px solid ${C.border}`, color:C.textMut, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding:'8px 20px', borderRadius:8, fontSize:12, fontWeight:700, background:`linear-gradient(135deg, ${C.purple}, #7c3aed)`, border:'none', color:'#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== MAIN ADMIN PAGE ========================
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Data state
  const [stats, setStats]     = useState<any>(null);
  const [users, setUsers]     = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [logs, setLogs]       = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // UI state
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [keyModal, setKeyModal] = useState<{ tenantId: string; tenantName: string } | null>(null);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [tenantKeys, setTenantKeys] = useState<Record<string, any[]>>({});
  const [assignModal, setAssignModal] = useState<{ userId: string; userName: string; currentTenantId: string | null } | null>(null);

  // Auth check — must be super_admin
  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return; }
    fetchProfile().then(p => {
      setAdminProfile(p);
      if (p.role !== 'super_admin') { setAccessDenied(true); }
    }).catch(() => router.replace('/')).finally(() => setLoading(false));
  }, [router]);

  // Load overview stats whenever tab changes to overview
  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'tenants') loadTenants();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab]);

  const loadStats = async () => {
    try { setStats(await fetchAdminStats()); } catch {}
  };
  const loadUsers = async () => {
    setDataLoading(true);
    try { setUsers(await fetchAdminUsers()); } catch {} finally { setDataLoading(false); }
  };
  const loadTenants = async () => {
    setDataLoading(true);
    try { setTenants(await fetchAdminTenants()); } catch {} finally { setDataLoading(false); }
  };
  const loadLogs = async () => {
    setDataLoading(true);
    try { setLogs(await fetchAdminLogs()); } catch {} finally { setDataLoading(false); }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch {}
  };

  const loadTenantKeys = async (tenantId: string) => {
    try {
      const res = await apiFetch(`/api/auth/admin/tenants/${tenantId}/keys/`);
      // Backend: { success, keys: [...] }
      const keys = res?.keys ?? res?.data ?? [];
      setTenantKeys(prev => ({ ...prev, [tenantId]: Array.isArray(keys) ? keys : [] }));
    } catch {}
  };

  const revokeKey = async (tenantId: string, keyId: string) => {
    try {
      await apiFetch(`/api/auth/admin/tenants/${tenantId}/keys/${keyId}/revoke/`, { method: 'POST' });
      loadTenantKeys(tenantId);
    } catch {}
  };

  const toggleTenantExpand = (tenantId: string) => {
    if (expandedTenant === tenantId) {
      setExpandedTenant(null);
    } else {
      setExpandedTenant(tenantId);
      if (!tenantKeys[tenantId]) loadTenantKeys(tenantId);
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users',    label: 'Users' },
    { id: 'tenants',  label: 'Tenants' },
    { id: 'logs',     label: 'Request Logs' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT, color:C.text }}>
        <div style={{ fontSize:13, color:C.textMut }}>Loading...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT, color:C.text, flexDirection:'column', gap:12 }}>
        <div style={{ fontSize:48 }}>🔒</div>
        <div style={{ fontSize:18, fontWeight:800 }}>Access Denied</div>
        <div style={{ fontSize:12, color:C.textMut }}>This page is restricted to super administrators.</div>
        <button onClick={() => router.push('/platform')} style={{ marginTop:8, padding:'9px 20px', borderRadius:10, fontSize:12, fontWeight:700, background:C.purpleDim, border:`1px solid ${C.border}`, color:C.purpleLight, cursor:'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, color:C.text }}>
      {/* Modals */}
      {showCreateTenant && (
        <CreateTenantModal
          onClose={() => setShowCreateTenant(false)}
          onCreated={loadTenants}
        />
      )}
      {keyModal && (
        <CreateApiKeyModal
          tenantId={keyModal.tenantId}
          tenantName={keyModal.tenantName}
          onClose={() => { setKeyModal(null); if (expandedTenant) loadTenantKeys(expandedTenant); }}
        />
      )}

      {assignModal && (
        <AssignTenantModal
          userId={assignModal.userId}
          userName={assignModal.userName}
          currentTenantId={assignModal.currentTenantId}
          onClose={() => setAssignModal(null)}
          onAssigned={loadUsers}
        />
      )}

      {/* Header */}
      <div style={{ padding:'0 32px', borderBottom:`1px solid ${C.border}`, background:'rgba(6,6,18,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => router.push('/platform')} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, display:'flex', alignItems:'center', gap:4, fontSize:12, padding:'4px 8px', borderRadius:6, transition:'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}>
              ← Dashboard
            </button>
            <span style={{ color:C.border }}>|</span>
            <div>
              <span style={{ fontSize:15, fontWeight:800 }}>Admin Portal</span>
              <span style={{ marginLeft:8, fontSize:9, fontWeight:700, color:C.purpleLight, background:C.purpleDim, padding:'2px 7px', borderRadius:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>Super Admin</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.textMut }}>
            {adminProfile?.full_name} · {adminProfile?.email}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding:'10px 16px', fontSize:12, fontWeight:600, background:'none', border:'none', cursor:'pointer', color: activeTab === t.id ? C.purpleLight : C.textMut, borderBottom: activeTab === t.id ? `2px solid ${C.purple}` : '2px solid transparent', transition:'all 0.15s', marginBottom:-1 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 32px' }}>

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              <StatCard label="Total Users"      value={stats?.total_users ?? '—'}           sub="All registered"        color={C.purpleLight} />
              <StatCard label="Active Subs"      value={stats?.active_subscriptions ?? '—'}  sub="Active & trial"        color={C.green} />
              <StatCard label="Tenants"          value={stats?.total_tenants ?? '—'}         sub="Companies"             color={C.gold} />
              <StatCard label="Agent Requests"   value={stats?.total_api_requests ?? '—'}    sub="All time"              color={C.blue} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:14, color:C.purpleLight }}>Subscription Breakdown</div>
                {stats?.subscriptions_by_type ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {Object.entries(stats.subscriptions_by_type).map(([type, count]) => (
                      <div key={type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:11, color:C.textSec }}>{SUB_TYPE_LABELS[type] ?? type}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:C.textMut }}>No data available</div>
                )}
              </Card>
              <Card>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:14, color:C.gold }}>Today's Activity</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:C.textSec }}>Requests Today</span>
                    <span style={{ fontSize:20, fontWeight:800, color:C.gold }}>{stats?.requests_today ?? '—'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:C.textSec }}>Total API Requests</span>
                    <span style={{ fontSize:20, fontWeight:800, color:C.blue }}>{stats?.total_api_requests ?? '—'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:C.textSec }}>Active Subscriptions</span>
                    <span style={{ fontSize:20, fontWeight:800, color:C.green }}>{stats?.active_subscriptions ?? '—'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ===== USERS ===== */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>All Users <span style={{ fontSize:12, fontWeight:500, color:C.textMut }}>({users.length})</span></div>
              <button onClick={loadUsers} style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:C.purpleDim, border:`1px solid ${C.border}`, color:C.purpleLight, cursor:'pointer' }}>
                Refresh
              </button>
            </div>
            {dataLoading ? (
              <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>Loading users...</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {/* Header row */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1.4fr 0.8fr 1.6fr', gap:10, padding:'6px 12px', fontSize:9, fontWeight:700, color:C.textMut, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  <span>User</span><span>Email</span><span>Role</span><span>Tenant</span><span>Status</span><span>Actions</span>
                </div>
                {users.map(u => (
                  <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1.4fr 0.8fr 1.6fr', gap:10, padding:'10px 12px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, alignItems:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.full_name || '—'}</div>
                    <div style={{ fontSize:10, color:C.textSec, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                    <div>
                      {u.role === 'super_admin'
                        ? <Badge label="Admin" color={C.purple} />
                        : <Badge label="User" color={C.textMut} />}
                    </div>
                    <div style={{ fontSize:10, color:C.textSec, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.tenant?.name ?? <span style={{ color:C.textMut }}>No tenant</span>}
                    </div>
                    <div>
                      <Badge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? C.green : C.red} />
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <button
                        onClick={() => setAssignModal({ userId: u.id, userName: u.full_name || u.email, currentTenantId: u.tenant?.id ?? null })}
                        style={{ padding:'5px 8px', borderRadius:7, fontSize:10, fontWeight:600, background:C.purpleDim, border:`1px solid ${C.border}`, color:C.purpleLight, cursor:'pointer' }}>
                        Assign
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        style={{ padding:'5px 8px', borderRadius:7, fontSize:10, fontWeight:600, background: u.is_active ? C.redDim : C.greenDim, border:`1px solid ${u.is_active ? C.red + '44' : C.green + '44'}`, color: u.is_active ? C.red : C.green, cursor:'pointer' }}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>No users found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== TENANTS ===== */}
        {activeTab === 'tenants' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>Tenants <span style={{ fontSize:12, fontWeight:500, color:C.textMut }}>({tenants.length})</span></div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={loadTenants} style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:C.purpleDim, border:`1px solid ${C.border}`, color:C.purpleLight, cursor:'pointer' }}>
                  Refresh
                </button>
                <button onClick={() => setShowCreateTenant(true)} style={{ padding:'7px 16px', borderRadius:8, fontSize:11, fontWeight:700, background:`linear-gradient(135deg, ${C.purple}, #7c3aed)`, border:'none', color:'#fff', cursor:'pointer' }}>
                  + Create Tenant
                </button>
              </div>
            </div>
            {dataLoading ? (
              <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>Loading tenants...</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {tenants.map(t => (
                  <div key={t.tenant_id}>
                    <div style={{ borderRadius:12, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                      <div
                        style={{ padding:'12px 16px', display:'grid', gridTemplateColumns:'2fr 1.5fr 1.2fr 1.2fr 1fr', gap:12, alignItems:'center', cursor:'pointer' }}
                        onClick={() => toggleTenantExpand(t.tenant_id)}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{t.name}</div>
                          <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{t.email}</div>
                        </div>
                        <div style={{ fontSize:10, color:C.textSec }}>{SUB_TYPE_LABELS[t.subscription_type] ?? t.subscription_type}</div>
                        <div>
                          <Badge
                            label={t.subscription_status}
                            color={SUB_STATUS_COLORS[t.subscription_status] ?? C.textMut}
                          />
                        </div>
                        <div style={{ fontSize:10, color:C.textMut }}>{t.member_count ?? 0} member{t.member_count !== 1 ? 's' : ''}</div>
                        <div style={{ display:'flex', justifyContent:'flex-end' }}>
                          <span style={{ color:C.textMut, fontSize:12 }}>{expandedTenant === t.tenant_id ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {expandedTenant === t.tenant_id && (
                        <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}`, background:'rgba(0,0,0,0.15)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:C.textMut }}>API Keys</span>
                            <button
                              onClick={() => setKeyModal({ tenantId: t.tenant_id, tenantName: t.name })}
                              style={{ padding:'5px 12px', borderRadius:7, fontSize:10, fontWeight:700, background:C.goldDim, border:`1px solid ${C.gold}44`, color:C.gold, cursor:'pointer' }}>
                              + New Key
                            </button>
                          </div>
                          {(tenantKeys[t.tenant_id] ?? []).length === 0 ? (
                            <div style={{ fontSize:10, color:C.textMut, padding:'8px 0' }}>No API keys created yet.</div>
                          ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                              {(tenantKeys[t.tenant_id] ?? []).map((k: any) => (
                                <div key={k.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}` }}>
                                  <div>
                                    <span style={{ fontSize:11, fontWeight:600 }}>{k.name}</span>
                                    <span style={{ marginLeft:8, fontSize:9, color:C.textMut, fontFamily:'monospace' }}>{k.key_prefix}...</span>
                                  </div>
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Badge label={k.is_active ? 'Active' : 'Revoked'} color={k.is_active ? C.green : C.red} />
                                    {k.is_active && (
                                      <button onClick={() => revokeKey(t.tenant_id, k.id)} style={{ padding:'3px 8px', borderRadius:6, fontSize:9, fontWeight:700, background:C.redDim, border:`1px solid ${C.red}44`, color:C.red, cursor:'pointer' }}>
                                        Revoke
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tenants.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>No tenants found. Create one to get started.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== LOGS ===== */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>Request Logs <span style={{ fontSize:12, fontWeight:500, color:C.textMut }}>last 100</span></div>
              <button onClick={loadLogs} style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:C.purpleDim, border:`1px solid ${C.border}`, color:C.purpleLight, cursor:'pointer' }}>
                Refresh
              </button>
            </div>
            {dataLoading ? (
              <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>Loading logs...</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr', gap:10, padding:'6px 12px', fontSize:9, fontWeight:700, color:C.textMut, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  <span>Agent</span><span>Status</span><span>User</span><span>Code</span><span>Response</span><span>Time</span>
                </div>
                {logs.map((log: any, i: number) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr', gap:10, padding:'9px 12px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, alignItems:'center', fontSize:11 }}>
                    <span style={{ color:C.textSec, textTransform:'uppercase', fontSize:10, fontWeight:700 }}>{log.agent_type ?? '—'}</span>
                    <Badge label={log.status ?? 'ok'} color={log.status === 'error' ? C.red : C.green} />
                    <span style={{ color:C.textMut, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:10 }}>{log.user_email ?? '—'}</span>
                    <span style={{ color:C.textMut, fontSize:10 }}>{log.status_code ?? '—'}</span>
                    <span style={{ color:C.textMut, fontSize:10 }}>{log.response_time_ms != null ? `${log.response_time_ms}ms` : '—'}</span>
                    <span style={{ color:C.textMut, fontSize:10 }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:C.textMut, fontSize:12 }}>No request logs yet.</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
