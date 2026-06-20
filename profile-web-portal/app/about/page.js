"use client";

import { useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Sora:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090f;--s1:#0e111a;--s2:#141926;--s3:#1b2235;--s4:#232b40;
  --b1:#252d42;--b2:#2e3850;
  --tx:#dde4f0;--t2:#8892a8;--t3:#4a5470;
  --blue:#4d8ef0;--blue2:#1e4fa8;--blue3:#0d2d6e;
  --teal:#38c9a8;--teal2:#0f7a5e;
  --amber:#e09a2a;--red:#e05252;--green:#4caf80;
  --purple:#9b7be8;--pink:#e06aa8;
  --mono:'IBM Plex Mono',monospace;--sans:'Sora',sans-serif;
}
html,body{height:100%;background:var(--bg);color:var(--tx);font-family:var(--sans)}
*{scrollbar-width:thin;scrollbar-color:var(--b2) transparent}
*::-webkit-scrollbar{width:4px;height:4px}
*::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px}
.app{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}
.hdr{display:flex;align-items:center;gap:14px;padding:12px 20px;border-bottom:1px solid var(--b1);background:var(--s1);position:sticky;top:0;z-index:50}
.hdr-logo{width:36px;height:36px;border-radius:8px;background:var(--blue3);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:600;color:var(--blue);border:1px solid var(--blue2)}
.hdr-title{font-size:14px;font-weight:600;letter-spacing:.5px}
.hdr-sub{font-size:10px;color:var(--t3);font-family:var(--mono)}
.hdr-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.pulse{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:blink 2s infinite;flex-shrink:0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hdr-pill{font-size:10px;color:var(--t2);font-family:var(--mono);padding:4px 10px;background:var(--s3);border:1px solid var(--b1);border-radius:20px;display:flex;align-items:center;gap:6px}
.page{max-width:1280px;margin:0 auto;padding:28px 24px;display:flex;flex-direction:column;gap:24px;width:100%}

/* hero */
.hero{background:linear-gradient(135deg,var(--s1) 0%,var(--blue3) 100%);border:1px solid var(--b2);border-radius:16px;padding:32px 36px;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234d8ef0' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");pointer-events:none}
.hero-badge{font-family:var(--mono);font-size:9px;color:var(--teal);letter-spacing:2px;text-transform:uppercase;padding:3px 10px;background:rgba(56,201,168,.1);border:1px solid rgba(56,201,168,.2);border-radius:20px;margin-bottom:12px;display:inline-block}
.hero-title{font-size:26px;font-weight:600;line-height:1.2;margin-bottom:10px}
.hero-title span{color:var(--blue)}
.hero-desc{font-size:13px;color:var(--t2);line-height:1.7;max-width:560px}
.hero-stats{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
.hstat{background:rgba(255,255,255,.04);border:1px solid var(--b1);border-radius:10px;padding:14px 20px;text-align:center;min-width:120px}
.hstat-val{font-family:var(--mono);font-size:22px;font-weight:600;color:var(--blue);line-height:1}
.hstat-lbl{font-size:10px;color:var(--t3);margin-top:4px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.5px}

/* section titles */
.section-title{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:2px;color:var(--t3);text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.section-title::after{content:'';flex:1;height:1px;background:var(--b1)}

/* tech stack */
.tech-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.tech-card{background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:16px 14px;display:flex;flex-direction:column;gap:8px;transition:border-color .2s}
.tech-card:hover{border-color:var(--b2)}
.tech-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.tech-name{font-size:12px;font-weight:600;font-family:var(--mono)}
.tech-desc{font-size:11px;color:var(--t2);line-height:1.5}
.tech-tag{font-size:9px;padding:2px 7px;border-radius:10px;font-family:var(--mono);font-weight:600;align-self:flex-start;margin-top:2px}

/* params overview */
.params-hero{background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:20px 24px;display:flex;align-items:center;gap:20px}
.params-num{font-family:var(--mono);font-size:52px;font-weight:600;color:var(--blue);line-height:1}
.params-text{flex:1}
.params-text h3{font-size:15px;font-weight:600;margin-bottom:4px}
.params-text p{font-size:12px;color:var(--t2);line-height:1.6}
.perf-badges{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.perf-badge{font-family:var(--mono);font-size:10px;padding:4px 10px;border-radius:6px;font-weight:600}

/* category grid */
.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.cat-card{background:var(--s1);border:1px solid var(--b1);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .15s}
.cat-card:hover{border-color:var(--b2);transform:translateY(-1px)}
.cat-card.expanded{border-color:var(--blue2)}
.cat-hdr{padding:12px 14px;display:flex;align-items:center;gap:10px}
.cat-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.cat-name{font-size:12px;font-weight:600;flex:1}
.cat-count{font-family:var(--mono);font-size:10px;color:var(--t3);background:var(--s3);padding:2px 7px;border-radius:10px}
.cat-chevron{font-size:10px;color:var(--t3);transition:transform .2s}
.cat-chevron.open{transform:rotate(180deg)}
.cat-body{padding:0 14px 12px;display:flex;flex-direction:column;gap:4px}
.param-row{display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--s2);border-radius:6px}
.param-num{font-family:var(--mono);font-size:9px;color:var(--t3);width:20px;flex-shrink:0}
.param-name{font-size:11px;color:var(--t2);flex:1}
.param-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0}

/* sub params */
.sub-params{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;padding-left:28px}
.sp-tag{font-family:var(--mono);font-size:9px;padding:2px 7px;background:var(--s3);border:1px solid var(--b1);border-radius:4px;color:var(--t2)}

/* crimes */
.crime-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.crime-card{background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:16px 18px;display:flex;gap:14px;align-items:flex-start;transition:border-color .2s}
.crime-card:hover{border-color:var(--red)}
.crime-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.crime-title{font-size:12px;font-weight:600;margin-bottom:4px}
.crime-desc{font-size:11px;color:var(--t2);line-height:1.5}
.crime-key{font-family:var(--mono);font-size:9px;color:var(--t3);margin-top:6px;padding:2px 7px;background:var(--s3);border-radius:4px;display:inline-block}

/* rolling windows */
.window-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.wtab{padding:5px 12px;border-radius:6px;font-family:var(--mono);font-size:11px;cursor:pointer;border:1px solid var(--b1);background:var(--s2);color:var(--t2);transition:all .15s}
.wtab.active{background:var(--blue2);border-color:var(--blue2);color:#c8d8f8}
.window-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.wm-card{background:var(--s1);border:1px solid var(--b1);border-radius:8px;padding:12px 14px}
.wm-lbl{font-size:9px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.wm-val{font-family:var(--mono);font-size:15px;font-weight:600;line-height:1}
.wm-sub{font-size:9px;color:var(--t3);margin-top:3px}

/* footer */
.footer{padding:20px 24px;border-top:1px solid var(--b1);background:var(--s1);text-align:center}
.footer-text{font-family:var(--mono);font-size:10px;color:var(--t3)}

/* responsive */
@media(max-width:900px){.cat-grid{grid-template-columns:repeat(2,1fr)}.tech-grid{grid-template-columns:repeat(2,1fr)}.crime-grid{grid-template-columns:1fr}.window-metrics{grid-template-columns:repeat(3,1fr)}.hero{grid-template-columns:1fr}.hero-stats{flex-direction:row}}
@media(max-width:600px){.cat-grid{grid-template-columns:1fr}.tech-grid{grid-template-columns:1fr}.params-hero{flex-direction:column}.window-metrics{grid-template-columns:repeat(2,1fr)}}
`;

const CATEGORIES = [
  {
    id: "sent",
    name: "Sent Transactions",
    icon: "↑",
    color: "#4d8ef0",
    bg: "#0d2040",
    params: [
      { name: "Total Sent Amount", subs: [] },
      { name: "Average Sent Amount", subs: [] },
      { name: "Standard Deviation", subs: [] },
      { name: "Transaction Count", subs: [] },
    ],
  },
  {
    id: "received",
    name: "Received Transactions",
    icon: "↓",
    color: "#4caf80",
    bg: "#0d301a",
    params: [
      { name: "Total Received Amount", subs: [] },
      { name: "Average Received Amount", subs: [] },
      { name: "Standard Deviation", subs: [] },
      { name: "Transaction Count", subs: [] },
    ],
  },
  
  {
    id: "manner",
    name: "Transaction Manner",
    icon: "💳",
    color: "#e09a2a",
    bg: "#2a1e00",
    params: [
      { name: "Cash to Non-Cash Ratio", subs: [] },
      { name: "Conducting Manner List", subs: [] },
    ],
  },
  {
    id: "location",
    name: "Location & Destinations",
    icon: "📍",
    color: "#e06aa8",
    bg: "#2a0d1a",
    params: [
      { name: "Frequent Destinations", subs: [] },
      { name: "Unique Locations / Total Txns Ratio", subs: [] },
      { name: "Branch List", subs: [] },
    ],
  },
  {
    id: "temporal",
    name: "Temporal Behavior",
    icon: "🕐",
    color: "#4d8ef0",
    bg: "#0d2040",
    params: [
      { name: "Night vs Daytime — By Amount", subs: [] },
      { name: "Night vs Daytime — By Frequency", subs: [] },
      { name: "Time Lapse: Min / Max / Avg / StdDev", subs: [] },
      { name: "Time of Day vs Amount", subs: [] },
    ],
  },
  {
    id: "weekend",
    name: "Weekend Behavior",
    icon: "🗓",
    color: "#9b7be8",
    bg: "#1f0d3a",
    params: [
      { name: "Total", subs: [] },
      { name: "Average", subs: [] },
      { name: "Standard Deviation", subs: [] },
      { name: "Count", subs: [] },
      { name: "Receive / Sent Ratio", subs: [] },
    ],
  },
  {
    id: "workday",
    name: "Workday Behavior",
    icon: "💼",
    color: "#38c9a8",
    bg: "#0a2a22",
    params: [
      { name: "Total", subs: [] },
      { name: "Average", subs: [] },
      { name: "Standard Deviation", subs: [] },
      { name: "Count", subs: [] },
      { name: "Receive / Sent Ratio", subs: [] },
    ],
  },
  {
    id: "wvw",
    name: "Weekend vs Workday",
    icon: "⚖️",
    color: "#e09a2a",
    bg: "#2a1e00",
    params: [
      { name: "Frequency Ratio", subs: [] },
      { name: "Amount Ratio", subs: [] },
      { name: "Receive/Sent Ratios Comparison", subs: [] },
    ],
  },
  {
    id: "patterns",
    name: "Pattern Detection",
    icon: "🔍",
    color: "#e05252",
    bg: "#2a0d0d",
    params: [
      { name: "Chefche Detection", subs: [] },
      { name: "Round Number Hoarding (%1000)", subs: [] },
      { name: "Same Value Transactions Ratio", subs: [] },
      { name: "Below Threshold Frequency", subs: [] },
    ],
  },
  {
    id: "peer",
    name: "Peer Deviations",
    icon: "👥",
    color: "#4caf80",
    bg: "#0d301a",
    params: [
      { name: "By Occupation — Total / Avg / StdDev / Freq", subs: [] },
      { name: "By Account Age Deviation", subs: [] },
      { name: "By Location Deviation", subs: [] },
    ],
  },
  {
    id: "beneficiaries",
    name: "Beneficiaries",
    icon: "🤝",
    color: "#4d8ef0",
    bg: "#0d2040",
    params: [
      { name: "Beneficiaries List", subs: [] },
      { name: "Unique Beneficiaries Ratio", subs: [] },
    ],
  },
  {
    id: "misc",
    name: "Account & Currency",
    icon: "💱",
    color: "#e06aa8",
    bg: "#2a0d1a",
    params: [
      { name: "Currency List", subs: [] },
      { name: "Last Account Activity", subs: [] },
    ],
  },
];

const CRIMES = [
  { key: "structuring", title: "Structuring / Smurfing", icon: "🧩", desc: "Splitting large transactions into smaller ones to evade reporting thresholds. Detected via below-threshold frequency clustering." },
  { key: "unusual_patterns", title: "Unusual Transaction Patterns", icon: "📊", desc: "Behavioral deviations from peer groups, historical baselines, and expected activity patterns across time dimensions." },
  { key: "cash_intensive", title: "Cash-Intensive Activity", icon: "💵", desc: "Abnormally high cash-to-non-cash ratios indicating possible concealment of illicit fund origins." },
  { key: "layering", title: "Layering / Complex Transfers", icon: "🔀", desc: "Multi-hop fund movement through multiple accounts/entities to obscure the money trail." },
  { key: "round_amounts", title: "Round Amount Transactions", icon: "🔵", desc: "Suspiciously frequent use of rounded figures (%1000) suggesting prearranged or structured payments." },
  { key: "rapid_movement", title: "Rapid Fund Movement", icon: "⚡", desc: "Minimal time lapse between inflows and outflows — funds rarely settle, indicating pass-through activity." },
  { key: "below_threshold", title: "Just-Below-Threshold Transactions", icon: "📉", desc: "Repeated transactions marginally below regulatory reporting thresholds, a classic structuring signature." },
  { key: "night_activity", title: "Unusual Time-of-Day Activity", icon: "🌙", desc: "Elevated night-to-day ratio suggesting activity conducted to avoid scrutiny during business hours." },
  { key: "beneficiary_risk", title: "Beneficiary Risk Indicators", icon: "⚠️", desc: "Unusual beneficiary patterns: new recipients, high unique-to-total ratios, or concentration on few parties." },
  { key: "other", title: "Other Suspicious Activity", icon: "🚨", desc: "Anomalous behaviors not fitting standard typologies but exceeding peer deviation thresholds." },
];

const WINDOWS = ["6hr", "24hr", "3d", "7d", "1mo"];

const TECH = [
  {
    name: "HDFS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" />
        <path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" />
      </svg>
    ),
    color: "#4d8ef0", bg: "#0d2040", tag: "Storage", tagColor: "#0d2040", tagText: "#4d8ef0",
    desc: "Distributed storage for raw transaction history and customer profile data at petabyte scale.",
  },
  {
    name: "Apache Spark",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: "#e09a2a", bg: "#2a1e00", tag: "Processing", tagColor: "#2a1e00", tagText: "#e09a2a",
    desc: "Batch & micro-batch computation of behavioral statistics, rolling windows, and peer group aggregations.",
  },
  {
    name: "Redis",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <ellipse cx="12" cy="8" rx="9" ry="3.5" />
        <path d="M3 8v3c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5V8" />
        <path d="M3 11v3c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-3" />
        <path d="M7 20l2-2m4 2l2-2" />
      </svg>
    ),
    color: "#e05252", bg: "#2a0d0d", tag: "Cache", tagColor: "#2a0d0d", tagText: "#e05252",
    desc: "Sub-millisecond profile retrieval — pre-computed 51+ parameters served per customer.",
  },
  {
    name: "FastAPI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        <path d="M14 3h7v7" />
        <path d="M21 3L10 14" />
      </svg>
    ),
    color: "#38c9a8", bg: "#0a2a22", tag: "API", tagColor: "#0a2a22", tagText: "#38c9a8",
    desc: "Async REST endpoints for real-time profile access, SAR flagging, and investigator integrations.",
  },
  {
    name: "Apache Airflow",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
        <path d="M12 7v5l3 3" />
        <path d="M16.5 3.5L18 2" />
        <path d="M7.5 3.5L6 2" />
      </svg>
    ),
    color: "#017CEE", bg: "#001a3a", tag: "Orchestration", tagColor: "#001a3a", tagText: "#017CEE",
    desc: "DAG-based pipeline orchestration — schedules and monitors batch profiling jobs, retries, and SLA alerting.",
  },
];

function CategoryCard({ cat }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`cat-card${open ? " expanded" : ""}`} onClick={() => setOpen(!open)}>
      <div className="cat-hdr">
        <div className="cat-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
        <div className="cat-name">{cat.name}</div>
        <div className="cat-count">{cat.params.length}</div>
        <div className={`cat-chevron${open ? " open" : ""}`}>▼</div>
      </div>
      {open && (
        <div className="cat-body" onClick={e => e.stopPropagation()}>
          {cat.params.map((p, i) => (
            <div key={i}>
              <div className="param-row">
                <div className="param-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="param-name">{p.name}</div>
                <div className="param-dot" style={{ background: cat.color }} />
              </div>
              {p.subs.length > 0 && (
                <div className="sub-params">
                  {p.subs.map(s => <span key={s} className="sp-tag">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BehaviorProfilePage() {
  const [activeWindow, setActiveWindow] = useState("24hr");

  const totalParams = CATEGORIES.reduce((a, c) => a + c.params.length, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="app">
        {/* Header */}
        <div className="hdr" style={{ display: "none", alignItems: "center", gap: "14px" }}>
          <div className="hdr-logo">BP</div>
          <div>
            <div className="hdr-title">Behavior Profiling Service</div>
            <div className="hdr-sub">Financial Intelligence Engine · v3.2</div>
          </div>
          <div className="hdr-right">
            <div className="hdr-pill"><div className="pulse" />&nbsp;Live</div>
            <div className="hdr-pill" style={{ fontFamily: "var(--mono)", color: "var(--teal)" }}>{"< 10ms"} response</div>
            <div className="hdr-pill">51+ params</div>
          </div>
        </div>

        <div className="page">
          {/* Hero */}
          <div
            className="hero"
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Background logo */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(/logo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.08,
                zIndex: 0,
              }}
            />

            {/* Left: text content */}
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              {/* Logo + org header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                <img
                  src="/logo.png"
                  alt="National Bank of Ethiopia logo"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    National Bank of Ethiopia
                  </p>
                 
                </div>
              </div>

              <div className="hero-title">
                CTMS Behavior <span>Profiling Service</span>
              </div>

              <div className="hero-desc">
                Provides 51+ behavioral parameters per customer through a scalable pipeline of HDFS,
                Apache Spark, and Redis. Detects financial crime patterns across temporal, spatial,
                and network dimensions.
              </div>
            </div>

            {/* Right: stats */}
            <div
              className="hero-stats"
              style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
            >
              <div className="hstat">
                <div className="hstat-val">51+</div>
                <div className="hstat-lbl !text-white">Parameters</div>
              </div>
              <div className="hstat">
                <div className="hstat-val" style={{ color: 'var(--teal)' }}>&lt;10ms</div>
                <div className="hstat-lbl !text-white">Latency</div>
              </div>
              <div className="hstat">
                <div className="hstat-val" style={{ color: 'var(--purple)' }}>10</div>
                <div className="hstat-lbl !text-white"> Crime Types</div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <div className="section-title">Technology Stack</div>
            <div className="tech-grid">
              {TECH.map(t => (
                <div key={t.name} className="tech-card">
                  <div className="tech-icon" style={{ background: t.bg }}>{t.icon}</div>
                  <div className="tech-name" style={{ color: t.color }}>{t.name}</div>
                  <div className="tech-desc">{t.desc}</div>
                  <div className="tech-tag" style={{ background: t.bg, color: t.tagText }}>{t.tag} Layer</div>
                </div>
              ))}
            </div>
          </div>

          {/* Params overview */}
          <div>
            <div className="section-title">Profile Parameters Overview</div>
            <div className="params-hero">
              <div className="params-num">{totalParams}+</div>
              <div className="params-text">
                <h3>Behavioral Parameters per Customer Profile</h3>
                <p>Every profile captures transaction statistics, peer deviations, temporal rhythms, spatial patterns, and network connections — all pre-computed and cached for instant retrieval.</p>
                <div className="perf-badges">
                  <span className="perf-badge" style={{ background: "#0d2040", color: "#4d8ef0" }}>Pre-computed via Spark</span>
                  <span className="perf-badge" style={{ background: "#0a2a22", color: "#38c9a8" }}>Redis-cached</span>
                  <span className="perf-badge" style={{ background: "#1f0d3a", color: "#9b7be8" }}>5 Rolling Windows</span>
                  <span className="perf-badge" style={{ background: "#2a1e00", color: "#e09a2a" }}>Real-time Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rolling Window Detail */}
          <div>
            <div className="section-title">Rolling Window Analysis</div>
            <div className="window-tabs">
              {WINDOWS.map(w => (
                <div key={w} className={`wtab${activeWindow === w ? " active" : ""}`} onClick={() => setActiveWindow(w)}>{w}</div>
              ))}
            </div>
            <div className="window-metrics">
              {[
                { lbl: "Avg of Totals", val: "—", sub: `Window: ${activeWindow}`, color: "#4d8ef0" },
                { lbl: "Avg Std Deviation", val: "—", sub: `Window: ${activeWindow}`, color: "#9b7be8" },
                { lbl: "Avg of Averages", val: "—", sub: `Window: ${activeWindow}`, color: "#38c9a8" },
                { lbl: "Avg Frequency", val: "—", sub: `Window: ${activeWindow}`, color: "#e09a2a" },
                { lbl: "Recv / Send Ratio", val: "—", sub: `Window: ${activeWindow}`, color: "#e06aa8" },
              ].map((m, i) => (
                <div key={i} className="wm-card">
                  <div className="wm-lbl">{m.lbl}</div>
                  <div className="wm-val" style={{ color: m.color }}>{m.val}</div>
                  <div className="wm-sub">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All Parameter Categories */}
          <div>
            <div className="section-title">All Parameter Categories — click to expand</div>
            <div className="cat-grid">
              {CATEGORIES.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
            </div>
          </div>

          {/* Financial Crime Detection */}
          <div>
            <div className="section-title">Financial Crime Detection Typologies</div>
            <div className="crime-grid">
              {CRIMES.map(c => (
                <div key={c.key} className="crime-card">
                  <div className="crime-icon" style={{ background: "#2a0d0d" }}>{c.icon}</div>
                  <div>
                    <div className="crime-title">{c.title}</div>
                    <div className="crime-desc">{c.desc}</div>
                    <div className="crime-key">{c.key}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer" style={{ display: "none" }}>
          <div className="footer-text">Behavior Profiling Service · Financial Intelligence Engine · Powered by HDFS · Apache Spark · Redis · FastAPI</div>
        </div>
      </div>
    </>
  );
}


/*

{
    id: "rolling",
    name: "Rolling Windows",
    icon: "⏱",
    color: "#38c9a8",
    bg: "#0a2a22",
    params: [
      { name: "Average of Totals", subs: ["6hr","24hr","3d","7d","1mo"] },
      { name: "Avg Standard Deviation", subs: ["6hr","24hr","3d","7d","1mo"] },
      { name: "Average of Averages", subs: ["6hr","24hr","3d","7d","1mo"] },
      { name: "Average Frequency", subs: ["6hr","24hr","3d","7d","1mo"] },
      { name: "Receive vs Send Ratio", subs: ["6hr","24hr","3d","7d","1mo"] },
    ],
  },


  
  {
    id: "combined",
    name: "Sent + Received",
    icon: "⇅",
    color: "#9b7be8",
    bg: "#1f0d3a",
    params: [
      { name: "Combined Total", subs: [] },
      { name: "Combined Average", subs: [] },
      { name: "Combined Std Deviation", subs: [] },
      { name: "Combined Count", subs: [] },
      { name: "Receive to Send Ratio (Amount)", subs: [] },
    ],
  },


  */