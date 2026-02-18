"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "profile" | "notifications" | "appearance" | "privacy" | "billing";

// ─── Starfield ────────────────────────────────────────────────────────────────
function Starfield() {
  const stars = [
    { x: 8,  y: 12, s: 1.5, o: 0.3 }, { x: 22, y: 45, s: 1,   o: 0.2 },
    { x: 35, y: 8,  s: 2,   o: 0.4 }, { x: 47, y: 67, s: 1,   o: 0.25 },
    { x: 55, y: 22, s: 1.5, o: 0.35 }, { x: 63, y: 88, s: 1,  o: 0.2 },
    { x: 71, y: 15, s: 2,   o: 0.45 }, { x: 82, y: 55, s: 1.5, o: 0.3 },
    { x: 91, y: 33, s: 1,   o: 0.2 }, { x: 97, y: 72, s: 2,   o: 0.4 },
    { x: 15, y: 78, s: 1,   o: 0.2 }, { x: 28, y: 92, s: 1.5, o: 0.3 },
    { x: 42, y: 38, s: 1,   o: 0.15 }, { x: 58, y: 58, s: 2,  o: 0.35 },
    { x: 76, y: 82, s: 1,   o: 0.2 }, { x: 88, y: 18, s: 1.5, o: 0.3 },
    { x: 4,  y: 55, s: 1,   o: 0.2 }, { x: 18, y: 25, s: 2,   o: 0.35 },
    { x: 50, y: 95, s: 1.5, o: 0.25 }, { x: 68, y: 42, s: 1,  o: 0.2 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-300"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o }}
        />
      ))}
      <div className="absolute -top-60 -right-60 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-60 -left-60 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(30,58,138,0.1) 0%, transparent 70%)" }} />
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-300 focus:outline-none"
      style={{
        borderColor: checked ? "rgba(217,119,6,0.6)" : "rgba(255,255,255,0.1)",
        background: checked ? "rgba(217,119,6,0.18)" : "rgba(255,255,255,0.04)",
      }}
    >
      <span
        className="inline-block h-3 w-3 rounded-full transition-all duration-300"
        style={{
          marginLeft: 3,
          transform: checked ? "translateX(16px)" : "translateX(0)",
          background: checked ? "#f59e0b" : "rgba(255,255,255,0.25)",
          boxShadow: checked ? "0 0 8px rgba(245,158,11,0.7)" : "none",
        }}
      />
    </button>
  );
}

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs tracking-widest uppercase" style={{ ...MONO, color: "#f59e0b" }}>
      {children}
    </span>
  );
}

function DashedBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ border: "1px dashed rgba(245,158,11,0.28)", background: "rgba(255,255,255,0.015)" }}>
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.025)" }}>
      {children}
    </div>
  );
}

function Row({ title, desc, children, last = false }: { title: string; desc?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 px-6 py-5"
      style={{ borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.045)" }}>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{title}</p>
        {desc && <p className="mt-0.5 text-xs leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{desc}</p>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}

function GoldBtn({ children, onClick, sm }: { children: React.ReactNode; onClick?: () => void; sm?: boolean }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl font-medium tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-95 ${sm ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm"}`}
      style={{ ...MONO, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#08090d", boxShadow: "0 0 20px rgba(245,158,11,0.22)" }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs tracking-widest uppercase transition-all hover:brightness-125"
      style={{ ...MONO, border: `1px solid ${danger ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}`, color: danger ? "rgba(239,68,68,0.75)" : "rgba(255,255,255,0.38)", background: danger ? "rgba(239,68,68,0.04)" : "transparent" }}>
      {children}
    </button>
  );
}

function SectionHead({ cat, title, sub }: { cat: string; title: string; sub: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-amber-500" style={{ boxShadow: "0 0 7px rgba(245,158,11,0.9)" }} />
        <Label>{cat}</Label>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-white" style={MONO}>{title}</h2>
      <p className="mt-2 text-sm max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.33)" }}>{sub}</p>
    </div>
  );
}

function SaveBar() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-8 flex items-center justify-end gap-3">
      <GhostBtn>Cancel</GhostBtn>
      <GoldBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {saved ? "✓ Saved" : "Save Changes"}
      </GoldBtn>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)", border: `1px solid ${focused ? "rgba(245,158,11,0.45)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 12, color: "rgba(255,255,255,0.78)", fontSize: 14, padding: "10px 14px",
    width: "100%", outline: "none", fontFamily: "inherit", transition: "border-color .2s",
    boxShadow: focused ? "0 0 0 3px rgba(245,158,11,0.07)" : "none",
  };
  return (
    <div>
      <p className="mb-1.5 text-xs tracking-widest uppercase" style={{ ...MONO, color: "rgba(255,255,255,0.28)" }}>{label}</p>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...base, resize: "none" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
      }
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection() {
  const [name, setName] = useState("Jordan Mercer");
  const [email, setEmail] = useState("jordan@example.com");
  const [bio, setBio] = useState("Product designer & occasional builder.");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <SectionHead cat="Account" title="Profile" sub="Your public identity and account credentials." />

      <DashedBox className="mb-4">
        <div className="flex items-center gap-5">
          <div onClick={() => fileRef.current?.click()}
            className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg,#92400e,#d97706)", border: "1px solid rgba(245,158,11,0.35)", boxShadow: "0 0 20px rgba(245,158,11,0.14)" }}>
            {avatar
              ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              : <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">{name.charAt(0)}</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setAvatar(ev.target?.result as string); r.readAsDataURL(f); }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Profile photo</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>JPG, PNG · max 2 MB</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1.5 text-xs" style={{ ...MONO, color: "#f59e0b" }}>
              Upload photo →
            </button>
          </div>
        </div>
      </DashedBox>

      <Card className="mb-4">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextInput label="Full name" value={name} onChange={setName} />
            <TextInput label="Email address" value={email} onChange={setEmail} type="email" />
          </div>
          <TextInput label="Bio" value={bio} onChange={setBio} rows={3} />
        </div>
      </Card>

      <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.035)" }}>
        <Label>Danger Zone</Label>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <div className="mt-4"><GhostBtn danger>Delete account</GhostBtn></div>
      </div>

      <SaveBar />
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsSection() {
  const [p, setP] = useState({ productUpdates: true, securityAlerts: true, weeklyDigest: false, comments: true, mentions: true, teamActivity: false, marketing: false, sms: false });
  const t = (k: keyof typeof p) => (v: boolean) => setP(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHead cat="Alerts" title="Notifications" sub="Choose what you hear about and how." />
      <Card className="mb-4">
        <div className="px-6 pt-5 pb-1"><Label>Email</Label></div>
        <Row title="Product updates" desc="New features and improvements."><Toggle checked={p.productUpdates} onChange={t("productUpdates")} /></Row>
        <Row title="Security alerts" desc="Login attempts and security events."><Toggle checked={p.securityAlerts} onChange={t("securityAlerts")} /></Row>
        <Row title="Weekly digest" desc="Activity summary every Monday."><Toggle checked={p.weeklyDigest} onChange={t("weeklyDigest")} /></Row>
        <Row title="Marketing & offers" desc="Promotions and special offers." last><Toggle checked={p.marketing} onChange={t("marketing")} /></Row>
      </Card>
      <Card className="mb-4">
        <div className="px-6 pt-5 pb-1"><Label>In-App</Label></div>
        <Row title="Comments" desc="When someone comments on your work."><Toggle checked={p.comments} onChange={t("comments")} /></Row>
        <Row title="Mentions" desc="When you are @mentioned anywhere."><Toggle checked={p.mentions} onChange={t("mentions")} /></Row>
        <Row title="Team activity" desc="Updates from your team members." last><Toggle checked={p.teamActivity} onChange={t("teamActivity")} /></Row>
      </Card>
      <Card>
        <Row title="SMS notifications" desc="Critical alerts via text. Standard rates apply." last><Toggle checked={p.sms} onChange={t("sms")} /></Row>
      </Card>
      <SaveBar />
    </div>
  );
}

// ─── Appearance ───────────────────────────────────────────────────────────────
function AppearanceSection() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [accent, setAccent] = useState("amber");
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">("default");
  const [fontSize, setFontSize] = useState(14);

  const ACCENTS = [{ id: "amber", c: "#f59e0b" }, { id: "sky", c: "#38bdf8" }, { id: "rose", c: "#fb7185" }, { id: "emerald", c: "#34d399" }, { id: "violet", c: "#a78bfa" }];
  const THEMES = [{ id: "light", label: "Light", icon: "☀" }, { id: "dark", label: "Dark", icon: "◗" }, { id: "system", label: "System", icon: "⬡" }];

  return (
    <div>
      <SectionHead cat="Display" title="Appearance" sub="Personalise how the interface looks and feels." />
      <DashedBox className="mb-4">
        <Label>Theme</Label>
        <div className="mt-3 flex gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id as typeof theme)}
              className="flex-1 rounded-xl py-4 text-center transition-all duration-200"
              style={{ border: theme === t.id ? "1px solid rgba(245,158,11,0.55)" : "1px solid rgba(255,255,255,0.06)", background: theme === t.id ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.015)", boxShadow: theme === t.id ? "0 0 18px rgba(245,158,11,0.09)" : "none" }}>
              <span className="block text-xl mb-1">{t.icon}</span>
              <span className="block text-xs tracking-widest uppercase" style={{ ...MONO, color: theme === t.id ? "#f59e0b" : "rgba(255,255,255,0.32)" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </DashedBox>
      <Card className="mb-4">
        <Row title="Accent color" desc="Used for highlights, buttons, and interactive elements.">
          <div className="flex gap-2">
            {ACCENTS.map(a => (
              <button key={a.id} onClick={() => setAccent(a.id)}
                className="h-6 w-6 rounded-full transition-all duration-200"
                style={{ background: a.c, boxShadow: accent === a.id ? `0 0 10px ${a.c}90` : "none", transform: accent === a.id ? "scale(1.22)" : "scale(1)", outline: accent === a.id ? `2px solid ${a.c}55` : "none", outlineOffset: 2 }} />
            ))}
          </div>
        </Row>
        <Row title="Interface density" desc="How compact or spacious the layout feels.">
          <div className="flex overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
            {(["compact", "default", "comfortable"] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)} className="px-3.5 py-2 capitalize transition-all duration-200"
                style={{ ...MONO, background: density === d ? "#f59e0b" : "transparent", color: density === d ? "#08090d" : "rgba(255,255,255,0.33)", fontSize: 10, letterSpacing: "0.06em" }}>
                {d}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Base font size" desc={`${fontSize}px — affects body text throughout the app.`} last>
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(s => Math.max(12, s - 1))}
              className="h-8 w-8 rounded-lg text-sm font-bold transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)", background: "transparent" }}>−</button>
            <span className="w-8 text-center text-sm tabular-nums" style={{ ...MONO, color: "#f59e0b" }}>{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(20, s + 1))}
              className="h-8 w-8 rounded-lg text-sm font-bold transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)", background: "transparent" }}>+</button>
          </div>
        </Row>
      </Card>
      <SaveBar />
    </div>
  );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────
function PrivacySection() {
  const [p, setP] = useState({ twoFactor: false, activityLog: true, publicProfile: true, dataSharing: false, sessionTimeout: "30" });
  const t = (k: keyof typeof p) => (v: boolean) => setP(prev => ({ ...prev, [k]: v }));
  const SESS = [{ value: "15", label: "15 min" }, { value: "30", label: "30 min" }, { value: "60", label: "1 hour" }, { value: "240", label: "4 hours" }, { value: "never", label: "Never" }];

  return (
    <div>
      <SectionHead cat="Security" title="Privacy" sub="Control your data and keep your account safe." />
      <Card className="mb-4">
        <div className="px-6 pt-5 pb-1"><Label>Security</Label></div>
        <Row title="Two-factor authentication" desc="Add an extra layer with an authenticator app or SMS.">
          <div className="flex items-center gap-3">
            {p.twoFactor && <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ ...MONO, background: "rgba(52,211,153,0.09)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", fontSize: 9, letterSpacing: "0.08em" }}>ENABLED</span>}
            <Toggle checked={p.twoFactor} onChange={t("twoFactor")} />
          </div>
        </Row>
        <Row title="Auto-logout" desc="Automatically sign you out after inactivity.">
          <select value={p.sessionTimeout} onChange={e => setP(prev => ({ ...prev, sessionTimeout: e.target.value }))}
            style={{ ...MONO, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "rgba(255,255,255,0.65)", padding: "8px 12px", fontSize: 11, outline: "none", cursor: "pointer" }}>
            {SESS.map(s => <option key={s.value} value={s.value} style={{ background: "#0a0e1a" }}>{s.label}</option>)}
          </select>
        </Row>
        <Row title="Active sessions" desc="View and revoke access from other devices." last>
          <GhostBtn>Manage →</GhostBtn>
        </Row>
      </Card>
      <Card className="mb-4">
        <div className="px-6 pt-5 pb-1"><Label>Privacy</Label></div>
        <Row title="Public profile" desc="Allow others to find and view your profile."><Toggle checked={p.publicProfile} onChange={t("publicProfile")} /></Row>
        <Row title="Activity log" desc="Keep a log of actions taken on your account."><Toggle checked={p.activityLog} onChange={t("activityLog")} /></Row>
        <Row title="Usage data sharing" desc="Help improve the product with anonymised data." last><Toggle checked={p.dataSharing} onChange={t("dataSharing")} /></Row>
      </Card>
      <DashedBox>
        <Label>Export Data</Label>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>Download a copy of all data associated with your account.</p>
        <div className="mt-4 flex gap-3">
          <GhostBtn>Export JSON</GhostBtn>
          <GhostBtn>Export CSV</GhostBtn>
        </div>
      </DashedBox>
      <SaveBar />
    </div>
  );
}

// ─── Billing ──────────────────────────────────────────────────────────────────
function BillingSection() {
  const [activePlan] = useState<"free" | "pro" | "team">("pro");
  const PLANS = [
    { id: "free",  name: "Free",  price: "$0",  period: "/mo", features: ["3 projects", "1 GB storage", "Community support"] },
    { id: "pro",   name: "Pro",   price: "$12", period: "/mo", features: ["Unlimited projects", "20 GB storage", "Priority support", "Custom domain"] },
    { id: "team",  name: "Team",  price: "$49", period: "/mo", features: ["Everything in Pro", "5 seats", "Team analytics", "SSO & SAML"] },
  ] as const;
  const INVOICES = [{ date: "Feb 1, 2026", amount: "$12.00" }, { date: "Jan 1, 2026", amount: "$12.00" }, { date: "Dec 1, 2025", amount: "$12.00" }];

  return (
    <div>
      <SectionHead cat="Subscription" title="Billing" sub="Manage your plan, payment method, and invoices." />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map(p => (
          <div key={p.id} className="rounded-2xl p-5 transition-all duration-200"
            style={{ border: activePlan === p.id ? "1px solid rgba(245,158,11,0.5)" : "1px solid rgba(255,255,255,0.055)", background: activePlan === p.id ? "rgba(245,158,11,0.055)" : "rgba(255,255,255,0.02)", boxShadow: activePlan === p.id ? "0 0 22px rgba(245,158,11,0.07)" : "none" }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-semibold text-white/75 tracking-wider uppercase" style={MONO}>{p.name}</span>
              {activePlan === p.id && <span className="rounded-full px-2 py-0.5" style={{ ...MONO, background: "rgba(245,158,11,0.14)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", fontSize: 9, letterSpacing: "0.08em" }}>ACTIVE</span>}
            </div>
            <p className="text-2xl font-bold text-white mb-3" style={MONO}>{p.price}<span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.28)" }}>{p.period}</span></p>
            <ul className="space-y-2 mb-5">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                  <span style={{ color: "#f59e0b" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            {activePlan === p.id
              ? <div className="w-full rounded-xl py-2 text-center text-xs tracking-widest uppercase" style={{ ...MONO, border: "1px solid rgba(245,158,11,0.18)", color: "rgba(245,158,11,0.38)", cursor: "default" }}>Current Plan</div>
              : <button className="w-full rounded-xl py-2 text-xs tracking-widest uppercase font-medium transition hover:brightness-125"
                  style={{ ...MONO, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)" }}>Switch →</button>}
          </div>
        ))}
      </div>
      <Card className="mb-4">
        <Row title="Payment method" desc="Visa ending in 4242 · Expires 08/27"><GhostBtn>Update</GhostBtn></Row>
        <Row title="Billing email" desc="invoices@example.com"><GhostBtn>Change</GhostBtn></Row>
        <Row title="Billing cycle" desc="Renews March 1, 2026 · Pro Plan" last><GhostBtn danger>Cancel plan</GhostBtn></Row>
      </Card>
      <Card>
        <div className="px-6 pt-5 pb-1"><Label>Invoice History</Label></div>
        {INVOICES.map((inv, i) => (
          <div key={inv.date} className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: i < INVOICES.length - 1 ? "1px solid rgba(255,255,255,0.045)" : "none" }}>
            <div>
              <p className="text-sm" style={{ ...MONO, color: "rgba(255,255,255,0.65)" }}>{inv.date}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{inv.amount} · Pro Plan</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-2.5 py-0.5" style={{ ...MONO, background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)", fontSize: 9, letterSpacing: "0.08em" }}>PAID</span>
              <button className="text-xs font-medium" style={{ ...MONO, color: "#f59e0b" }}>PDF</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "profile",       label: "Profile",       icon: "◎" },
  { id: "notifications", label: "Notifications", icon: "◈" },
  { id: "appearance",   label: "Appearance",    icon: "◇" },
  { id: "privacy",      label: "Privacy",       icon: "◉" },
  { id: "billing",      label: "Billing",       icon: "◆" },
];

const SECTIONS: Record<Section, React.ReactElement> = {
  profile:       <ProfileSection />,
  notifications: <NotificationsSection />,
  appearance:    <AppearanceSection />,
  privacy:       <PrivacySection />,
  billing:       <BillingSection />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 4px; }
        select option { background: #0a0e1a; }
      `}</style>

      <div className="relative min-h-screen" style={{ background: "linear-gradient(155deg,#060a12 0%,#090d1b 55%,#070b16 100%)", fontFamily: "'JetBrains Mono', system-ui, sans-serif" }}>
        <Starfield />

        {/* Header */}
        <header className="relative z-10 sticky top-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.045)", background: "rgba(6,10,18,0.88)", backdropFilter: "blur(14px)" }}>
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <button className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60" style={{ color: "rgba(255,255,255,0.38)" }}>
              ← Back
            </button>
            <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.22)" }}>Settings</span>
            <div className="h-8 w-8 rounded-xl" style={{ background: "linear-gradient(135deg,#92400e,#d97706)", boxShadow: "0 0 14px rgba(245,158,11,0.3)" }} />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex max-w-6xl gap-8 px-6 py-10">
          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 md:block">
            <nav className="space-y-0.5 sticky top-24">
              {NAV.map(item => (
                <button key={item.id} onClick={() => setActive(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                  style={{ background: active === item.id ? "rgba(245,158,11,0.08)" : "transparent", border: active === item.id ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent" }}>
                  <span style={{ color: active === item.id ? "#f59e0b" : "rgba(255,255,255,0.22)", fontSize: 14 }}>{item.icon}</span>
                  <span className="text-xs tracking-widest uppercase" style={{ color: active === item.id ? "#f59e0b" : "rgba(255,255,255,0.38)" }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 md:hidden w-full">
            {NAV.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs tracking-widest uppercase transition-all"
                style={{ background: active === item.id ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", border: active === item.id ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.065)", color: active === item.id ? "#f59e0b" : "rgba(255,255,255,0.32)" }}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="min-w-0 flex-1">{SECTIONS[active]}</main>
        </div>
      </div>
    </>
  );
}