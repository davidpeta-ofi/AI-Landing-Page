'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // calc max distance to corners of viewport
    const maxDist = Math.sqrt(
      Math.pow(Math.max(cx, window.innerWidth - cx), 2) +
      Math.pow(Math.max(cy, window.innerHeight - cy), 2)
    );

    setRippleStyle({
      left: cx,
      top: cy,
      '--ripple-size': `${maxDist * 2.2}px`,
    } as React.CSSProperties);

    setTransitioning(true);

    // open modal mid-transition
    setTimeout(() => setLoginOpen(true), 420);
    // fade ripple out after modal is visible
    setTimeout(() => setTransitioning(false), 900);
  };

  const handleClose = () => {
    setLoginOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          55%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes ripple-flash {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
          40%  { opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        .login-ripple {
          position: fixed;
          width: var(--ripple-size);
          height: var(--ripple-size);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(0);
          background: radial-gradient(circle, #f5d070 0%, #f0b849 35%, rgba(240,130,20,0.6) 65%, transparent 100%);
          animation: ripple-expand 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .login-ripple-inner {
          position: fixed;
          width: var(--ripple-size);
          height: var(--ripple-size);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%) scale(0);
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(240,184,73,0.08) 40%, transparent 70%);
          animation: ripple-flash 0.85s cubic-bezier(0.3, 0, 0.2, 1) 0.05s forwards;
        }
        @keyframes btn-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(240,184,73,0.7); transform: scale(1); }
          50%  { box-shadow: 0 0 0 10px rgba(240,184,73,0); transform: scale(0.96); }
          100% { box-shadow: 0 0 0 0 rgba(240,184,73,0); transform: scale(1); }
        }
        .btn-clicked { animation: btn-pulse 0.35s ease forwards; }
      `}</style>

      {/* ── ripple layers ── */}
      {transitioning && (
        <>
          <div className="login-ripple" style={rippleStyle} />
          <div className="login-ripple-inner" style={rippleStyle} />
        </>
      )}

      <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            <Link href="/" className="flex-shrink-0">
              <Image src="/sia-globe-v2.png" alt="SIA Logo" width={200} height={200} className="h-12 w-auto mix-blend-lighten" />
            </Link>

            <div className="hidden md:flex items-center space-x-10 ml-auto">
              <div className="flex items-center space-x-12">
                {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us']].map(([href, label]) => (
                  <Link key={href} href={href} className={`transition-colors duration-200 text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}>
                    {label}
                  </Link>
                ))}
              </div>

              <button
                ref={btnRef}
                onClick={handleLoginClick}
                className="border border-[#f0b849] text-[#f0b849] hover:bg-[#f0b849] hover:text-[#0a0a1a] font-semibold px-6 py-2.5 rounded-full transition-all duration-300 text-base relative overflow-hidden"
                style={{ isolation: 'isolate' }}
              >
                Login
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none" aria-label="Toggle menu">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {isOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-[#0a0a1a] border-t border-gray-800">
            <div className="px-6 py-4 space-y-3">
              {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us']].map(([href, label]) => (
                <Link key={href} href={href} className={`block text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`} onClick={() => setIsOpen(false)}>
                  {label}
                </Link>
              ))}
              <button
                onClick={(e) => { setIsOpen(false); handleLoginClick(e as any); }}
                className="block w-full mt-4 border border-[#f0b849] text-[#f0b849] font-semibold px-6 py-3 rounded-full text-center transition-all duration-300 hover:bg-[#f0b849] hover:text-[#0a0a1a]"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={loginOpen} onClose={handleClose} />
    </>
  );
};

export default Navbar;