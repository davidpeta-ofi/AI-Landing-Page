'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BASE_URL } from '@/lib/api';

/**
 * /reset-password?token=<token>
 *
 * Landing page for the set-password / password-reset link emailed by the SIA
 * backend (invite_users and the "forgot password" flow both point here).
 * Reads the token from the URL, lets the user choose a password, and POSTs to
 *   POST {NEXT_PUBLIC_API_URL}/api/auth/password/reset/confirm/
 *   body: { token, new_password }
 * The endpoint is unauthenticated, so we call fetch directly (not apiFetch,
 * which would attach a bearer token and try to refresh on 401).
 */

type Status = 'form' | 'submitting' | 'success' | 'error' | 'no_token';

const MIN_PASSWORD_LENGTH = 8;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

  const [status, setStatus] = useState<Status>('form');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setStatus('no_token');
  }, [token]);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    status !== 'submitting' &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON response */
      }

      if (res.ok && data?.success) {
        setStatus('success');
        return;
      }

      // Surface the backend's error message (invalid/expired token, or field errors)
      const fieldError =
        data?.errors?.new_password?.[0] || data?.errors?.token?.[0];
      setError(
        data?.error ||
          fieldError ||
          'This reset link is invalid or has expired. Please request a new one.',
      );
      setStatus('error');
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  };

  // ── Success ──────────────────────────────────────────────
  if (status === 'success') {
    return (
      <Shell>
        <div className="text-center space-y-5">
          <SuccessIcon />
          <h1 className="text-2xl font-semibold text-white">Password set</h1>
          <p className="text-white/60 leading-relaxed">
            Your password has been updated. You can now sign in to your SIA account.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors py-3 font-medium text-white"
          >
            Continue to sign in
          </button>
        </div>
      </Shell>
    );
  }

  // ── No token in URL ──────────────────────────────────────
  if (status === 'no_token') {
    return (
      <Shell>
        <div className="text-center space-y-5">
          <ErrorIcon />
          <h1 className="text-2xl font-semibold text-white">Invalid link</h1>
          <p className="text-white/60 leading-relaxed">
            This page needs a valid reset link. Please open the link from your email, or request a
            new one from the sign-in page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl border border-white/15 hover:bg-white/5 transition-colors py-3 font-medium text-white"
          >
            Go to sign in
          </button>
        </div>
      </Shell>
    );
  }

  // ── Form (and inline error) ──────────────────────────────
  return (
    <Shell>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">Set your password</h1>
          <p className="text-white/50 text-sm">
            Choose a new password for your SIA account.
          </p>
        </div>

        {status === 'error' && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">New password</label>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none px-4 py-3 text-white placeholder-white/30 transition-colors"
            />
            {passwordTooShort && (
              <p className="text-xs text-amber-300/80">
                Must be at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Confirm password</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none px-4 py-3 text-white placeholder-white/30 transition-colors"
            />
            {mismatch && (
              <p className="text-xs text-amber-300/80">Passwords don&apos;t match.</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-white/50 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="accent-purple-600"
            />
            Show password
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-3 font-medium text-white"
          >
            {status === 'submitting' ? 'Setting password…' : 'Set password'}
          </button>
        </form>
      </div>
    </Shell>
  );
}

// ── Layout shell ───────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07060F] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-white font-semibold tracking-[0.2em] text-lg">SIA</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    </div>
  );
}

// useSearchParams must be wrapped in Suspense in the App Router.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07060F]">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
