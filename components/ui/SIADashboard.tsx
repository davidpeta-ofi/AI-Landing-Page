'use client';

import { useState, useEffect, useRef } from "react";
import {
  BarChart3, Bot, Settings, Bell, Search, Activity,
  TrendingUp, Users, Zap, Clock, CheckCircle,
  ChevronRight, Home, MessageSquare,
  Image, FileText, Target, Upload, X, CloudUpload,
  FolderOpen, Check, Sparkles, Brain, Cpu, ArrowRight,
  Shield, Star, Briefcase, ChevronDown, AlertCircle,
  Loader, CircleCheck, ScanSearch, Wand2, LayoutDashboard,
  Mail, Edit, ArrowLeft, ExternalLink,
} from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

// ✅ Import SettingsPage from its own file
import SettingsPage from "@/app/settings/page";

// ======================== DESIGN TOKENS ========================
const C = {
  bg: '#0A0818',
  bgSidebar: '#0E0C1D',
  bgCard: 'rgba(139, 92, 246, 0.06)',
  bgCardHover: 'rgba(139, 92, 246, 0.12)',
  border: 'rgba(139, 92, 246, 0.15)',
  borderHover: 'rgba(139, 92, 246, 0.30)',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(139, 92, 246, 0.15)',
  gold: '#F5A623',
  goldDim: 'rgba(245, 166, 35, 0.15)',
  green: '#22C55E',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  blue: '#3B82F6',
  blueDim: 'rgba(59, 130, 246, 0.15)',
  cyan: '#06B6D4',
  cyanDim: 'rgba(6, 182, 212, 0.15)',
  pink: '#EC4899',
  pinkDim: 'rgba(236, 72, 153, 0.15)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.75)',
  textMut: 'rgba(255,255,255,0.55)',
};

const AGENTS_DATA = [
  { id: 'mark', name: 'MARK', role: 'Marketing Automation', status: 'Active', sColor: C.green, progress: 78, color: C.gold, dim: C.goldDim, Icon: Image, task: 'Generating carousel: slide 4/6 — adding CTA overlay' },
  { id: 'aria', name: 'ARIA', role: 'Content Writer', status: 'Writing', sColor: C.purple, progress: 92, color: C.purple, dim: C.purpleDim, Icon: FileText, task: 'Drafting blog: "AI Agents in Operations" — 2,400 words' },
  { id: 'scout', name: 'SCOUT', role: 'Sales Intelligence', status: 'Scanning', sColor: C.blue, progress: 34, color: C.blue, dim: C.blueDim, Icon: Target, task: 'Analyzing 847 visitor sessions for intent signals...' },
  { id: 'pulse', name: 'PULSE', role: 'Analytics Engine', status: 'Active', sColor: C.green, progress: 67, color: C.cyan, dim: C.cyanDim, Icon: BarChart3, task: 'Compiling weekly KPI report — 4 data sources' },
  { id: 'nexus', name: 'NEXUS', role: 'HR Operations', status: 'Idle', sColor: C.textMut, progress: 100, color: C.pink, dim: C.pinkDim, Icon: Users, task: 'Standby — all screening tasks completed' },
];

const AGENT_OPTIONS = [
  { id: 'hr', label: 'HR Agent', sub: 'Recruitment & people ops', color: C.pink, dim: C.pinkDim, Icon: Users },
  { id: 'marketing', label: 'Marketing Agent', sub: 'Campaigns & content', color: C.gold, dim: C.goldDim, Icon: Target },
];

const FEED = [
  { agent: 'MARK', color: C.gold, text: 'Generated 6 carousel slides for Q1 campaign', time: '2m ago' },
  { agent: 'ARIA', color: C.purple, text: 'Drafted LinkedIn article — pending review', time: '5m ago' },
  { agent: 'SCOUT', color: C.blue, text: 'Identified 3 high-intent leads from traffic', time: '8m ago' },
  { agent: 'PULSE', color: C.cyan, text: 'Weekly engagement report ready for download', time: '12m ago' },
  { agent: 'MARK', color: C.gold, text: 'Video pipeline: Scene 2/4 rendering complete', time: '15m ago' },
  { agent: 'NEXUS', color: C.pink, text: 'Screened 12 applicants for Senior Design role', time: '23m ago' },
  { agent: 'ARIA', color: C.purple, text: 'A/B test copy variants for email campaign ready', time: '31m ago' },
  { agent: 'SCOUT', color: C.blue, text: 'Sales pipeline updated — 4 deals moved to closing', time: '38m ago' },
];

const STATS = [
  { label: 'Tasks Completed', val: 247, suf: '', Icon: CheckCircle, color: C.green, tag: '+12%' },
  { label: 'Active Agents', val: 5, suf: '/6', Icon: Bot, color: C.purple, tag: 'Online' },
  { label: 'Hours Saved', val: 20, suf: 'h', Icon: Clock, color: C.gold, tag: 'This week' },
  { label: 'Accuracy Rate', val: 94.2, suf: '%', Icon: TrendingUp, color: C.cyan, tag: '+2.1%' },
];

const CHART = [
  { d: 'Mon', tasks: 28, eff: 89 }, { d: 'Tue', tasks: 35, eff: 91 },
  { d: 'Wed', tasks: 42, eff: 93 }, { d: 'Thu', tasks: 38, eff: 90 },
  { d: 'Fri', tasks: 51, eff: 94 }, { d: 'Sat', tasks: 22, eff: 96 },
  { d: 'Sun', tasks: 31, eff: 94 },
];

const NAV = [
  { Icon: Home, label: 'Dashboard' },
  { Icon: Briefcase, label: 'Agents' },
  { Icon: Activity, label: 'Analytics' },
  { Icon: Zap, label: 'Automations' },
  { Icon: MessageSquare, label: 'Messages', badge: 3 },
  { Icon: Settings, label: 'Settings' },
];

const HR_DOC_TYPES = [
  { icon: '📄', label: 'Resumes', desc: 'PDF, DOCX — auto-parsed & ranked' },
  { icon: '📋', label: 'Job Descriptions', desc: 'Extract requirements & skills' },
  { icon: '📊', label: 'Assessment Reports', desc: 'Score sheets, test results' },
  { icon: '🤝', label: 'Offer Letters', desc: 'Templates & signed copies' },
];

const ANALYSIS_STEPS = [
  { id: 'parse', label: 'Parsing document structure', icon: ScanSearch, dur: 1200 },
  { id: 'extract', label: 'Extracting candidate data', icon: Brain, dur: 1800 },
  { id: 'score', label: 'Scoring against job criteria', icon: Star, dur: 1500 },
  { id: 'rank', label: 'Ranking & generating insights', icon: Wand2, dur: 1000 },
];

// ======================== HOOKS ========================
function useCounter(target: number, dur = 2000, dec = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setV(target); clearInterval(t); }
      else setV(Number(n.toFixed(dec)));
    }, 16);
    return () => clearInterval(t);
  }, [target, dur, dec]);
  return v;
}

// ======================== STYLES ========================
const KEYFRAMES = `
  @keyframes dashPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes dashSlideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes dashFillBar { from{width:0%} }
  @keyframes dashGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  @keyframes dashTyping { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
  @keyframes dashFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dashShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes agentPanelIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes dropdownIn { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes progressFill { from{width:0%} }
  @keyframes stepIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes resultIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
  @keyframes borderGlow { 0%,100%{border-color:rgba(236,72,153,0.3)} 50%{border-color:rgba(236,72,153,0.7)} }

  .sia-dash *::-webkit-scrollbar { width: 6px; height: 6px; }
  .sia-dash *::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
  .sia-dash *::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 3px; }
  .sia-dash *::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
  .sia-dash { scrollbar-color: rgba(139,92,246,0.25) rgba(255,255,255,0.03); scrollbar-width: thin; }
  .sia-dash * { scrollbar-color: rgba(139,92,246,0.25) rgba(255,255,255,0.03); scrollbar-width: thin; }

  .upload-drop-zone.dragging {
    border-color: rgba(236,72,153,0.7) !important;
    background: rgba(236,72,153,0.1) !important;
  }
`;

// ======================== HR AGENTIC UPLOAD MODAL ========================
type UploadedFile = { name: string; size: string; type: string };
type AnalysisPhase = 'idle' | 'analyzing' | 'done';

function HRAgentUploadModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [jobRole] = useState('Senior Product Designer');
  const fileRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map(f => ({
      name: f.name, size: formatSize(f.size), type: f.type || 'unknown',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  };

  const startAnalysis = () => {
    if (files.length === 0) return;
    setPhase('analyzing');
    setCurrentStep(0);
    setStepsDone([]);
    setProgress(0);

    let prog = 0;
    const totalDur = ANALYSIS_STEPS.reduce((a, s) => a + s.dur, 0);

    const runStep = (idx: number) => {
      if (idx >= ANALYSIS_STEPS.length) { setPhase('done'); setProgress(100); return; }
      setCurrentStep(idx);
      const dur = ANALYSIS_STEPS[idx].dur;
      const startProg = prog;
      const endProg = prog + (dur / totalDur) * 100;
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const frac = Math.min(elapsed / dur, 1);
        setProgress(startProg + (endProg - startProg) * frac);
        if (frac < 1) requestAnimationFrame(tick);
        else { prog = endProg; setStepsDone(p => [...p, idx]); runStep(idx + 1); }
      };
      requestAnimationFrame(tick);
    };
    runStep(0);
  };

  const MOCK_RESULTS = [
    { name: files[0]?.name?.replace(/\.[^.]+$/, '') || 'Candidate A', score: 94, tag: 'Top Match', color: C.green, skills: ['Product Strategy', 'Figma', 'User Research'] },
    { name: 'Secondary Profile', score: 78, tag: 'Strong', color: C.purple, skills: ['UI Design', 'Prototyping', 'A/B Testing'] },
    { name: 'Third Candidate', score: 61, tag: 'Moderate', color: C.gold, skills: ['Visual Design', 'Branding'] },
  ];

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', animation:'overlayIn 0.2s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width:580, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', background:'#0D0B1E', border:`1px solid rgba(236,72,153,0.25)`, borderRadius:18, boxShadow:'0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(236,72,153,0.08)', animation:'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid rgba(236,72,153,0.15)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(236,72,153,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:34, height:34, borderRadius:10, background:C.pinkDim, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid rgba(236,72,153,0.3)` }}>
                <Users size={15} color={C.pink} />
              </div>
              <div style={{ position:'absolute', inset:-2, borderRadius:12, border:`1px solid rgba(236,72,153,0.4)`, animation:'pulseRing 2s ease-out infinite' }} />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text, letterSpacing:'-0.3px' }}>HR Agent</div>
              <div style={{ fontSize:9, color:C.pink, fontWeight:600, letterSpacing:'0.06em' }}>DOCUMENT INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {phase === 'analyzing' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(236,72,153,0.12)', border:`1px solid rgba(236,72,153,0.25)` }}>
                <div style={{ width:6, height:6, borderRadius:3, background:C.pink, animation:'dashPulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize:9, color:C.pink, fontWeight:700 }}>ANALYZING</span>
              </div>
            )}
            {phase === 'done' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(34,197,94,0.12)', border:`1px solid rgba(34,197,94,0.25)` }}>
                <CircleCheck size={11} color={C.green} />
                <span style={{ fontSize:9, color:C.green, fontWeight:700 }}>COMPLETE</span>
              </div>
            )}
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:4, borderRadius:6, display:'flex', transition:'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {/* Phase: Idle */}
          {phase === 'idle' && (
            <>
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(236,72,153,0.07)', border:`1px solid rgba(236,72,153,0.18)`, marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
                <Brain size={14} color={C.pink} style={{ flexShrink:0 }} />
                <div style={{ fontSize:10, color:C.textSec, lineHeight:1.5 }}>
                  HR Agent will <span style={{ color:C.pink, fontWeight:700 }}>automatically parse, score, and rank</span> uploaded documents against your active job role.
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:9, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Active Job Role</label>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                  <Briefcase size={12} color={C.pink} />
                  <span style={{ fontSize:11, color:C.text, fontWeight:600, flex:1 }}>{jobRole}</span>
                  <ChevronDown size={11} color={C.textMut} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14 }}>
                {HR_DOC_TYPES.map((d, i) => (
                  <div key={i} style={{ padding:'8px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:C.text }}>{d.label}</div>
                      <div style={{ fontSize:8, color:C.textMut }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={`upload-drop-zone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border:`2px dashed ${dragging ? C.pink : 'rgba(236,72,153,0.3)'}`, borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer', background: dragging ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.04)', transition:'all 0.2s', marginBottom: files.length > 0 ? 12 : 0 }}
              >
                <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
                <div style={{ width:42, height:42, borderRadius:11, background:'rgba(236,72,153,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', border:'1px solid rgba(236,72,153,0.3)' }}>
                  <CloudUpload size={18} color={C.pink} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:C.textSec, marginBottom:3 }}>Drop resumes or documents here</div>
                <div style={{ fontSize:10, color:C.textMut }}>or <span style={{ color:C.pink, textDecoration:'underline' }}>browse files</span></div>
                <div style={{ fontSize:9, color:C.textMut, marginTop:8 }}>PDF · DOCX · CSV · XLSX · Max 50MB</div>
              </div>
              {files.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:130, overflowY:'auto' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 12px', borderRadius:8, background:'rgba(236,72,153,0.07)', border:`1px solid rgba(236,72,153,0.2)` }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:C.greenDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Check size={12} color={C.green} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize:9, color:C.textMut }}>{f.size}</div>
                      </div>
                      <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:2, display:'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ff8888')}
                        onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Phase: Analyzing */}
          {phase === 'analyzing' && (
            <div style={{ animation:'dashFadeIn 0.4s ease' }}>
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.text }}>Analyzing {files.length} document{files.length > 1 ? 's' : ''}...</span>
                  <span style={{ fontSize:11, fontWeight:800, color:C.pink }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg, ${C.pink}, #c026d3)`, width:`${progress}%`, transition:'width 0.1s linear', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation:'dashShimmer 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(236,72,153,0.06)', border:`1px solid rgba(236,72,153,0.2)`, marginBottom:16, animation:'borderGlow 2s ease-in-out infinite' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:C.pinkDim, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Cpu size={13} color={C.pink} style={{ animation:'spin 2s linear infinite' }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:C.pink }}>HR Agent Processing</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ANALYSIS_STEPS.map((step, i) => {
                    const isDone = stepsDone.includes(i);
                    const isActive = currentStep === i && !isDone;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.id} style={{ display:'flex', alignItems:'center', gap:10, opacity: i > currentStep && !isDone ? 0.3 : 1, transition:'opacity 0.3s', animation: isActive || isDone ? 'stepIn 0.3s ease' : 'none' }}>
                        <div style={{ width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: isDone ? C.greenDim : isActive ? C.pinkDim : 'rgba(255,255,255,0.04)', border:`1px solid ${isDone ? C.green+'44' : isActive ? C.pink+'44' : 'rgba(255,255,255,0.08)'}` }}>
                          {isDone ? <Check size={11} color={C.green} strokeWidth={3} />
                            : isActive ? <StepIcon size={11} color={C.pink} style={{ animation:'spin 1.5s linear infinite' }} />
                            : <StepIcon size={11} color={C.textMut} />}
                        </div>
                        <span style={{ fontSize:10, color: isDone ? C.textSec : isActive ? C.pink : C.textMut, fontWeight: isActive ? 700 : 500 }}>{step.label}</span>
                        {isDone && <Check size={10} color={C.green} strokeWidth={2.5} style={{ marginLeft:'auto' }} />}
                        {isActive && (
                          <div style={{ marginLeft:'auto', display:'flex', gap:2 }}>
                            {[0,1,2].map(j => <div key={j} style={{ width:3, height:3, borderRadius:2, background:C.pink, animation:`dashTyping 1.2s ease infinite ${j*0.15}s` }} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 12px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}` }}>
                    <FileText size={12} color={C.pink} />
                    <span style={{ fontSize:10, color:C.textSec, flex:1 }}>{f.name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Loader size={10} color={C.pink} style={{ animation:'spin 1s linear infinite' }} />
                      <span style={{ fontSize:9, color:C.pink, fontWeight:600 }}>Processing</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase: Done */}
          {phase === 'done' && (
            <div style={{ animation:'resultIn 0.5s ease' }}>
              <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(34,197,94,0.08)', border:`1px solid rgba(34,197,94,0.25)`, marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.greenDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CircleCheck size={18} color={C.green} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.text }}>Analysis Complete</div>
                  <div style={{ fontSize:9, color:C.textSec, marginTop:2 }}>Processed {files.length} document{files.length > 1 ? 's' : ''} · Matched against <span style={{ color:C.pink }}>"{jobRole}"</span></div>
                </div>
                <div style={{ marginLeft:'auto', textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:900, color:C.green }}>{files.length}</div>
                  <div style={{ fontSize:8, color:C.textMut }}>profiles ranked</div>
                </div>
              </div>
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(139,92,246,0.08)', border:`1px solid rgba(139,92,246,0.2)`, marginBottom:14, display:'flex', gap:10 }}>
                <Sparkles size={13} color={C.purpleLight} style={{ flexShrink:0, marginTop:2 }} />
                <div style={{ fontSize:10, color:C.textSec, lineHeight:1.6 }}>
                  <span style={{ color:C.purpleLight, fontWeight:700 }}>AI Insight: </span>
                  Top candidate shows strong alignment in product strategy and UX research. Recommend fast-tracking to technical interview. Second candidate excels in execution but lacks strategic depth.
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Candidate Rankings</div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {MOCK_RESULTS.map((r, i) => (
                    <div key={i} style={{ padding:'10px 14px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, animation:`resultIn 0.4s ease ${i*0.1}s both` }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:22, height:22, borderRadius:6, background:r.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:r.color }}>#{i+1}</div>
                          <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{r.name}</span>
                          <span style={{ fontSize:8, padding:'2px 7px', borderRadius:5, background:r.color+'20', color:r.color, fontWeight:700 }}>{r.tag}</span>
                        </div>
                        <span style={{ fontSize:16, fontWeight:900, color:r.color }}>{r.score}</span>
                      </div>
                      <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.05)', overflow:'hidden', marginBottom:8 }}>
                        <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg, ${r.color}, ${r.color}88)`, width:`${r.score}%`, animation:'progressFill 1s ease' }} />
                      </div>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {r.skills.map((s, j) => <span key={j} style={{ fontSize:8, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:C.textSec, fontWeight:600 }}>{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:`1px solid rgba(236,72,153,0.12)`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(236,72,153,0.03)', flexShrink:0 }}>
          <div style={{ fontSize:9, color:C.textMut }}>
            {phase === 'idle' && `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
            {phase === 'analyzing' && `${Math.round(progress)}% complete`}
            {phase === 'done' && `Ready to export results`}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {phase !== 'analyzing' && (
              <button onClick={onClose} style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:'none', border:`1px solid ${C.border}`, color:C.textMut, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderHover; (e.currentTarget as HTMLElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.textMut; }}>
                {phase === 'done' ? 'Close' : 'Cancel'}
              </button>
            )}
            {phase === 'idle' && (
              <button onClick={startAnalysis} disabled={files.length === 0}
                style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background: files.length > 0 ? `linear-gradient(135deg, ${C.pink}, #c026d3)` : 'rgba(236,72,153,0.15)', border:'none', color: files.length > 0 ? '#fff' : C.textMut, cursor: files.length > 0 ? 'pointer' : 'default', transition:'all 0.15s', display:'flex', alignItems:'center', gap:6 }}>
                <Brain size={12} />Analyze with AI
              </button>
            )}
            {phase === 'done' && (
              <button style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background:`linear-gradient(135deg, ${C.green}, #16a34a)`, border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <ArrowRight size={12} />Export Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== UPLOAD DROPDOWN ========================
function UploadDropdown({ onSelectAgent, onClose }: { onSelectAgent: (id: string) => void; onClose: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:500, width:260, background:'#0F0D20', border:`1px solid rgba(139,92,246,0.2)`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 70px rgba(0,0,0,0.8)', animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 8V2" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3.5 4.5L6 2L8.5 4.5" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 9.5H10" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:3, borderRadius:5 }}>
          <X size={12} />
        </button>
      </div>
      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
        {AGENT_OPTIONS.map(ag => {
          const isHovered = hoveredId === ag.id;
          return (
            <button key={ag.id} onClick={() => { onSelectAgent(ag.id); onClose(); }}
              onMouseEnter={() => setHoveredId(ag.id)} onMouseLeave={() => setHoveredId(null)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10, background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent', border:`1px solid ${isHovered ? 'rgba(139,92,246,0.18)' : 'transparent'}`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s' }}>
              <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}44`, transition:'transform 0.18s', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}>
                <ag.Icon size={16} color={ag.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color: isHovered ? C.text : C.textSec, marginBottom:2 }}>{ag.label}</div>
                <div style={{ fontSize:9, color:C.textMut }}>{ag.sub}</div>
              </div>
              <ArrowRight size={13} color={isHovered ? ag.color : C.textMut} style={{ flexShrink:0, transition:'color 0.15s, transform 0.15s', transform: isHovered ? 'translateX(2px)' : 'none' }} />
            </button>
          );
        })}
      </div>
      <div style={{ padding:'8px 14px 10px', borderTop:`1px solid rgba(139,92,246,0.10)`, display:'flex', alignItems:'center', gap:6 }}>
        <Sparkles size={10} color={C.purpleLight} style={{ opacity:0.7 }} />
        <span style={{ fontSize:9, color:C.textMut }}>Agents auto-process & analyze uploads</span>
      </div>
    </div>
  );
}

// ======================== AGENT SELECTOR PANEL ========================
function AgentSelectorPanel({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', animation:'agentPanelIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
          <Bot size={12} color={C.purple} /> Switch Agent
        </div>
        <span style={{ fontSize:8, color:C.textMut, letterSpacing:'0.1em', textTransform:'uppercase' }}>select to activate</span>
      </div>
      <div style={{ padding:'6px 8px', display:'flex', flexDirection:'column', gap:4 }}>
        {AGENT_OPTIONS.map(ag => {
          const isSelected = selectedId === ag.id;
          return (
            <button key={ag.id} onClick={() => onSelect(ag.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, background: isSelected ? ag.dim : 'transparent', border:`1px solid ${isSelected ? ag.color+'55' : 'transparent'}`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.18s' }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = C.bgCardHover; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}33` }}>
                <ag.Icon size={14} color={ag.color} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color: isSelected ? ag.color : C.text }}>{ag.label}</div>
                <div style={{ fontSize:9, color:C.textMut, marginTop:1 }}>{ag.sub}</div>
              </div>
              {isSelected && (
                <div style={{ width:18, height:18, borderRadius:9, background:ag.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ======================== MAIN COMPONENT ========================
export default function SIADashboard() {
  const [visFeed, setVisFeed] = useState(4);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false);
  const [activeAgentModal, setActiveAgentModal] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const uploadBtnRef = useRef<HTMLDivElement>(null);
  const sidebarAgentBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visFeed < FEED.length) {
      const t = setTimeout(() => setVisFeed(v => v + 1), 1800);
      return () => clearTimeout(t);
    }
  }, [visFeed]);

  useEffect(() => {
    if (!uploadDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (uploadBtnRef.current && !uploadBtnRef.current.contains(e.target as Node)) setUploadDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [uploadDropdownOpen]);

  useEffect(() => {
    if (!sidebarDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (sidebarAgentBtnRef.current && !sidebarAgentBtnRef.current.contains(e.target as Node)) setSidebarDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarDropdownOpen]);

  const counters = [
    useCounter(247, 2500),
    useCounter(5, 1000),
    useCounter(20, 2000),
    useCounter(94.2, 2500, 1),
  ];

  const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div className="sia-dash" style={{ fontFamily: font, color: C.text, background: C.bg, borderRadius: 16, overflow: 'hidden', display: 'flex', height: '100%', minHeight: 500, position: 'relative', border: `1px solid ${C.border}` }}>
      <style>{KEYFRAMES}</style>

      {/* Modals */}
      {activeAgentModal === 'hr' && <HRAgentUploadModal onClose={() => setActiveAgentModal(null)} />}
      {activeAgentModal === 'marketing' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}
          onClick={() => setActiveAgentModal(null)}>
          <div style={{ padding:'30px 40px', borderRadius:16, background:'#0E0C1D', border:`1px solid ${C.goldDim}`, textAlign:'center', animation:'modalIn 0.25s ease' }}>
            <Target size={32} color={C.gold} style={{ marginBottom:12 }} />
            <div style={{ fontSize:14, fontWeight:800, marginBottom:6 }}>Marketing Agent Upload</div>
            <div style={{ fontSize:11, color:C.textMut }}>Coming soon — campaign assets & briefs</div>
          </div>
        </div>
      )}

      {/* Background glows */}
      <div style={{ position:'absolute', top:-120, right:-80, width:450, height:450, background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents:'none', animation:'dashGlow 4s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:-80, left:180, width:350, height:350, background:'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%)', pointerEvents:'none', animation:'dashGlow 5s ease-in-out infinite 1s' }} />

      {/* SIDEBAR */}
      <div style={{ width:52, background:C.bgSidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', flexShrink:0, zIndex:10 }}>
        <img src="/sia-globe-v2.png" alt="SIA" style={{ width:32, height:32, objectFit:'contain', marginBottom:20, mixBlendMode:'lighten' }} />
        <div style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
          {NAV.map((item, i) => {
            const isAgents = item.label === 'Agents';
            const isActive = isAgents ? sidebarDropdownOpen : activeNav === item.label;
            const isHov = navHovered === item.label;

            const navItem = (
              <div
                key={i}
                title={item.label}
                onClick={() => {
                  if (isAgents) {
                    setSidebarDropdownOpen(v => !v);
                  } else {
                    setActiveNav(item.label);
                    setSidebarDropdownOpen(false);
                  }
                }}
                onMouseEnter={() => setNavHovered(item.label)}
                onMouseLeave={() => setNavHovered(null)}
                style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', transition:'all 0.18s', background: isActive ? 'rgba(139,92,246,0.20)' : isHov ? 'rgba(255,255,255,0.05)' : 'transparent', border: isActive ? `1px solid rgba(139,92,246,0.40)` : isHov ? `1px solid rgba(255,255,255,0.08)` : '1px solid transparent' }}
              >
                <item.Icon size={16} color={isActive ? C.purple : isHov ? C.textSec : C.textMut} strokeWidth={isActive ? 2.2 : 1.8} style={{ transition:'color 0.15s' }} />
                {item.badge && (
                  <div style={{ position:'absolute', top:4, right:4, minWidth:14, height:14, borderRadius:7, background:C.purple, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, padding:'0 3px', color:'#fff', border:`1.5px solid ${C.bgSidebar}`, boxShadow:`0 0 6px rgba(139,92,246,0.5)` }}>{item.badge}</div>
                )}
                {isActive && !isAgents && (
                  <div style={{ position:'absolute', left:-1, top:'50%', transform:'translateY(-50%)', width:3, height:18, borderRadius:'0 3px 3px 0', background:C.purple, boxShadow:`0 0 8px ${C.purple}` }} />
                )}
              </div>
            );

            if (isAgents) {
              return (
                <div key={i} ref={sidebarAgentBtnRef} style={{ position:'relative' }}>
                  {navItem}
                  {sidebarDropdownOpen && (
                    <div style={{ position:'absolute', left:44, top:-6, zIndex:999, width:270, background:'#0F0D20', border:`1px solid rgba(139,92,246,0.22)`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 70px rgba(0,0,0,0.85)', animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
                      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.05)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 8V2" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
                            <path d="M3.5 4.5L6 2L8.5 4.5" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 9.5H10" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
                        </div>
                        <button onClick={() => setSidebarDropdownOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:3, borderRadius:5 }}>
                          <X size={12} />
                        </button>
                      </div>
                      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
                        {AGENT_OPTIONS.map(ag => (
                          <button key={ag.id}
                            onClick={() => { setSidebarDropdownOpen(false); setActiveAgentModal(ag.id); }}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10, background:'transparent', border:`1px solid transparent`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.18)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                            <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}44` }}>
                              <ag.Icon size={17} color={ag.color} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{ag.label}</div>
                              <div style={{ fontSize:9, color:C.textMut }}>{ag.sub}</div>
                            </div>
                            <ArrowRight size={13} color={C.textMut} style={{ flexShrink:0 }} />
                          </button>
                        ))}
                      </div>
                      <div style={{ padding:'8px 14px 10px', borderTop:`1px solid rgba(139,92,246,0.10)`, display:'flex', alignItems:'center', gap:6 }}>
                        <Sparkles size={10} color={C.purpleLight} style={{ opacity:0.7 }} />
                        <span style={{ fontSize:9, color:C.textMut }}>Agents auto-process & analyze uploads</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return navItem;
          })}
        </div>
        {/* Avatar */}
        <div style={{ width:30, height:30, borderRadius:15, background:'linear-gradient(135deg, #1a1a2e, #16213e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, cursor:'pointer', color:C.text, border:'2px solid rgba(255,255,255,0.12)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)', letterSpacing:'-0.3px' }}>N</div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, backdropFilter:'blur(10px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:800 }}>{activeNav}</span>
            <span style={{ fontSize:8, fontWeight:700, color:C.purpleLight, background:C.purpleDim, padding:'2px 6px', borderRadius:5, letterSpacing:0.5, textTransform:'uppercase' }}>Beta</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, fontSize:10, color:C.textMut, cursor:'text', minWidth:140 }}>
              <Search size={11} /><span>Search agents...</span>
            </div>
            <div style={{ position:'relative', cursor:'pointer', padding:4 }}>
              <Bell size={14} color={C.textSec} />
              <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold, border:`2px solid ${C.bg}` }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{
          flex:1,
          overflow: activeNav === 'Settings' ? 'hidden' : 'auto',
          padding: activeNav === 'Settings' ? '0' : '12px 16px',
        }}>

          {/* ===== SETTINGS — rendered from separate page ===== */}
          {activeNav === 'Settings' && (
            <SettingsPage onBack={() => setActiveNav('Dashboard')} />
          )}

          {/* ===== DASHBOARD ===== */}
          {activeNav !== 'Settings' && (
            <>
              {/* STATS ROW */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:14 }}>
                {STATS.map((s, i) => (
                  <div key={i} style={{ padding:'10px 12px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, animation:`dashFadeIn 0.5s ease ${i*0.1}s both` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ width:24, height:24, borderRadius:7, background:s.color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <s.Icon size={12} color={s.color} />
                      </div>
                      <span style={{ fontSize:8, color:s.color, fontWeight:700, background:s.color+'25', padding:'2px 6px', borderRadius:5 }}>{s.tag}</span>
                    </div>
                    <div style={{ fontSize:20, fontWeight:800, lineHeight:1, letterSpacing:'-0.5px' }}>{counters[i]}{s.suf}</div>
                    <div style={{ fontSize:9, color:C.textMut, marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* AGENT SELECTOR + Active Agents + Feed */}
              <div style={{ display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:10, marginBottom:14 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <AgentSelectorPanel selectedId={selectedAgent} onSelect={setSelectedAgent} />
                  <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', flex:1 }}>
                    <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                        <Activity size={12} color={C.purple} /> Active Agents
                      </div>
                      <div style={{ fontSize:9, color:C.purpleLight, cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontWeight:700 }}>
                        View all <ChevronRight size={9} />
                      </div>
                    </div>
                    <div style={{ padding:'4px 6px' }}>
                      {AGENTS_DATA.map((a, i) => (
                        <div key={a.id} onMouseEnter={() => setHovered(a.id)} onMouseLeave={() => setHovered(null)}
                          style={{ padding:'7px 8px', borderRadius:8, marginBottom:2, cursor:'pointer', background: hovered===a.id ? C.bgCardHover : 'transparent', border:`1px solid ${hovered===a.id ? C.borderHover : 'transparent'}`, transition:'all 0.2s', animation:`dashFadeIn 0.4s ease ${i*0.08}s both` }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <div style={{ width:22, height:22, borderRadius:6, background:a.dim, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', transform: hovered===a.id ? 'scale(1.08)' : 'scale(1)' }}>
                                <a.Icon size={11} color={a.color} />
                              </div>
                              <div>
                                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3px' }}>{a.name}</div>
                                <div style={{ fontSize:8, color:C.textMut }}>{a.role}</div>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                              <div style={{ width:5, height:5, borderRadius:3, background:a.sColor, animation: a.status!=='Idle' ? 'dashPulse 2s ease-in-out infinite' : 'none', boxShadow: a.status!=='Idle' ? `0 0 6px ${a.sColor}50` : 'none' }} />
                              <span style={{ fontSize:8, color:a.sColor, fontWeight:700, filter:'brightness(1.3)' }}>{a.status}</span>
                            </div>
                          </div>
                          <div style={{ height:2, background:'rgba(255,255,255,0.05)', borderRadius:1, overflow:'hidden', marginBottom:3, position:'relative' }}>
                            <div style={{ height:'100%', borderRadius:1, width:`${a.progress}%`, background:`linear-gradient(90deg, ${a.color}, ${a.color}99)`, animation:`dashFillBar 1.5s ease ${i*0.12}s both`, position:'relative', overflow:'hidden' }}>
                              {a.status !== 'Idle' && (
                                <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', animation:'dashShimmer 2.5s ease-in-out infinite' }} />
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize:8, color:C.textMut, display:'flex', justifyContent:'space-between' }}>
                            <span style={{ maxWidth:'78%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.task}</span>
                            <span style={{ fontWeight:700, color:a.color }}>{a.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                      <Activity size={12} color={C.gold} /> Activity Feed
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:5, height:5, borderRadius:3, background:C.green, animation:'dashPulse 1.5s ease-in-out infinite' }} />
                      <span style={{ fontSize:8, color:C.green, fontWeight:700, filter:'brightness(1.2)' }}>Live</span>
                    </div>
                  </div>
                  <div style={{ padding:'6px 10px', flex:1, overflow:'auto' }}>
                    {FEED.slice(0, visFeed).map((item, i) => (
                      <div key={i} style={{ display:'flex', gap:7, padding:'6px 0', borderBottom: i < visFeed-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', animation:'dashSlideIn 0.4s ease both' }}>
                        <div style={{ width:5, height:5, borderRadius:3, background:item.color, marginTop:4, flexShrink:0, boxShadow:`0 0 4px ${item.color}40` }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, lineHeight:1.5 }}>
                            <span style={{ color:item.color, fontWeight:700 }}>{item.agent}</span>{' '}
                            <span style={{ color:C.textSec }}>{item.text}</span>
                          </div>
                          <div style={{ fontSize:8, color:C.textMut, marginTop:2 }}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                    {visFeed < FEED.length && (
                      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 0', color:C.textMut, fontSize:9 }}>
                        <div style={{ display:'flex', gap:2 }}>
                          {[0,1,2].map(j => <div key={j} style={{ width:3, height:3, borderRadius:2, background:C.purple, animation:`dashTyping 1.4s ease infinite ${j*0.2}s` }} />)}
                        </div>
                        <span>Listening for events...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PERFORMANCE CHART */}
              <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, padding:'10px 14px', animation:'dashFadeIn 0.6s ease 0.5s both' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                    <TrendingUp size={12} color={C.green} /> Weekly Performance
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:8, color:C.textSec }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:8, height:2, borderRadius:1, background:C.purple }} /> Tasks</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:8, height:2, borderRadius:1, background:C.gold }} /> Efficiency</span>
                  </div>
                </div>
                <div style={{ height:90 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART}>
                      <defs>
                        <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.purple} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.gold} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="d" tick={{ fill: C.textMut, fontSize:8 }} axisLine={false} tickLine={false} dy={4} />
                      <Area type="monotone" dataKey="tasks" stroke={C.purple} strokeWidth={1.5} fill="url(#gPurple)" dot={false} />
                      <Area type="monotone" dataKey="eff" stroke={C.gold} strokeWidth={1.5} fill="url(#gGold)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}