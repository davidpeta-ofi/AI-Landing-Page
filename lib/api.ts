// ============================================================
// SIA — Shared API utility
// All API calls go through here to keep token handling central
// ============================================================

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── token helpers ──────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('sia_auth_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getStoredUser(): { name: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sia_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── refresh token ──────────────────────────────────────────
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken =
      data?.data?.access_token ?? data?.access_token ?? null;
    if (newToken) localStorage.setItem('access_token', newToken);
    return newToken;
  } catch {
    return null;
  }
}

// ── core fetch ─────────────────────────────────────────────
// Returns parsed JSON. Throws on non-2xx.
// Auto-refreshes on 401 once.
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  _retry = true,
): Promise<any> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401 && _retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch(path, options, false);
    clearAuth();
    throw new Error('401: Session expired');
  }

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) {
        errMsg = body.error;
      } else if (body?.detail) {
        errMsg = body.detail;
      } else if (body?.message) {
        errMsg = body.message;
      } else if (body?.errors && typeof body.errors === 'object') {
        // Django validation errors: { field: ["msg1", "msg2"] }
        const parts = Object.entries(body.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        errMsg = parts || errMsg;
      }
    } catch {
      const text = await res.text().catch(() => '');
      if (text) errMsg = text.substring(0, 300);
    }
    throw new Error(errMsg);
  }
  return res.json();
}

// ── typed API helpers ──────────────────────────────────────

export interface UserProfile {
  id: string;
  supabase_uid: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'super_admin';
  tenant: {
    id: string;
    name: string;
    subscription_type: 'none' | 'mark' | 'hr' | 'both';
    subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled';
  } | null;
  is_active: boolean;
  email_confirmed: boolean;
  can_access_mark: boolean;
  can_access_hr: boolean;
  accessible_agents: string[];
  created_at: string;
}

export interface AgentStatus {
  can_access_mark: boolean;
  can_access_hr: boolean;
  accessible_agents: string[];
  tenant: UserProfile['tenant'];
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await apiFetch('/api/auth/profile/');
  return res?.data ?? res;
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
}): Promise<UserProfile> {
  const res = await apiFetch('/api/auth/profile/update/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res?.data ?? res;
}

export async function fetchAgentStatus(): Promise<AgentStatus> {
  const res = await apiFetch('/api/agents/status/');
  return res?.data ?? res;
}

export async function chatWithAgent(
  agentType: 'mark' | 'hr',
  message: string,
  sessionId?: string,
): Promise<{ response: string; session_id: string }> {
  const res = await apiFetch(`/api/agents/${agentType}/chat/`, {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  const d = res?.data ?? res;
  // Handle various response shapes from external agents
  return {
    response:
      d?.response ??
      d?.message ??
      d?.reply ??
      d?.text ??
      d?.content ??
      'No response from agent.',
    session_id: d?.session_id ?? sessionId ?? '',
  };
}

// ── Admin API helpers ──────────────────────────────────────

export async function fetchAdminStats() {
  const res = await apiFetch('/api/auth/admin/stats/');
  // Backend: { success, data: { ... } }
  return res?.data ?? res;
}

export async function fetchAdminUsers(): Promise<any[]> {
  const res = await apiFetch('/api/auth/admin/users/');
  // Backend: { success, count, users: [...] }
  const list = res?.users ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
}

export async function fetchAdminTenants(): Promise<any[]> {
  const res = await apiFetch('/api/auth/admin/tenants/');
  // Backend: { success, count, tenants: [...] }
  const list = res?.tenants ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
}

export async function fetchAdminLogs(): Promise<any[]> {
  const res = await apiFetch('/api/auth/admin/logs/');
  // Backend: { success, count, logs: [...] }
  const list = res?.logs ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
) {
  const res = await apiFetch(
    `/api/auth/admin/users/${userId}/status/`,
    { method: 'PATCH', body: JSON.stringify({ is_active: isActive }) },
  );
  return res?.data ?? res;
}

export async function assignUserTenant(
  userId: string,
  tenantId: string | null,
) {
  const res = await apiFetch(
    `/api/auth/admin/users/${userId}/tenant/`,
    { method: 'PATCH', body: JSON.stringify({ tenant_id: tenantId }) },
  );
  return res?.data ?? res;
}

export async function createTenant(data: {
  name: string;
  email: string;
  phone?: string;
  subscription_type: string;
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  rate_limit_per_minute?: number;
  monthly_quota?: number;
  notes?: string;
}) {
  const res = await apiFetch('/api/auth/admin/tenants/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res?.data ?? res;
}

export async function updateTenant(tenantId: string, data: object) {
  const res = await apiFetch(`/api/auth/admin/tenants/${tenantId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res?.data ?? res;
}

export async function createApiKey(
  tenantId: string,
  data: { name: string; expires_at?: string },
) {
  // Backend: { success, message, key: "sia_...", key_id, prefix }
  const res = await apiFetch(
    `/api/auth/admin/tenants/${tenantId}/keys/`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res; // raw — caller reads res.key for the full key
}
