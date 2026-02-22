'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';
import {
  isAuthenticated, fetchProfile, clearAuth, apiFetch,
  type UserProfile,
} from '@/lib/api';

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [loginOpen, setLoginOpen]     = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({});
  const [profile, setProfile]         = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const btnRef     = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname   = usePathname();
  const router     = useRouter();

  // Load real profile on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchProfile().then(setProfile).catch(() => null);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, []);

  const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect    = btn.getBoundingClientRect();
    const cx      = rect.left + rect.width  / 2;
    const cy      = rect.top  + rect.height / 2;
    const maxDist = Math.sqrt(
      Math.pow(Math.max(cx, window.innerWidth  - cx), 2) +
      Math.pow(Math.max(cy, window.innerHeight - cy), 2)
    );
    setRippleStyle({ left: cx, top: cy, '--ripple-size': `${maxDist * 2.2}px` } as React.CSSProperties);
    setTransitioning(true);
    setTimeout(() => setLoginOpen(true),      420);
    setTimeout(() => setTransitioning(false), 900);
  };

  const handleLoginSuccess = (name: string, email: string, role?: string) => {
    setLoginOpen(false);
    // Fetch real profile from backend and route based on role
    fetchProfile().then(p => {
      setProfile(p);
      if (p.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/platform');
      }
    }).catch(() => {
      // Fallback: set minimal profile so UI shows user
      setProfile({ full_name: name, email } as UserProfile);
      if (role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/platform');
      }
    });
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await apiFetch('/api/auth/logout/', { method: 'POST' });
    } catch {
      // ignore — clear anyway
    }
    clearAuth();
    setProfile(null);
    router.push('/');
  };

  const goTo = (path: string) => {
    setProfileOpen(false);
    setMobileOpen(false);
    router.push(path);
  };

  const navLinks: [string, string][] = [['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us']];

  const isAdmin  = profile?.role === 'super_admin';
  const canMark  = profile?.can_access_mark ?? false;
  const canHR    = profile?.can_access_hr   ?? false;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        @keyframes ripple-expand {
          0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
          55%  { opacity:1; }
          100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
        }
        @keyframes ripple-flash {
          0%   { transform:translate(-50%,-50%) scale(0); opacity:0.9; }
          40%  { opacity:0.55; }
          100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
        }
        .login-ripple {
          position:fixed; border-radius:50%; pointer-events:none; z-index:9999;
          width:var(--ripple-size); height:var(--ripple-size);
          transform:translate(-50%,-50%) scale(0);
          background:radial-gradient(circle,#f5d070 0%,#f0b849 35%,rgba(240,130,20,0.6) 65%,transparent 100%);
          animation:ripple-expand 0.85s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .login-ripple-inner {
          position:fixed; border-radius:50%; pointer-events:none; z-index:9998;
          width:var(--ripple-size); height:var(--ripple-size);
          transform:translate(-50%,-50%) scale(0);
          background:radial-gradient(circle,rgba(255,255,255,0.15) 0%,rgba(240,184,73,0.08) 40%,transparent 70%);
          animation:ripple-flash 0.85s cubic-bezier(0.3,0,0.2,1) 0.05s forwards;
        }

        @keyframes dropIn {
          from { opacity:0; transform:translateY(-6px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .nb-drop {
          position:absolute; top:calc(100% + 12px); right:0;
          min-width:220px;
          background:rgba(8,8,22,0.97);
          border:1px solid rgba(240,184,73,0.18);
          border-radius:12px; padding:5px;
          box-shadow:0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(240,184,73,0.04), 0 0 30px rgba(240,184,73,0.04);
          backdrop-filter:blur(24px);
          animation:dropIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards;
          z-index:300;
          font-family:'DM Mono',monospace;
        }

        .nb-row {
          display:flex; align-items:center; gap:9px;
          padding:8px 10px; border-radius:8px; width:100%;
          background:none; border:none; cursor:pointer; text-align:left;
          color:rgba(230,218,190,0.72); font-family:'DM Mono',monospace;
          font-size:12px; letter-spacing:0.03em;
          transition:background 0.12s, color 0.12s;
        }
        .nb-row:hover       { background:rgba(240,184,73,0.07); color:#f0ead8; }
        .nb-row.red:hover   { background:rgba(255,80,80,0.07); color:#ff8888; }
        .nb-row.admin:hover { background:rgba(139,92,246,0.10); color:#a78bfa; }
        .nb-sep { height:1px; background:rgba(240,184,73,0.1); margin:4px 4px; }

        .nb-ph { padding:10px 10px 8px; border-bottom:1px solid rgba(240,184,73,0.1); margin-bottom:3px; }
        .nb-ph-name  { font-family:'DM Mono',monospace; font-size:12px; color:#f0ead8; font-weight:500; letter-spacing:0.03em; }
        .nb-ph-email { font-family:'DM Mono',monospace; font-size:10px; color:rgba(200,185,150,0.38); letter-spacing:0.02em; margin-top:2px; }
        .nb-ph-badge { display:inline-flex; align-items:center; gap:4px; font-size:9px; padding:2px 7px; border-radius:5px; background:rgba(139,92,246,0.15); color:#a78bfa; font-weight:700; letter-spacing:0.06em; margin-top:4px; }

        .nb-avatar {
          width:34px; height:34px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#d99830,#f5d070);
          color:#0a0a1a; font-family:'DM Mono',monospace;
          font-size:11.5px; font-weight:500; letter-spacing:0.05em;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; border:2px solid transparent;
          transition:border-color 0.18s, box-shadow 0.18s;
          user-select:none;
        }
        .nb-avatar:hover, .nb-avatar.on {
          border-color:rgba(240,184,73,0.55);
          box-shadow:0 0 0 3px rgba(240,184,73,0.13);
        }

        .nb-online {
          position:absolute; bottom:0; right:0;
          width:8px; height:8px; border-radius:50%;
          background:#4ade80; border:2px solid #0a0a1a;
        }

        .nb-agent-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px; font-size:11px;
          font-weight:600; cursor:pointer; transition:all 0.15s;
          border:1px solid; text-decoration:none;
        }
      `}</style>

      {transitioning && (
        <>
          <div className="login-ripple" style={rippleStyle} />
          <div className="login-ripple-inner" style={rippleStyle} />
        </>
      )}

      <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/sia-globe-v2.png" alt="SIA Logo" width={200} height={200} className="h-12 w-auto mix-blend-lighten" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 ml-auto">
              <div className="flex items-center gap-10">
                {navLinks.map(([href, label]) => (
                  <Link key={href} href={href}
                    className={`transition-colors duration-200 text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Agent quick-access pills (authenticated + has access) */}
              {profile && (canMark || canHR) && (
                <div className="flex items-center gap-2">
                  {canMark && (
                    <Link href="/agents/mark"
                      className="nb-agent-pill"
                      style={{ borderColor: 'rgba(245,166,35,0.35)', color: '#f5a623', background: 'rgba(245,166,35,0.08)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#f5a623', display: 'inline-block' }} />
                      MARK
                    </Link>
                  )}
                  {canHR && (
                    <Link href="/hr-agent"
                      className="nb-agent-pill"
                      style={{ borderColor: 'rgba(74,222,128,0.30)', color: '#4ade80', background: 'rgba(74,222,128,0.07)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4ade80', display: 'inline-block' }} />
                      HR
                    </Link>
                  )}
                </div>
              )}

              {/* Login button */}
              {!profile && (
                <button ref={btnRef} onClick={handleLoginClick}
                  className="border border-[#f0b849] text-[#f0b849] hover:bg-[#f0b849] hover:text-[#0a0a1a] font-semibold px-6 py-2.5 rounded-full transition-all duration-300 text-base"
                  style={{ isolation: 'isolate' }}>
                  Login
                </button>
              )}

              {/* Profile avatar */}
              {profile && (
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <div
                    className={`nb-avatar${profileOpen ? ' on' : ''}`}
                    style={{ position: 'relative' }}
                    onClick={() => setProfileOpen(p => !p)}
                  >
                    {getInitials(profile.full_name || profile.email || '?')}
                    <span className="nb-online" />
                  </div>

                  {profileOpen && (
                    <div className="nb-drop">
                      <div className="nb-ph">
                        <div className="nb-ph-name">{profile.full_name || profile.email}</div>
                        <div className="nb-ph-email">{profile.email}</div>
                        {isAdmin && (
                          <div className="nb-ph-badge">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                            </svg>
                            SUPER ADMIN
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <>
                          <button className="nb-row admin" onClick={() => goTo('/admin')}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                            </svg>
                            Admin Portal
                          </button>
                          <div className="nb-sep" />
                        </>
                      )}

                      <button className="nb-row" onClick={() => goTo('/platform')}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Dashboard
                      </button>

                      <button className="nb-row" onClick={() => goTo('/profile')}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Profile
                      </button>

                      <button className="nb-row" onClick={() => goTo('/settings')}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Settings
                      </button>

                      <div className="nb-sep" />

                      <button className="nb-row red" onClick={handleLogout}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-300 hover:text-white focus:outline-none" aria-label="Toggle menu">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0a1a] border-t border-gray-800">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map(([href, label]) => (
                <Link key={href} href={href}
                  className={`block text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              ))}

              {profile && (canMark || canHR) && (
                <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                  {canMark && (
                    <Link href="/agents/mark" onClick={() => setMobileOpen(false)}
                      className="nb-agent-pill"
                      style={{ borderColor:'rgba(245,166,35,0.35)', color:'#f5a623', background:'rgba(245,166,35,0.08)' }}>
                      <span style={{ width:6, height:6, borderRadius:3, background:'#f5a623', display:'inline-block' }} />
                      MARK
                    </Link>
                  )}
                  {canHR && (
                    <Link href="/hr-agent" onClick={() => setMobileOpen(false)}
                      className="nb-agent-pill"
                      style={{ borderColor:'rgba(74,222,128,0.30)', color:'#4ade80', background:'rgba(74,222,128,0.07)' }}>
                      <span style={{ width:6, height:6, borderRadius:3, background:'#4ade80', display:'inline-block' }} />
                      HR Agent
                    </Link>
                  )}
                </div>
              )}

              {!profile ? (
                <button
                  onClick={(e) => { setMobileOpen(false); handleLoginClick(e as unknown as React.MouseEvent<HTMLButtonElement>); }}
                  className="block w-full mt-4 border border-[#f0b849] text-[#f0b849] font-semibold px-6 py-3 rounded-full text-center transition-all duration-300 hover:bg-[#f0b849] hover:text-[#0a0a1a]">
                  Login
                </button>
              ) : (
                <div style={{ borderTop:'1px solid rgba(240,184,73,0.08)', paddingTop:8, marginTop:4, display:'flex', flexDirection:'column', gap:2 }}>
                  {isAdmin && (
                    <button className="nb-row admin" onClick={() => goTo('/admin')}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                      </svg>
                      Admin Portal
                    </button>
                  )}
                  <button className="nb-row" onClick={() => goTo('/platform')}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dashboard
                  </button>
                  <button className="nb-row" onClick={() => goTo('/profile')}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Profile
                  </button>
                  <button className="nb-row" onClick={() => goTo('/settings')}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Settings
                  </button>
                  <button className="nb-row red" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;
