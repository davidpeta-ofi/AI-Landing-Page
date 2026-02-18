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

// HR Agent document types it can process
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
  const [jobRole, setJobRole] = useState('Senior Product Designer');
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

    let stepIdx = 0;
    let prog = 0;
    const totalDur = ANALYSIS_STEPS.reduce((a, s) => a + s.dur, 0);

    const runStep = (idx: number) => {
      if (idx >= ANALYSIS_STEPS.length) {
        setPhase('done');
        setProgress(100);
        return;
      }
      setCurrentStep(idx);
      const dur = ANALYSIS_STEPS[idx].dur;
      const startProg = prog;
      const endProg = prog + (dur / totalDur) * 100;
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const frac = Math.min(elapsed / dur, 1);
        setProgress(startProg + (endProg - startProg) * frac);
        if (frac < 1) {
          requestAnimationFrame(tick);
        } else {
          prog = endProg;
          setStepsDone(p => [...p, idx]);
          runStep(idx + 1);
        }
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
      <div style={{
        width: 580, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: '#0D0B1E', border: `1px solid rgba(236,72,153,0.25)`,
        borderRadius: 18, boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(236,72,153,0.08)',
        animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid rgba(236,72,153,0.15)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(236,72,153,0.04)' }}>
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
          {/* Phase: Idle — Upload UI */}
          {phase === 'idle' && (
            <>
              {/* Agent context bar */}
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(236,72,153,0.07)', border:`1px solid rgba(236,72,153,0.18)`, marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
                <Brain size={14} color={C.pink} style={{ flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:C.textSec, lineHeight:1.5 }}>
                    HR Agent will <span style={{ color:C.pink, fontWeight:700 }}>automatically parse, score, and rank</span> uploaded documents against your active job role.
                  </div>
                </div>
              </div>

              {/* Job role selector */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:9, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Active Job Role</label>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                  <Briefcase size={12} color={C.pink} />
                  <span style={{ fontSize:11, color:C.text, fontWeight:600, flex:1 }}>{jobRole}</span>
                  <ChevronDown size={11} color={C.textMut} />
                </div>
              </div>

              {/* Doc types */}
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

              {/* Drop zone */}
              <div
                className={`upload-drop-zone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? C.pink : 'rgba(236,72,153,0.3)'}`,
                  borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer',
                  background: dragging ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.04)',
                  transition:'all 0.2s', marginBottom: files.length > 0 ? 12 : 0,
                }}
              >
                <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
                <div style={{ width:42, height:42, borderRadius:11, background:'rgba(236,72,153,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', border:'1px solid rgba(236,72,153,0.3)' }}>
                  <CloudUpload size={18} color={C.pink} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:C.textSec, marginBottom:3 }}>Drop resumes or documents here</div>
                <div style={{ fontSize:10, color:C.textMut }}>or <span style={{ color:C.pink, textDecoration:'underline' }}>browse files</span></div>
                <div style={{ fontSize:9, color:C.textMut, marginTop:8 }}>PDF · DOCX · CSV · XLSX · Max 50MB</div>
              </div>

              {/* File list */}
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
              {/* Progress bar */}
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

              {/* Agent thinking display */}
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
                      <div key={step.id} style={{ display:'flex', alignItems:'center', gap:10, opacity: i > currentStep && !isDone ? 0.3 : 1, transition:'opacity 0.3s', animation: isActive || isDone ? `stepIn 0.3s ease` : 'none' }}>
                        <div style={{ width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: isDone ? C.greenDim : isActive ? C.pinkDim : 'rgba(255,255,255,0.04)', border:`1px solid ${isDone ? C.green+'44' : isActive ? C.pink+'44' : 'rgba(255,255,255,0.08)'}` }}>
                          {isDone
                            ? <Check size={11} color={C.green} strokeWidth={3} />
                            : isActive
                              ? <StepIcon size={11} color={C.pink} style={{ animation:'spin 1.5s linear infinite' }} />
                              : <StepIcon size={11} color={C.textMut} />
                          }
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

              {/* Files being processed */}
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

          {/* Phase: Done — Results */}
          {phase === 'done' && (
            <div style={{ animation:'resultIn 0.5s ease' }}>
              {/* Summary banner */}
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

              {/* AI Insight */}
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(139,92,246,0.08)', border:`1px solid rgba(139,92,246,0.2)`, marginBottom:14, display:'flex', gap:10 }}>
                <Sparkles size={13} color={C.purpleLight} style={{ flexShrink:0, marginTop:2 }} />
                <div style={{ fontSize:10, color:C.textSec, lineHeight:1.6 }}>
                  <span style={{ color:C.purpleLight, fontWeight:700 }}>AI Insight: </span>
                  Top candidate shows strong alignment in product strategy and UX research. Recommend fast-tracking to technical interview. Second candidate excels in execution but lacks strategic depth.
                </div>
              </div>

              {/* Ranked results */}
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
                        {r.skills.map((s, j) => (
                          <span key={j} style={{ fontSize:8, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:C.textSec, fontWeight:600 }}>{s}</span>
                        ))}
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
              <button
                onClick={startAnalysis}
                disabled={files.length === 0}
                style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background: files.length > 0 ? `linear-gradient(135deg, ${C.pink}, #c026d3)` : 'rgba(236,72,153,0.15)', border:'none', color: files.length > 0 ? '#fff' : C.textMut, cursor: files.length > 0 ? 'pointer' : 'default', transition:'all 0.15s', display:'flex', alignItems:'center', gap:6 }}>
                <Brain size={12} />
                Analyze with AI
              </button>
            )}
            {phase === 'done' && (
              <button style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background:`linear-gradient(135deg, ${C.green}, #16a34a)`, border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <ArrowRight size={12} />
                Export Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== UPLOAD DROPDOWN MENU ========================
function UploadDropdown({ onSelectAgent, onClose }: { onSelectAgent: (id: string) => void; onClose: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <div
      style={{
        position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:500,
        width:260, background:'#0F0D20', border:`1px solid rgba(139,92,246,0.2)`,
        borderRadius:14, overflow:'hidden',
        boxShadow:'0 24px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.06), 0 0 40px rgba(139,92,246,0.05)',
        animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header — matches image 2 exactly */}
      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {/* Small upload arrow icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 8V2" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3.5 4.5L6 2L8.5 4.5" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 9.5H10" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
        </div>
        <button
          onClick={onClose}
          style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, display:'flex', alignItems:'center', justifyContent:'center', padding:3, borderRadius:5, transition:'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textMut; (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Agent options — matches image 2 layout */}
      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
        {AGENT_OPTIONS.map(ag => {
          const isHovered = hoveredId === ag.id;
          return (
            <button
              key={ag.id}
              onClick={() => { onSelectAgent(ag.id); onClose(); }}
              onMouseEnter={() => setHoveredId(ag.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10,
                background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: `1px solid ${isHovered ? 'rgba(139,92,246,0.18)' : 'transparent'}`,
                cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s',
              }}
            >
              {/* Agent icon — matches rounded square in image 2 */}
              <div style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: ag.dim,
                border: `1px solid ${ag.color}44`,
                transition:'transform 0.18s',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}>
                <ag.Icon size={16} color={ag.color} />
              </div>
              {/* Text */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color: isHovered ? C.text : C.textSec, marginBottom:2, transition:'color 0.15s' }}>{ag.label}</div>
                <div style={{ fontSize:9, color:C.textMut }}>{ag.sub}</div>
              </div>
              {/* Arrow */}
              <ArrowRight size={13} color={isHovered ? ag.color : C.textMut} style={{ flexShrink:0, transition:'color 0.15s, transform 0.15s', transform: isHovered ? 'translateX(2px)' : 'none' }} />
            </button>
          );
        })}
      </div>

      {/* Footer — matches image 2 */}
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
            <button key={ag.id} onClick={() => onSelect(ag.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, background: isSelected ? ag.dim : 'transparent', border:`1px solid ${isSelected ? ag.color+'55' : 'transparent'}`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.18s' }}
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


// ======================== SETTINGS PAGE ========================
// Faithful port of SettingsPage.tsx — integrated into SIA Dashboard shell
// ─────────────────────────────────────────────────────────────────────────────

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// ── Starfield (decorative, rendered inside settings panel) ────────────────────
function SStarfield() {
  const stars = [
    { x:8,y:12,s:1.5,o:0.25 },{ x:22,y:45,s:1,o:0.18 },{ x:35,y:8,s:2,o:0.3 },
    { x:47,y:67,s:1,o:0.2 },{ x:55,y:22,s:1.5,o:0.28 },{ x:63,y:88,s:1,o:0.18 },
    { x:71,y:15,s:2,o:0.35 },{ x:82,y:55,s:1.5,o:0.22 },{ x:91,y:33,s:1,o:0.18 },
    { x:97,y:72,s:2,o:0.3 },{ x:15,y:78,s:1,o:0.18 },{ x:28,y:92,s:1.5,o:0.22 },
    { x:42,y:38,s:1,o:0.15 },{ x:58,y:58,s:2,o:0.28 },{ x:76,y:82,s:1,o:0.18 },
    { x:88,y:18,s:1.5,o:0.25 },{ x:4,y:55,s:1,o:0.18 },{ x:18,y:25,s:2,o:0.28 },
    { x:50,y:95,s:1.5,o:0.2 },{ x:68,y:42,s:1,o:0.18 },
  ];
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', borderRadius:'inherit' }}>
      {stars.map((s,i) => (
        <div key={i} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, width:s.s, height:s.s, borderRadius:'50%', background:'#fcd34d', opacity:s.o }} />
      ))}
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,58,138,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function SToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ position:'relative', display:'inline-flex', height:20, width:36, alignItems:'center', borderRadius:10, cursor:'pointer', flexShrink:0, border:'none', outline:`1px solid ${checked ? 'rgba(217,119,6,0.6)' : 'rgba(255,255,255,0.1)'}`, background: checked ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.04)', transition:'all 0.3s' }}>
      <span style={{ display:'inline-block', width:12, height:12, borderRadius:6, marginLeft:3, transition:'all 0.3s', transform: checked ? 'translateX(16px)' : 'translateX(0)', background: checked ? '#f59e0b' : 'rgba(255,255,255,0.25)', boxShadow: checked ? '0 0 8px rgba(245,158,11,0.7)' : 'none' }} />
    </button>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ ...MONO, color:'#f59e0b', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' as const }}>{children}</span>;
}

function SDashedBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ borderRadius:16, padding:'20px', border:'1px dashed rgba(245,158,11,0.28)', background:'rgba(255,255,255,0.015)', ...style }}>{children}</div>;
}

function SCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ borderRadius:16, border:'1px solid rgba(255,255,255,0.055)', background:'rgba(255,255,255,0.025)', overflow:'hidden', ...style }}>{children}</div>;
}

function SRow({ title, desc, children, last }: { title: string; desc?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24, padding:'16px 20px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.045)' }}>
      <div style={{ minWidth:0 }}>
        <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.75)', fontWeight:500 }}>{title}</p>
        {desc && <p style={{ margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.28)', lineHeight:1.5, maxWidth:300 }}>{desc}</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>{children}</div>
    </div>
  );
}

function SGoldBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ ...MONO, display:'inline-flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#08090d', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, boxShadow:'0 0 20px rgba(245,158,11,0.22)', transition:'filter 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter='brightness(1.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter='none'; }}>
      {children}
    </button>
  );
}

function SGhostBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{ ...MONO, display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, cursor:'pointer', border:`1px solid ${danger ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.1)'}`, color: danger ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.38)', background: danger ? 'rgba(239,68,68,0.04)' : 'transparent', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' as const, transition:'filter 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter='brightness(1.3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter='none'; }}>
      {children}
    </button>
  );
}

function SSectionHead({ cat, title, sub }: { cat: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ display:'inline-block', width:8, height:8, borderRadius:4, background:'#f59e0b', boxShadow:'0 0 7px rgba(245,158,11,0.9)' }} />
        <SLabel>{cat}</SLabel>
      </div>
      <h2 style={{ ...MONO, fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px', margin:'0 0 8px' }}>{title}</h2>
      <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.33)', lineHeight:1.6, maxWidth:400 }}>{sub}</p>
    </div>
  );
}

function SSaveBar() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ marginTop:28, display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10 }}>
      <SGhostBtn>Cancel</SGhostBtn>
      <SGoldBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </SGoldBtn>
    </div>
  );
}

function STextInput({ label, value, onChange, type='text', rows }: { label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number }) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = { background:'rgba(255,255,255,0.03)', border:`1px solid ${focused ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.08)'}`, borderRadius:10, color:'rgba(255,255,255,0.78)', fontSize:13, padding:'10px 14px', width:'100%', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s', boxSizing:'border-box' as const, boxShadow: focused ? '0 0 0 3px rgba(245,158,11,0.07)' : 'none' };
  return (
    <div>
      <p style={{ ...MONO, margin:'0 0 6px', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.28)' }}>{label}</p>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...base, resize:'none' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
      }
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function SProfileSection() {
  const [name, setName] = useState('Jordan Mercer');
  const [email, setEmail] = useState('jordan@example.com');
  const [bio, setBio] = useState('Product designer & occasional builder.');
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <SSectionHead cat="Account" title="Profile" sub="Your public identity and account credentials." />
      <SDashedBox style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div onClick={() => fileRef.current?.click()} style={{ ...MONO, width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#92400e,#d97706)', border:'1px solid rgba(245,158,11,0.35)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:22, fontWeight:700, color:'#fff', boxShadow:'0 0 20px rgba(245,158,11,0.14)', flexShrink:0, transition:'opacity 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity='0.8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity='1'; }}>
            {name.charAt(0)}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} />
          <div>
            <p style={{ margin:'0 0 3px', fontSize:13, color:'rgba(255,255,255,0.65)', fontWeight:500 }}>Profile photo</p>
            <p style={{ margin:'0 0 8px', fontSize:11, color:'rgba(255,255,255,0.28)' }}>JPG, PNG · max 2 MB</p>
            <button onClick={() => fileRef.current?.click()} style={{ ...MONO, background:'none', border:'none', cursor:'pointer', color:'#f59e0b', fontSize:10, padding:0 }}>Upload photo →</button>
          </div>
        </div>
      </SDashedBox>
      <SCard style={{ marginBottom:14 }}>
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <STextInput label="Full name" value={name} onChange={setName} />
            <STextInput label="Email address" value={email} onChange={setEmail} type="email" />
          </div>
          <STextInput label="Bio" value={bio} onChange={setBio} rows={3} />
        </div>
      </SCard>
      <div style={{ borderRadius:16, border:'1px solid rgba(239,68,68,0.22)', background:'rgba(239,68,68,0.035)', padding:20 }}>
        <SLabel>Danger Zone</SLabel>
        <p style={{ margin:'8px 0 16px', fontSize:11, color:'rgba(255,255,255,0.28)', lineHeight:1.6 }}>Permanently delete your account and all associated data. This cannot be undone.</p>
        <SGhostBtn danger>Delete account</SGhostBtn>
      </div>
      <SSaveBar />
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function SNotificationsSection() {
  const [p, setP] = useState({ productUpdates:true, securityAlerts:true, weeklyDigest:false, comments:true, mentions:true, teamActivity:false, marketing:false, sms:false });
  const t = (k: keyof typeof p) => (v: boolean) => setP(prev => ({ ...prev, [k]:v }));
  return (
    <div>
      <SSectionHead cat="Alerts" title="Notifications" sub="Choose what you hear about and how." />
      <SCard style={{ marginBottom:12 }}>
        <div style={{ padding:'16px 20px 6px' }}><SLabel>Email</SLabel></div>
        <SRow title="Product updates" desc="New features and improvements."><SToggle checked={p.productUpdates} onChange={t('productUpdates')} /></SRow>
        <SRow title="Security alerts" desc="Login attempts and security events."><SToggle checked={p.securityAlerts} onChange={t('securityAlerts')} /></SRow>
        <SRow title="Weekly digest" desc="Activity summary every Monday."><SToggle checked={p.weeklyDigest} onChange={t('weeklyDigest')} /></SRow>
        <SRow title="Marketing & offers" desc="Promotions and special offers." last><SToggle checked={p.marketing} onChange={t('marketing')} /></SRow>
      </SCard>
      <SCard style={{ marginBottom:12 }}>
        <div style={{ padding:'16px 20px 6px' }}><SLabel>In-App</SLabel></div>
        <SRow title="Comments" desc="When someone comments on your work."><SToggle checked={p.comments} onChange={t('comments')} /></SRow>
        <SRow title="Mentions" desc="When you are @mentioned anywhere."><SToggle checked={p.mentions} onChange={t('mentions')} /></SRow>
        <SRow title="Team activity" desc="Updates from your team members." last><SToggle checked={p.teamActivity} onChange={t('teamActivity')} /></SRow>
      </SCard>
      <SCard>
        <SRow title="SMS notifications" desc="Critical alerts via text. Standard rates apply." last><SToggle checked={p.sms} onChange={t('sms')} /></SRow>
      </SCard>
      <SSaveBar />
    </div>
  );
}

// ── Appearance ────────────────────────────────────────────────────────────────
function SAppearanceSection() {
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('dark');
  const [accent, setAccent] = useState('amber');
  const [density, setDensity] = useState<'compact'|'default'|'comfortable'>('default');
  const [fontSize, setFontSize] = useState(14);
  const ACCENTS = [{ id:'amber', c:'#f59e0b' }, { id:'sky', c:'#38bdf8' }, { id:'rose', c:'#fb7185' }, { id:'emerald', c:'#34d399' }, { id:'violet', c:'#a78bfa' }];
  const THEMES  = [{ id:'light', label:'Light', icon:'☀' }, { id:'dark', label:'Dark', icon:'◗' }, { id:'system', label:'System', icon:'⬡' }];
  return (
    <div>
      <SSectionHead cat="Display" title="Appearance" sub="Personalise how the interface looks and feels." />
      <SDashedBox style={{ marginBottom:12 }}>
        <SLabel>Theme</SLabel>
        <div style={{ display:'flex', gap:10, marginTop:12 }}>
          {THEMES.map(th => (
            <button key={th.id} onClick={() => setTheme(th.id as typeof theme)} style={{ flex:1, padding:'14px 10px', borderRadius:12, textAlign:'center' as const, cursor:'pointer', border:'none', outline:`1px solid ${theme===th.id ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.06)'}`, background: theme===th.id ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.015)', boxShadow: theme===th.id ? '0 0 18px rgba(245,158,11,0.09)' : 'none', transition:'all 0.2s' }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{th.icon}</div>
              <div style={{ ...MONO, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' as const, color: theme===th.id ? '#f59e0b' : 'rgba(255,255,255,0.32)' }}>{th.label}</div>
            </button>
          ))}
        </div>
      </SDashedBox>
      <SCard style={{ marginBottom:12 }}>
        <SRow title="Accent color" desc="Used for highlights, buttons, and interactive elements.">
          <div style={{ display:'flex', gap:8 }}>
            {ACCENTS.map(a => <button key={a.id} onClick={() => setAccent(a.id)} style={{ width:22, height:22, borderRadius:11, background:a.c, border:'none', cursor:'pointer', boxShadow: accent===a.id ? `0 0 10px ${a.c}90` : 'none', transform: accent===a.id ? 'scale(1.22)' : 'scale(1)', outline: accent===a.id ? `2px solid ${a.c}55` : 'none', outlineOffset:2, transition:'all 0.2s' }} />)}
          </div>
        </SRow>
        <SRow title="Interface density" desc="How compact or spacious the layout feels.">
          <div style={{ display:'flex', overflow:'hidden', borderRadius:10, outline:'1px solid rgba(255,255,255,0.09)' }}>
            {(['compact','default','comfortable'] as const).map(d => <button key={d} onClick={() => setDensity(d)} style={{ ...MONO, padding:'7px 12px', background: density===d ? '#f59e0b' : 'transparent', color: density===d ? '#08090d' : 'rgba(255,255,255,0.33)', fontSize:9, letterSpacing:'0.06em', textTransform:'capitalize' as const, border:'none', cursor:'pointer', transition:'all 0.2s' }}>{d}</button>)}
          </div>
        </SRow>
        <SRow title="Base font size" desc={`${fontSize}px — affects body text throughout the app.`} last>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setFontSize(s => Math.max(12,s-1))} style={{ width:30, height:30, borderRadius:8, border:'1px solid rgba(255,255,255,0.09)', background:'transparent', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, fontWeight:700 }}>−</button>
            <span style={{ ...MONO, color:'#f59e0b', fontSize:13, width:28, textAlign:'center' as const }}>{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(20,s+1))} style={{ width:30, height:30, borderRadius:8, border:'1px solid rgba(255,255,255,0.09)', background:'transparent', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, fontWeight:700 }}>+</button>
          </div>
        </SRow>
      </SCard>
      <SSaveBar />
    </div>
  );
}

// ── Privacy ───────────────────────────────────────────────────────────────────
function SPrivacySection() {
  const [p, setP] = useState({ twoFactor:false, activityLog:true, publicProfile:true, dataSharing:false, sessionTimeout:'30' });
  const t = (k: keyof typeof p) => (v: boolean) => setP(prev => ({ ...prev, [k]:v }));
  const SESS = [{ value:'15', label:'15 min' }, { value:'30', label:'30 min' }, { value:'60', label:'1 hour' }, { value:'240', label:'4 hours' }, { value:'never', label:'Never' }];
  return (
    <div>
      <SSectionHead cat="Security" title="Privacy" sub="Control your data and keep your account safe." />
      <SCard style={{ marginBottom:12 }}>
        <div style={{ padding:'16px 20px 6px' }}><SLabel>Security</SLabel></div>
        <SRow title="Two-factor authentication" desc="Add an extra layer with an authenticator app or SMS.">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {p.twoFactor && <span style={{ ...MONO, background:'rgba(52,211,153,0.09)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)', padding:'2px 8px', borderRadius:10, fontSize:9, letterSpacing:'0.08em' }}>ENABLED</span>}
            <SToggle checked={p.twoFactor} onChange={t('twoFactor')} />
          </div>
        </SRow>
        <SRow title="Auto-logout" desc="Automatically sign you out after inactivity.">
          <select value={p.sessionTimeout} onChange={e => setP(prev => ({ ...prev, sessionTimeout:e.target.value }))} style={{ ...MONO, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, color:'rgba(255,255,255,0.65)', padding:'8px 12px', fontSize:11, outline:'none', cursor:'pointer' }}>
            {SESS.map(s => <option key={s.value} value={s.value} style={{ background:'#0a0e1a' }}>{s.label}</option>)}
          </select>
        </SRow>
        <SRow title="Active sessions" desc="View and revoke access from other devices." last><SGhostBtn>Manage →</SGhostBtn></SRow>
      </SCard>
      <SCard style={{ marginBottom:12 }}>
        <div style={{ padding:'16px 20px 6px' }}><SLabel>Privacy</SLabel></div>
        <SRow title="Public profile" desc="Allow others to find and view your profile."><SToggle checked={p.publicProfile} onChange={t('publicProfile')} /></SRow>
        <SRow title="Activity log" desc="Keep a log of actions taken on your account."><SToggle checked={p.activityLog} onChange={t('activityLog')} /></SRow>
        <SRow title="Usage data sharing" desc="Help improve the product with anonymised data." last><SToggle checked={p.dataSharing} onChange={t('dataSharing')} /></SRow>
      </SCard>
      <SDashedBox>
        <SLabel>Export Data</SLabel>
        <p style={{ margin:'8px 0 14px', fontSize:11, color:'rgba(255,255,255,0.28)', lineHeight:1.6 }}>Download a copy of all data associated with your account.</p>
        <div style={{ display:'flex', gap:10 }}><SGhostBtn>Export JSON</SGhostBtn><SGhostBtn>Export CSV</SGhostBtn></div>
      </SDashedBox>
      <SSaveBar />
    </div>
  );
}

// ── Billing ───────────────────────────────────────────────────────────────────
function SBillingSection() {
  const [activePlan] = useState<'free'|'pro'|'team'>('pro');
  const PLANS = [
    { id:'free',  name:'Free',  price:'$0',  period:'/mo', features:['3 projects','1 GB storage','Community support'] },
    { id:'pro',   name:'Pro',   price:'$12', period:'/mo', features:['Unlimited projects','20 GB storage','Priority support','Custom domain'] },
    { id:'team',  name:'Team',  price:'$49', period:'/mo', features:['Everything in Pro','5 seats','Team analytics','SSO & SAML'] },
  ] as const;
  const INVOICES = [{ date:'Feb 1, 2026', amount:'$12.00' }, { date:'Jan 1, 2026', amount:'$12.00' }, { date:'Dec 1, 2025', amount:'$12.00' }];
  return (
    <div>
      <SSectionHead cat="Subscription" title="Billing" sub="Manage your plan, payment method, and invoices." />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
        {PLANS.map(p => (
          <div key={p.id} style={{ borderRadius:16, padding:18, border: activePlan===p.id ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.055)', background: activePlan===p.id ? 'rgba(245,158,11,0.055)' : 'rgba(255,255,255,0.02)', boxShadow: activePlan===p.id ? '0 0 22px rgba(245,158,11,0.07)' : 'none', transition:'all 0.2s' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ ...MONO, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.75)', letterSpacing:'0.1em', textTransform:'uppercase' as const }}>{p.name}</span>
              {activePlan===p.id && <span style={{ ...MONO, background:'rgba(245,158,11,0.14)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.3)', padding:'2px 7px', borderRadius:8, fontSize:9, letterSpacing:'0.08em' }}>ACTIVE</span>}
            </div>
            <p style={{ ...MONO, margin:'0 0 12px', fontSize:26, fontWeight:900, color:'#fff' }}>{p.price}<span style={{ fontSize:12, fontWeight:400, color:'rgba(255,255,255,0.28)' }}>{p.period}</span></p>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
              {p.features.map(f => <div key={f} style={{ fontSize:11, color:'rgba(255,255,255,0.38)', display:'flex', alignItems:'center', gap:6 }}><span style={{ color:'#f59e0b' }}>✓</span>{f}</div>)}
            </div>
            {activePlan===p.id
              ? <div style={{ ...MONO, textAlign:'center' as const, padding:8, borderRadius:10, border:'1px solid rgba(245,158,11,0.18)', color:'rgba(245,158,11,0.38)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' as const }}>Current Plan</div>
              : <button style={{ ...MONO, width:'100%', padding:8, borderRadius:10, border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.45)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' as const, cursor:'pointer' }}>Switch →</button>
            }
          </div>
        ))}
      </div>
      <SCard style={{ marginBottom:14 }}>
        <SRow title="Payment method" desc="Visa ending in 4242 · Expires 08/27"><SGhostBtn>Update</SGhostBtn></SRow>
        <SRow title="Billing email" desc="invoices@example.com"><SGhostBtn>Change</SGhostBtn></SRow>
        <SRow title="Billing cycle" desc="Renews March 1, 2026 · Pro Plan" last><SGhostBtn danger>Cancel plan</SGhostBtn></SRow>
      </SCard>
      <SCard>
        <div style={{ padding:'16px 20px 6px' }}><SLabel>Invoice History</SLabel></div>
        {INVOICES.map((inv, i) => (
          <div key={inv.date} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom: i < INVOICES.length-1 ? '1px solid rgba(255,255,255,0.045)' : 'none' }}>
            <div>
              <p style={{ ...MONO, margin:'0 0 3px', fontSize:13, color:'rgba(255,255,255,0.65)' }}>{inv.date}</p>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.28)' }}>{inv.amount} · Pro Plan</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ ...MONO, background:'rgba(52,211,153,0.08)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)', padding:'2px 8px', borderRadius:8, fontSize:9, letterSpacing:'0.08em' }}>PAID</span>
              <button style={{ ...MONO, background:'none', border:'none', cursor:'pointer', color:'#f59e0b', fontSize:10, fontWeight:700 }}>PDF</button>
            </div>
          </div>
        ))}
      </SCard>
    </div>
  );
}

// ── Nav config ────────────────────────────────────────────────────────────────
type SettingsSection = 'profile' | 'notifications' | 'appearance' | 'privacy' | 'billing';
const S_NAV: { id: SettingsSection; label: string; icon: string }[] = [
  { id:'profile',       label:'Profile',       icon:'◎' },
  { id:'notifications', label:'Notifications', icon:'◈' },
  { id:'appearance',    label:'Appearance',    icon:'◇' },
  { id:'privacy',       label:'Privacy',       icon:'◉' },
  { id:'billing',       label:'Billing',       icon:'◆' },
];

// ── SettingsView — rendered inside SIA Dashboard shell ────────────────────────
function SettingsView({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<SettingsSection>('profile');

  const SECTIONS: Record<SettingsSection, React.ReactElement> = {
    profile:       <SProfileSection />,
    notifications: <SNotificationsSection />,
    appearance:    <SAppearanceSection />,
    privacy:       <SPrivacySection />,
    billing:       <SBillingSection />,
  };

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', position:'relative', fontFamily:"'JetBrains Mono',monospace" }}>
      <SStarfield />

      {/* ── Left sidebar nav (matches SettingsPage.tsx) ── */}
      <nav style={{ position:'relative', zIndex:2, width:200, flexShrink:0, display:'flex', flexDirection:'column', padding:'20px 12px', gap:2, borderRight:'1px solid rgba(255,255,255,0.045)', background:'rgba(6,10,18,0.6)', backdropFilter:'blur(14px)' }}>

        {/* Back button — identical to SettingsPage header back */}
        <button onClick={onBack} style={{ ...MONO, display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.38)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' as const, padding:'8px 10px', marginBottom:20, borderRadius:8, transition:'color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.38)'; }}>
          <ArrowLeft size={12} /> Back
        </button>

        {/* "Settings" label */}
        <p style={{ ...MONO, margin:'0 0 8px', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.18)', padding:'0 8px' }}>Settings</p>

        {/* Nav items — matching SettingsPage sidebar exactly */}
        {S_NAV.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background: active===item.id ? 'rgba(245,158,11,0.08)' : 'transparent', border:`1px solid ${active===item.id ? 'rgba(245,158,11,0.2)' : 'transparent'}`, cursor:'pointer', textAlign:'left' as const, width:'100%', transition:'all 0.2s' }}
            onMouseEnter={e => { if (active!==item.id) { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.border='1px solid rgba(255,255,255,0.06)'; } }}
            onMouseLeave={e => { if (active!==item.id) { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.border='1px solid transparent'; } }}>
            <span style={{ fontSize:15, color: active===item.id ? '#f59e0b' : 'rgba(255,255,255,0.22)' }}>{item.icon}</span>
            <span style={{ ...MONO, fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' as const, color: active===item.id ? '#f59e0b' : 'rgba(255,255,255,0.38)' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Main content ── */}
      <main style={{ position:'relative', zIndex:2, flex:1, overflow:'auto', padding:'32px 36px' }}>
        <div key={active} style={{ animation:'dashFadeIn 0.3s ease', maxWidth:740 }}>
          {SECTIONS[active]}
        </div>
      </main>
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

  // Close dropdown on outside click
  useEffect(() => {
    if (!uploadDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (uploadBtnRef.current && !uploadBtnRef.current.contains(e.target as Node)) {
        setUploadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [uploadDropdownOpen]);

  // Close sidebar agent dropdown on outside click
  useEffect(() => {
    if (!sidebarDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (sidebarAgentBtnRef.current && !sidebarAgentBtnRef.current.contains(e.target as Node)) {
        setSidebarDropdownOpen(false);
      }
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

  const handleAgentSelected = (id: string) => {
    setActiveAgentModal(id);
  };

  return (
    <div className="sia-dash" style={{ fontFamily: font, color: C.text, background: C.bg, borderRadius: 16, overflow: 'hidden', display: 'flex', height: '100%', minHeight: 500, position: 'relative', border: `1px solid ${C.border}` }}>
      <style>{KEYFRAMES}</style>

      {/* HR Agent Modal */}
      {activeAgentModal === 'hr' && <HRAgentUploadModal onClose={() => setActiveAgentModal(null)} />}

      {/* Marketing modal placeholder */}
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
                style={{
                  width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', position:'relative', transition:'all 0.18s',
                  background: isActive
                    ? 'rgba(139,92,246,0.20)'
                    : isHov ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: isActive
                    ? `1px solid rgba(139,92,246,0.40)`
                    : isHov ? `1px solid rgba(255,255,255,0.08)` : '1px solid transparent',
                }}
              >
                <item.Icon
                  size={16}
                  color={isActive ? C.purple : isHov ? C.textSec : C.textMut}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ transition:'color 0.15s' }}
                />
                {/* Badge */}
                {item.badge && (
                  <div style={{
                    position:'absolute', top:4, right:4, minWidth:14, height:14, borderRadius:7,
                    background:C.purple, fontSize:8, display:'flex', alignItems:'center',
                    justifyContent:'center', fontWeight:800, padding:'0 3px', color:'#fff',
                    border:`1.5px solid ${C.bgSidebar}`,
                    boxShadow:`0 0 6px rgba(139,92,246,0.5)`,
                  }}>{item.badge}</div>
                )}
                {/* Active left bar */}
                {isActive && !isAgents && (
                  <div style={{
                    position:'absolute', left:-1, top:'50%', transform:'translateY(-50%)',
                    width:3, height:18, borderRadius:'0 3px 3px 0', background:C.purple,
                    boxShadow:`0 0 8px ${C.purple}`,
                  }} />
                )}
              </div>
            );

            // Wrap Agents item in a ref div for positioning the dropdown
            if (isAgents) {
              return (
                <div key={i} ref={sidebarAgentBtnRef} style={{ position:'relative' }}>
                  {navItem}
                  {/* Sidebar agent dropdown — opens to the RIGHT of sidebar */}
                  {sidebarDropdownOpen && (
                    <div style={{
                      position:'absolute',
                      left: 44,
                      top: -6,
                      zIndex: 999,
                      width: 270,
                      background:'#0F0D20',
                      border:`1px solid rgba(139,92,246,0.22)`,
                      borderRadius:14, overflow:'hidden',
                      boxShadow:'0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(139,92,246,0.06), 0 0 50px rgba(139,92,246,0.06)',
                      animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      {/* Header */}
                      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.05)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 8V2" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
                            <path d="M3.5 4.5L6 2L8.5 4.5" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 9.5H10" stroke={C.purpleLight} strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
                        </div>
                        <button
                          onClick={() => setSidebarDropdownOpen(false)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, display:'flex', alignItems:'center', padding:3, borderRadius:5, transition:'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textMut; }}
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Agent rows */}
                      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
                        {AGENT_OPTIONS.map(ag => (
                          <button
                            key={ag.id}
                            onClick={() => {
                              setSidebarDropdownOpen(false);
                              setActiveAgentModal(ag.id);
                            }}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10, background:'transparent', border:`1px solid transparent`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.18)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                          >
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

                      {/* Footer */}
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
        <div style={{
          width:30, height:30, borderRadius:15,
          background:'linear-gradient(135deg, #1a1a2e, #16213e)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:800, cursor:'pointer', color:C.text,
          border:'2px solid rgba(255,255,255,0.12)',
          boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
          letterSpacing:'-0.3px',
        }}>N</div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, backdropFilter:'blur(10px)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:800 }}>{activeNav}</span>
              <span style={{ fontSize:8, fontWeight:700, color:C.purpleLight, background:C.purpleDim, padding:'2px 6px', borderRadius:5, letterSpacing:0.5, textTransform:'uppercase' }}>Beta</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, fontSize:10, color:C.textMut, cursor:'text', minWidth:140 }}>
              <Search size={11} />
              <span>Search agents...</span>
            </div>

            <div style={{ position:'relative', cursor:'pointer', padding:4 }}>
              <Bell size={14} color={C.textSec} />
              <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold, border:`2px solid ${C.bg}` }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow: activeNav === 'Settings' ? 'hidden' : 'auto', padding: activeNav === 'Settings' ? '0' : '12px 16px' }}>
          {/* ===== SETTINGS VIEW ===== */}
          {activeNav === 'Settings' && (
            <SettingsView onBack={() => setActiveNav('Dashboard')} />
          )}

          {/* ===== DASHBOARD VIEW ===== */}
          {activeNav !== 'Settings' && (<>
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
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:8, height:2, borderRadius:1, background:C.purple }} /> Tasks
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:8, height:2, borderRadius:1, background:C.gold }} /> Efficiency
                </span>
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
          </>)}
        </div>
      </div>
    </div>
  );
}