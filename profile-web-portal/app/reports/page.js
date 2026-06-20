"use client";

import { useState, useEffect, useCallback } from "react";

// ── Injected CSS from design system ─────────────────────────────────────────
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
.app{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.btn-action{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--s3);border:1px solid var(--b1);border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:var(--tx);transition:all .15s;font-family:var(--sans)}
.btn-action:hover{background:var(--s4);border-color:var(--b2)}
.btn-action.primary{background:var(--blue2);border-color:var(--blue2);color:#c8d8f8}
.btn-action.primary:hover{background:var(--blue)}
.hdr{display:flex;align-items:center;gap:14px;padding:12px 20px;border-bottom:1px solid var(--b1);background:var(--s1);flex-shrink:0}
.hdr-logo{width:32px;height:32px;border-radius:8px;background:var(--blue3);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:600;color:var(--blue)}
.hdr-title{font-size:13px;font-weight:600;letter-spacing:.5px}
.hdr-sub{font-size:10px;color:var(--t3);font-family:var(--mono)}
.hdr-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.pulse{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hdr-stat{font-size:10px;color:var(--t2);font-family:var(--mono);padding:3px 8px;background:var(--s3);border:1px solid var(--b1);border-radius:4px}
.body{display:flex;flex:1;overflow:hidden}
.sidebar{width:295px;min-width:295px;border-right:1px solid var(--b1);display:flex;flex-direction:column;background:var(--s1)}
.srch{padding:10px 12px;border-bottom:1px solid var(--b1);display:flex;flex-direction:column;gap:6px}
.srch-row{display:flex;gap:6px}
.inp{flex:1;background:var(--s3);border:1px solid var(--b2);border-radius:6px;padding:7px 10px;color:var(--tx);font-size:12px;font-family:var(--sans);outline:none}
.inp:focus{border-color:var(--blue)}
.inp::placeholder{color:var(--t3)}
.sel{background:var(--s3);border:1px solid var(--b1);border-radius:6px;padding:6px 8px;color:var(--tx);font-size:11px;font-family:var(--sans);outline:none;flex:1}
.btn-sm{background:var(--s3);border:1px solid var(--b1);border-radius:5px;padding:4px 10px;color:var(--t2);font-size:11px;cursor:pointer;font-family:var(--sans)}
.btn-sm:hover{color:var(--tx)}
.btn-sm:disabled{opacity:.3;cursor:default}
.smeta{padding:6px 12px;font-size:10px;color:var(--t3);font-family:var(--mono);border-bottom:1px solid var(--b1);display:flex;gap:12px}
.mv{color:var(--blue)}
.acc-list{flex:1;overflow-y:auto}
.acc-item{padding:10px 14px;border-bottom:1px solid var(--b1);cursor:pointer;transition:background .1s}
.acc-item:hover{background:var(--s2)}
.acc-item.asel{background:var(--s3);border-left:2px solid var(--blue)}
.acc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}
.acc-num{font-family:var(--mono);font-size:10px;color:var(--blue);font-weight:600}
.acc-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.acc-tags{display:flex;gap:3px;flex-wrap:wrap}
.tag{font-size:9px;padding:1px 5px;border-radius:8px;font-family:var(--mono)}
.tg{background:#0d2040;color:#4d8ef0}
.rbadge{font-size:9px;padding:2px 6px;border-radius:8px;font-family:var(--mono);font-weight:600}
.pgn{padding:8px 12px;border-top:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.pg-info{font-size:10px;color:var(--t3);font-family:var(--mono)}
.detail{flex:1;overflow-y:auto;background:var(--bg)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;color:var(--t3)}
.dhdr{padding:18px 24px;border-bottom:1px solid var(--b1);background:var(--s1);display:flex;gap:16px;align-items:flex-start;position:sticky;top:0;z-index:20}
.avatar{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;font-family:var(--mono);flex-shrink:0;letter-spacing:-1px}
.dname{font-size:17px;font-weight:600;margin-bottom:2px}
.dacct{font-family:var(--mono);font-size:11px;color:var(--blue);margin-bottom:7px}
.chips{display:flex;gap:5px;flex-wrap:wrap}
.chip{font-size:11px;padding:2px 8px;border-radius:5px;background:var(--s3);color:var(--t2);border:1px solid var(--b1);display:flex;align-items:center;gap:4px;white-space:nowrap}
.dcontent{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:10px;overflow:hidden}
.card-hdr{padding:10px 16px;border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:8px}
.cdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.ctitle{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:1.5px;color:var(--t2);text-transform:uppercase}
.cbody{padding:14px 16px}
.sg4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.scard{background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:10px 12px}
.slabel{font-size:9px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
.sval{font-size:13px;font-weight:600;font-family:var(--mono);line-height:1.3;color:var(--tx)}
.score-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--s2);border:1px solid var(--b1);border-radius:8px;margin-bottom:8px}
.score-label{flex:1;font-size:12px;color:var(--t2);text-transform:capitalize}
.score-val{font-family:var(--mono);font-size:13px;font-weight:600;min-width:60px;text-align:right}
.score-bar{width:80px;height:6px;background:var(--s4);border-radius:3px;overflow:hidden}
.score-fill{height:100%;border-radius:3px}
.risk-breakdown{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.ld{display:flex;align-items:center;justify-content:center;padding:30px}
.spin{width:18px;height:18px;border:2px solid var(--b1);border-top-color:var(--blue);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
`;

const API_BASE = "http://172.20.137.129:17004";
const PAGE_SIZE = 20;

const RISK = {
  HIGH:   { color: "#e05252", bg: "#2a0d0d", label: "HIGH" },
  MEDIUM: { color: "#e09a2a", bg: "#2a1e0d", label: "MED"  },
  LOW:    { color: "#4caf80", bg: "#0d2a1a", label: "LOW"  },
};

const AVATAR_PALETTES = [
  { bg: "#0d1f3a", color: "#4d8ef0" },
  { bg: "#1a0d2a", color: "#9b7be8" },
  { bg: "#0d2a1a", color: "#4caf80" },
  { bg: "#2a1a0d", color: "#e09a2a" },
  { bg: "#2a0d1a", color: "#e06aa8" },
  { bg: "#0d2a2a", color: "#38c9a8" },
];

function avatarPalette(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[h];
}
function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    + " " + dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Safely parse a value that might be a JSON string or already an object/array
function safeParse(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
}

// Coerce risk_score to a proper float (API returns it as a string)
function toFloat(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmt1(v) { return toFloat(v).toFixed(1); }
function fmtPct(v) { return (toFloat(v) * 100).toFixed(1) + "%"; }

function RiskBadge({ level }) {
  const cfg = RISK[level] || { color: "#8892a8", bg: "#1b2235", label: level || "?" };
  return (
    <span className="rbadge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </span>
  );
}

function ScoreBar({ score, level, width = 60 }) {
  const cfg = RISK[level] || { color: "#8892a8" };
  const n = toFloat(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width, height: 4, background: "var(--s4)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(n, 100)}%`, height: "100%", background: cfg.color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: cfg.color, minWidth: 30 }}>
        {fmt1(n)}
      </span>
    </div>
  );
}

function DetailPanel({ report }) {
  if (!report) {
    return (
      <div className="detail">
        <div className="empty">
          <div style={{ fontFamily: "var(--mono)", fontSize: 28, opacity: 0.15, letterSpacing: 4 }}>SAR</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 3, color: "var(--t3)" }}>SELECT A REPORT</div>
        </div>
      </div>
    );
  }

  const av = avatarPalette(report.account_holder_name);
  const riskCfg = RISK[report.risk_level] || { color: "#8892a8", bg: "#1b2235" };
  const score = toFloat(report.risk_score);

  // risk_breakdown comes back as a JSON string — parse it into an array
  const breakdown = safeParse(report.risk_breakdown);
  const breakdownArr = Array.isArray(breakdown) ? breakdown : [];

  // transaction_stats also comes back as a JSON string
  const txStats = safeParse(report.transaction_stats) || {};
  const txEntries = Object.entries(txStats).filter(([, v]) => v !== null && v !== undefined);

  return (
    <div className="detail">
      {/* Sticky header */}
      <div className="dhdr">
        <div className="avatar" style={{ background: av.bg, color: av.color }}>
          {initials(report.account_holder_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dname">{report.account_holder_name || "Unknown"}</div>
          <div className="dacct">{report.account_number}</div>
          <div className="chips">
            <span className="chip">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: riskCfg.color }} />
              {report.risk_level} RISK
            </span>
            {report.suspicion_type && <span className="chip">{report.suspicion_type}</span>}
            <span className="chip" style={{ fontFamily: "var(--mono)" }}>#{report.id}</span>
            <span className="chip" style={{ color: "var(--t3)" }}>reported {fmtDate(report.reported_at)}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 600, color: riskCfg.color, lineHeight: 1 }}>
            {fmt1(score)}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t3)", letterSpacing: 1 }}>RISK SCORE / 100</div>
          <div style={{ width: 120, height: 5, background: "var(--s4)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: riskCfg.color, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      <div className="dcontent">
        {/* Findings */}
        {report.findings && (
          <div className="card">
            <div className="card-hdr">
              <span className="cdot" style={{ background: "var(--amber)" }} />
              <span className="ctitle">Findings</span>
            </div>
            <div className="cbody">
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.75 }}>{report.findings}</p>
            </div>
          </div>
        )}

        {/* Account details grid */}
        <div className="card">
          <div className="card-hdr">
            <span className="cdot" style={{ background: "var(--blue)" }} />
            <span className="ctitle">Account Details</span>
          </div>
          <div className="cbody">
            <div className="sg4">
              {[
                { label: "Account No.", val: report.account_number },
                { label: "Risk Level",  val: <RiskBadge level={report.risk_level} /> },
                { label: "Suspicion",   val: report.suspicion_type || "—" },
                { label: "Score",       val: <ScoreBar score={score} level={report.risk_level} width={80} /> },
                { label: "Reported",    val: fmtDateTime(report.reported_at) },
                { label: "Created",     val: fmtDateTime(report.created_at) },
                { label: "Report ID",   val: `#${report.id}` },
                { label: "Holder",      val: report.account_holder_name || "—" },
              ].map(({ label, val }) => (
                <div key={label} className="scard">
                  <div className="slabel">{label}</div>
                  <div className="sval">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk breakdown — array of {name, value, weight, contribution, exceeded, threshold} */}
        {breakdownArr.length > 0 && (
          <div className="card">
            <div className="card-hdr">
              <span className="cdot" style={{ background: "var(--red)" }} />
              <span className="ctitle">Risk Breakdown</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, color: "var(--t3)" }}>
                value · weight · contribution
              </span>
            </div>
            <div className="cbody" style={{ padding: "10px 16px" }}>
              {breakdownArr.map((item) => {
                // value is 0–1 ratio; display as percentage on the bar
                const pct = Math.min(toFloat(item.value) * 100, 100);
                const contrib = toFloat(item.contribution);
                const color = item.exceeded ? "var(--red)" : contrib > 5 ? "var(--amber)" : "var(--green)";
                return (
                  <div key={item.name} className="score-row" style={{ marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span className="score-label" style={{ fontWeight: 500 }}>{item.name}</span>
                        {item.exceeded && (
                          <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "#2a0d0d", color: "var(--red)", fontFamily: "var(--mono)", fontWeight: 600 }}>
                            EXCEEDED
                          </span>
                        )}
                      </div>
                      <div className="score-bar" style={{ width: "100%" }}>
                        <div className="score-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color }}>{fmtPct(item.value)}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t3)" }}>
                        w:{item.weight} · c:{fmt1(item.contribution)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transaction stats */}
        {txEntries.length > 0 && (
          <div className="card">
            <div className="card-hdr">
              <span className="cdot" style={{ background: "var(--teal)" }} />
              <span className="ctitle">Transaction Statistics</span>
            </div>
            <div className="cbody">
              <div className="sg3">
                {txEntries.map(([key, val]) => {
                  const n = typeof val === "number" ? val : parseFloat(val);
                  const display = !isNaN(n)
                    ? (Number.isInteger(n) ? n.toLocaleString() : fmt1(n))
                    : String(val ?? "—");
                  return (
                    <div key={key} className="scard">
                      <div className="slabel">{key.replace(/_/g, " ")}</div>
                      <div className="sval" style={{ fontSize: 14 }}>{display}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SARReports() {
  const [reports, setReports]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: PAGE_SIZE, total_records: 0, total_pages: 0 });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const selected = reports.find(r => r.id === selectedId) || null;

  const fetchReports = useCallback(async (pg = page, risk = riskFilter, acct = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pg, page_size: PAGE_SIZE });
      if (risk) params.set("risk_level", risk);
      if (acct.trim()) params.set("account_number", acct.trim());
      const res = await fetch(`${API_BASE}/sar-reports?${params}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setReports(json.data || []);
      setPagination(json.pagination || {});
      if ((json.data || []).length > 0 && !selectedId) setSelectedId(json.data[0].id);
    } catch (e) {
      setError(e.message || "Cannot reach localhost:8000");
    } finally {
      setLoading(false);
    }
  }, [page, riskFilter, search, selectedId]);

  useEffect(() => { fetchReports(page, riskFilter, search); }, [page, riskFilter]);

  // Debounced account search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchReports(1, riskFilter, search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  function exportCSV() {
    const hdrs = ["ID","Account Number","Account Holder","Risk Level","Risk Score","Suspicion Type","Reported At"];
    const rows = reports.map(r =>
      [r.id, r.account_number, r.account_holder_name, r.risk_level, r.risk_score, r.suspicion_type, r.reported_at]
        .map(v => `"${v ?? ""}"`)
        .join(",")
    );
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent([hdrs.join(","), ...rows].join("\n"));
    a.download = "sar_reports.csv";
    a.click();
  }

  const totalPages = pagination.total_pages || 1;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Header */}
        <div className="hdr">
          <div className="hdr-logo" style={{ display: "none", flexDirection: "column", gap: 2 }}>SAR</div>
          <div style={{ display: "none", flexDirection: "column", gap: 2 }}>
            <div className="hdr-title">SAR REPORTS</div>
            <div className="hdr-sub">Suspicious Activity Reports · localhost:8000</div>
          </div>
          <div className="hdr-right">
            <div className="pulse" />
            <span className="hdr-stat">{pagination.total_records ?? 0} records</span>
            <span className="hdr-stat">pg {page}/{totalPages}</span>
            <button className="btn-action" onClick={exportCSV}>↓ Export CSV</button>
            <button className="btn-action primary" onClick={() => fetchReports(page, riskFilter, search)}>↻ Refresh</button>
          </div>
        </div>

        <div className="body">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="srch">
              <input
                className="inp"
                placeholder="Account number…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <div className="srch-row">
                <select className="sel" value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}>
                  <option value="">All risk levels</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                {(search || riskFilter) && (
                  <button className="btn-sm" onClick={() => { setSearch(""); setRiskFilter(""); setPage(1); }}>Clear</button>
                )}
              </div>
            </div>

            <div className="smeta">
              <span>
                {pagination.total_records > 0
                  ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, pagination.total_records)} of ` : ""}
                <span className="mv">{pagination.total_records ?? 0}</span> reports
              </span>
              {riskFilter && <span>risk: <span className="mv">{riskFilter}</span></span>}
            </div>

            <div className="acc-list">
              {loading && (
                <div className="ld"><div className="spin" /></div>
              )}
              {!loading && error && (
                <div style={{ margin: 12, padding: "10px 12px", background: "#2a0d0d", border: "1px solid var(--red)", borderRadius: 8, fontSize: 11, color: "var(--red)" }}>
                  <div style={{ fontFamily: "var(--mono)", marginBottom: 6 }}>⚠ Connection error</div>
                  <div style={{ color: "var(--t2)", marginBottom: 8 }}>{error}</div>
                  <button className="btn-sm" onClick={() => fetchReports(page, riskFilter, search)}>Retry</button>
                </div>
              )}
              {!loading && !error && reports.length === 0 && (
                <div className="empty" style={{ padding: 40 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 2 }}>NO RECORDS</div>
                </div>
              )}
              {!loading && reports.map(r => (
                <div
                  key={r.id}
                  className={`acc-item${selectedId === r.id ? " asel" : ""}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="acc-top">
                    <span className="acc-num">{r.account_number}</span>
                    <RiskBadge level={r.risk_level} />
                  </div>
                  <div className="acc-name">{r.account_holder_name || "Unknown"}</div>
                  <ScoreBar score={r.risk_score} level={r.risk_level} width={50} />
                  <div className="acc-tags" style={{ marginTop: 5 }}>
                    {r.suspicion_type && <span className="tag tg">{r.suspicion_type.slice(0, 22)}</span>}
                    <span className="tag" style={{ background: "var(--s3)", color: "var(--t3)" }}>{fmtDate(r.reported_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pgn">
              <span className="pg-info">pg {page} / {totalPages}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
                <button className="btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <DetailPanel report={selected} />
        </div>
      </div>
    </>
  );
}