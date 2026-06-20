"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import ReactMarkdown from 'react-markdown';

const API_BASE = "http://172.20.137.129:17004";

const fmt = (n, d = 0) => n == null ? "—" : Number(n).toLocaleString("en-US", { maximumFractionDigits: d });
const fmtPct = (n) => n == null ? "—" : `${(n * 100).toFixed(1)}%`;
const fmtK = (n) => { if (n == null) return "—"; const a = Math.abs(n); if (a >= 1e6) return `${(n/1e6).toFixed(2)}M`; if (a >= 1e3) return `${(n/1e3).toFixed(1)}K`; return fmt(n, 1); };
const parseJ = (v) => { if (!v) return null; if (typeof v === "object") return v; try { return JSON.parse(v); } catch { return null; } };
const initials = (name) => name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() ?? "??";
const riskLevel = (r) => r >= 0.7 ? { label:"HIGH", color:"#e05252" } : r >= 0.35 ? { label:"MED", color:"#d4943a" } : { label:"LOW", color:"#4caf80" };
const lapseHrs = (s) => s == null ? "—" : s < 3600 ? `${Math.round(s/60)}m` : s < 86400 ? `${(s/3600).toFixed(1)}h` : `${(s/86400).toFixed(1)}d`;

const MOCK = [{
  account_number:"1000100000001",sent_amount_total:121149,sent_amount_average:5769,sent_amount_std:6528.3,sent_amount_count:21,
  recieve_amount_total:null,recieve_amount_average:null,recieve_amount_std:null,recieve_amount_count:null,
  s_and_r_amount_total:121149,s_and_r_amount_average:5769,s_and_r_amount_std:6528.3,s_and_r_amount_count:21,
  receive_percentage_by_frequency:0,sent_percentage_by_frequency:1,receive_percentage_by_amount:0,sent_percentage_by_amount:1,
  average_rolling_sum_1hr:7560,average_rolling_avg_1hr:5575,average_rolling_std_1hr:3387,average_rolling_frequency_1hr:1.38,
  average_rolling_sum_3hr:8618,average_rolling_avg_3hr:5806,average_rolling_std_3hr:3180,average_rolling_frequency_3hr:1.67,
  average_rolling_sum_6hr:9545,average_rolling_avg_6hr:5862,average_rolling_std_6hr:2908,average_rolling_frequency_6hr:1.95,
  average_rolling_sum_12hr:9545,average_rolling_avg_12hr:5862,average_rolling_std_12hr:2908,average_rolling_frequency_12hr:1.95,
  average_rolling_sum_1day:12545,average_rolling_avg_1day:5963,average_rolling_std_1day:2715,average_rolling_frequency_1day:2.29,
  average_rolling_sum_3days:19220,average_rolling_avg_3days:5816,average_rolling_std_3days:3507,average_rolling_frequency_3days:3.43,
  average_rolling_sum_7days:20701,average_rolling_avg_7days:5430,average_rolling_std_7days:2882,average_rolling_frequency_7days:3.95,
  average_rolling_sum_30days:69948,average_rolling_avg_30days:7412,average_rolling_std_30days:5417,average_rolling_frequency_30days:11,
  cash_count:0,non_cash_count:21,cash_amount_total:0,non_cash_amount_total:121149,cash_count_ratio:0,cash_amount_ratio:0,
  last_received_activity_timestamp:null,last_sent_activity_timestamp:null,last_activity_timestamp:null,gap_between_last_received_and_sent:null,
  round_1000_ratio:0.238,same_value_ratio:0.143,just_below_threshold_frequency:0,irregular_amount_ratio:0.286,
  night_tx_count:0,day_tx_count:21,night_day_frequency_ratio:0,night_total_amount:0,day_total_amount:121149,night_day_amount_ratio:0,
  min_time_lapse:60,max_time_lapse:639180,avg_time_lapse:125223,stddev_time_lapse:206204,lapse_count:20,
  weekend_total_amount:14209,weekend_avg_amount:2841.8,weekend_std_amount:820.4,weekend_count:5,weekend_receive_to_send_ratio:0,
  workday_total_amount:106940,workday_avg_amount:6683.75,workday_std_amount:7273,workday_count:16,workday_receive_to_send_ratio:0,
  weekend_vs_workday_freq_ratio:0.3125,weekend_vs_workday_amount_ratio:0.133,weekend_vs_workday_receive_send_ratio_comp:null,
  time_of_day_profile_list:[{hour_of_day:9,hourly_tx_frequency:3,hourly_total_amount:33910},{hour_of_day:11,hourly_tx_frequency:2,hourly_total_amount:28010},{hour_of_day:19,hourly_tx_frequency:5,hourly_total_amount:27910},{hour_of_day:17,hourly_tx_frequency:2,hourly_total_amount:8000},{hour_of_day:10,hourly_tx_frequency:2,hourly_total_amount:8499},{hour_of_day:16,hourly_tx_frequency:2,hourly_total_amount:5000},{hour_of_day:14,hourly_tx_frequency:1,hourly_total_amount:4300},{hour_of_day:15,hourly_tx_frequency:1,hourly_total_amount:2720},{hour_of_day:13,hourly_tx_frequency:1,hourly_total_amount:2500},{hour_of_day:20,hourly_tx_frequency:2,hourly_total_amount:300}],
  beneficiaries_list:[{BENEFICIARY_ACCOUNT_NO:"etb1753600910162",tx_frequency:4},{BENEFICIARY_ACCOUNT_NO:"1000036265918",tx_frequency:3},{BENEFICIARY_ACCOUNT_NO:"1000340033535",tx_frequency:2},{BENEFICIARY_ACCOUNT_NO:"1000279720303",tx_frequency:2},{BENEFICIARY_ACCOUNT_NO:"1000589540477",tx_frequency:1},{BENEFICIARY_ACCOUNT_NO:"1000078502383",tx_frequency:1},{BENEFICIARY_ACCOUNT_NO:"1000351349518",tx_frequency:1}],
  unique_beneficiary_ratio:0.667,
  conducting_manner_list:[{CONDUCTING_MANNER:"mobile transfer",tx_frequency:21}],
  branch_list:[{BRANCH_ID:"et0010104",tx_frequency:18,total_amt_per_branch:71119,mean_amt_per_branch:3951},{BRANCH_ID:"et0010379",tx_frequency:3,total_amt_per_branch:50030,mean_amt_per_branch:16676}],
  currency_list:[{CURRENCY_TYPE:"etb",tx_frequency:21,total_amt_per_currency:121149,mean_amt_per_currency:5769}],
  NAMES:["alemayehu ahmed hussien"],FULL_NAMES:["alemayehu ahmed hussien"],OCCUPATIONS:["cbe"],
  ACCOUNT_TYPES:["amana current account"],BRANCHES:["cmc branch"],GENDERS:["male"],PHONE_NUMBERS:["+251912664999"],
  KYC_EXTENDED_JSON:{NAMES:["alemayehu ahmed hussien"],FULL_NAMES:["alemayehu ahmed hussien"],OCCUPATIONS:["cbe"],ACCOUNT_TYPES:["amana current account"],BRANCHES:["cmc branch"],GENDERS:["male"],PHONE_NUMBERS:["+251912664999"]}
}];

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
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)}
.modal{background:var(--s1);border:1px solid var(--b1);border-radius:12px;max-width:900px;width:90%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column}
.modal-hdr{padding:16px 20px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between}
.modal-title{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}
.modal-close{background:var(--s3);border:1px solid var(--b1);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);font-size:16px}
.modal-close:hover{background:var(--s4);color:var(--tx)}
.modal-body{flex:1;overflow-y:auto;padding:20px}
.modal-footer{padding:14px 20px;border-top:1px solid var(--b1);display:flex;gap:8px;justify-content:flex-end}
.btn-danger{background:var(--red);color:#fff}
.btn-danger:hover{background:#c93d3d}
.btn-link{background:transparent;border:1px solid var(--b1);color:var(--t2)}
.btn-link:hover{background:var(--s3);color:var(--tx)}
.score-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--s2);border:1px solid var(--b1);border-radius:8px;margin-bottom:8px}
.score-label{flex:1;font-size:12px;color:var(--t2)}
.score-val{font-family:var(--mono);font-size:13px;font-weight:600;min-width:60px;text-align:right}
.score-bar{width:80px;height:6px;background:var(--s4);border-radius:3px;overflow:hidden}
.score-fill{height:100%;border-radius:3px}
.risk-breakdown{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.sar-form{display:flex;flex-direction:column;gap:14px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-label{font-size:11px;color:var(--t2);font-family:var(--mono);text-transform:uppercase;letter-spacing:.5px}
.form-textarea{background:var(--s3);border:1px solid var(--b2);border-radius:6px;padding:10px;color:var(--tx);font-size:12px;font-family:var(--sans);outline:none;resize:vertical;min-height:80px}
.form-textarea:focus{border-color:var(--blue)}
.form-select{background:var(--s3);border:1px solid var(--b2);border-radius:6px;padding:8px 10px;color:var(--tx);font-size:12px;font-family:var(--sans);outline:none}
.form-select:focus{border-color:var(--blue)}
.sar-success{background:var(--green);background:linear-gradient(135deg,#0f7a5e,#38c9a8);padding:14px 18px;border-radius:8px;color:#fff;font-size:13px;text-align:center;font-weight:500}
.btn-action{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--s3);border:1px solid var(--b1);border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:var(--tx);transition:all .15s}
.btn-action:hover{background:var(--s4);border-color:var(--b2)}
.btn-action.primary{background:var(--blue2);border-color:var(--blue2);color:#c8d8f8}
.btn-action.primary:hover{background:var(--blue)}
.action-row{display:flex;gap:8px;align-items:center}
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
.btn{background:var(--blue2);border:none;border-radius:6px;padding:7px 12px;color:#c8d8f8;font-size:12px;font-weight:500;cursor:pointer;font-family:var(--sans)}
.btn:hover{background:var(--blue)}
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
.tg{background:#0d2040;color:#4d8ef0}.ta{background:#0d301a;color:#4caf80}.tp{background:#1f0d3a;color:#9b7be8}
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
.sg2{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sg4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.sg6{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.scard{background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:10px 12px}
.slabel{font-size:9px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
.sval{font-size:16px;font-weight:600;font-family:var(--mono);line-height:1}
.ssub{font-size:9px;color:var(--t3);margin-top:3px}
.rg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ritem{background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:10px 12px}
.rlabel{font-size:9px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;margin-bottom:7px}
.rtrack{height:3px;background:var(--s4);border-radius:2px;overflow:hidden;margin-bottom:5px}
.rfill{height:100%;border-radius:2px}
.rpct{font-family:var(--mono);font-size:13px;font-weight:600}
.rwg{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.rwcell{background:var(--s2);border:1px solid var(--b1);border-radius:7px;padding:9px 6px;text-align:center}
.rww{font-size:9px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;margin-bottom:4px}
.rwv{font-size:11px;font-family:var(--mono);font-weight:600}
.rwf{font-size:9px;color:var(--t3);margin-top:2px}
.mtbl{width:100%;border-collapse:collapse;font-size:11px}
.mtbl th{font-family:var(--mono);font-size:9px;color:var(--t3);text-transform:uppercase;padding:6px 10px;text-align:left;border-bottom:1px solid var(--b1)}
.mtbl td{padding:7px 10px;border-bottom:1px solid var(--b1);color:var(--t2)}
.mtbl tr:last-child td{border-bottom:none}
.mtbl tr:hover td{background:var(--s2)}
.mono{font-family:var(--mono);font-size:10px}
.col2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.col3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.bar-name{font-size:10px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:140px;flex-shrink:0}
.bar-track{flex:1;height:5px;background:var(--s4);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px}
.bar-val{font-family:var(--mono);font-size:10px;color:var(--t2);width:45px;text-align:right;flex-shrink:0}
.divlbl{font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--t3);text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid var(--b1);margin-bottom:10px}
.demo{padding:5px 20px;background:#1a1400;border-bottom:1px solid #3a2e00;font-size:10px;color:var(--amber);font-family:var(--mono)}
.ld{display:flex;align-items:center;justify-content:center;padding:30px}
.spin{width:18px;height:18px;border:2px solid var(--b1);border-top-color:var(--blue);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ctt{background:var(--s3);border:1px solid var(--b2);border-radius:6px;padding:7px 11px;font-size:10px;font-family:var(--mono)}
`;

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="ctt"><div style={{color:"var(--t2)",marginBottom:3}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color||"var(--blue)"}}>{p.name}: {fmtK(p.value)}</div>)}</div>;
};

const RB = ({ label, value }) => {
  const c = value >= 0.7 ? "#e05252" : value >= 0.35 ? "#d4943a" : "#4caf80";
  return <div className="ritem"><div className="rlabel">{label}</div><div className="rtrack"><div className="rfill" style={{width:`${Math.min((value??0)*100,100)}%`,background:c}}/></div><div className="rpct" style={{color:c}}>{fmtPct(value)}</div></div>;
};

const HBar = ({ name, value, max, color="#4d8ef0" }) => (
  <div className="bar-row">
    <div className="bar-name" title={name}>{name}</div>
    <div className="bar-track"><div className="bar-fill" style={{width:`${max?(value/max)*100:0}%`,background:color}}/></div>
    <div className="bar-val">{fmtK(value)}</div>
  </div>
);

const Sc = ({ label, value, sub, color }) => (
  <div className="scard">
    <div className="slabel">{label}</div>
    <div className="sval" style={color?{color}:{}}>{value}</div>
    {sub && <div className="ssub">{sub}</div>}
  </div>
);

const AccItem = ({ a, active, onClick }) => {
  const name = parseJ(a.NAMES)?.[0] ?? "Unknown";
  const type = parseJ(a.ACCOUNT_TYPES)?.[0] ?? "";
  const gender = parseJ(a.GENDERS)?.[0] ?? "";
  const rl = riskLevel(a.irregular_amount_ratio ?? 0);
  return (
    <div className={`acc-item ${active?"asel":""}`} onClick={onClick}>
      <div className="acc-top"><span className="acc-num">{a.account_number}</span><span className="rbadge" style={{background:rl.color+"22",color:rl.color}}>{rl.label}</span></div>
      <div className="acc-name">{name}</div>
      <div className="acc-tags">
        {gender && <span className="tag tg">{gender}</span>}
        {type && <span className="tag tp">{type.slice(0,22)}{type.length>22?"…":""}</span>}
        <span className="tag ta">{fmtK(a.s_and_r_amount_total)}</span>
      </div>
    </div>
  );
};

// Risk scoring calculation
const calculateRiskScore = (a) => {
  const factors = {
    irregular_amount: { value: a.irregular_amount_ratio ?? 0, weight: 25, threshold: 0.3 },
    cash_ratio: { value: a.cash_count_ratio ?? 0, weight: 15, threshold: 0.5 },
    round_1000: { value: a.round_1000_ratio ?? 0, weight: 10, threshold: 0.4 },
    same_value: { value: a.same_value_ratio ?? 0, weight: 10, threshold: 0.3 },
    below_threshold: { value: a.just_below_threshold_frequency ?? 0, weight: 12, threshold: 0.2 },
    night_day: { value: a.night_day_frequency_ratio ?? 0, weight: 8, threshold: 0.3 },
    weekend_workday: { value: a.weekend_vs_workday_freq_ratio ?? 0, weight: 7, threshold: 0.5 },
    unique_beneficiary: { value: 1 - (a.unique_beneficiary_ratio ?? 1), weight: 13, threshold: 0.5 },
  };

  let totalScore = 0;
  let breakdown = [];

  Object.entries(factors).forEach(([key, { value, weight, threshold }]) => {
    const exceeded = value > threshold;
    const contribution = exceeded ? (value / threshold) * weight : (value / threshold) * weight * 0.5;
    const capped = Math.min(contribution, weight);
    totalScore += capped;
    breakdown.push({
      name: key.replace(/_/g, ' '),
      value,
      weight,
      threshold,
      contribution: capped,
      exceeded
    });
  });

  const normalizedScore = Math.min(totalScore, 100);
  const level = normalizedScore >= 70 ? 'HIGH' : normalizedScore >= 40 ? 'MEDIUM' : 'LOW';
  const color = normalizedScore >= 70 ? '#e05252' : normalizedScore >= 40 ? '#d4943a' : '#4caf80';

  return { score: normalizedScore, level, color, breakdown };
};

// Risk Modal Component
const RiskModal = ({ a, onClose }) => {
  const risk = calculateRiskScore(a);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div className="modal-title">
            <span>🎯</span>
            <span>Risk Score Breakdown — {a.account_number}</span>
          </div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", letterSpacing: 1.5, marginBottom: 4 }}>COMPOSITE RISK SCORE</div>
                <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "var(--mono)", color: risk.color }}>{risk.score.toFixed(1)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: risk.color, marginBottom: 4 }}>{risk.level} RISK</div>
                <div style={{ fontSize: 11, color: "var(--t2)" }}>Out of 100 points</div>
              </div>
            </div>
            <div style={{ height: 8, background: "var(--s4)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${risk.score}%`, background: risk.color, transition: "width .4s" }} />
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Factor Contributions</div>
          <div className="risk-breakdown">
            {risk.breakdown.map((f, i) => (
              <div key={i} className="score-row">
                <div style={{ flex: 1 }}>
                  <div className="score-label" style={{ fontWeight: 500, textTransform: "capitalize", marginBottom: 3 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>
                    Value: {fmtPct(f.value)} | Threshold: {fmtPct(f.threshold)} | Weight: {f.weight}pt
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="score-val" style={{ color: f.exceeded ? "#e05252" : "#4caf80" }}>
                    +{f.contribution.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--mono)" }}>
                    {f.exceeded ? "EXCEEDED" : "NORMAL"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 14, background: "var(--s3)", border: "1px solid var(--b1)", borderRadius: 8, fontSize: 11, color: "var(--t2)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--tx)", display: "block", marginBottom: 6 }}>Scoring Methodology:</strong>
            Each risk factor has a weight (importance) and threshold. When a factor's value exceeds its threshold, it contributes its full weight to the score. Below threshold, contribution is proportional. The composite score is the sum of all contributions, capped at 100. Scores ≥70 indicate high risk, 40-69 medium, &lt;40 low.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-link" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// SAR Modal Component
const SARModal = ({ a, onClose, onSuccess }) => {
  const [findings, setFindings] = useState('');
  const [suspicionType, setSuspicionType] = useState('structuring');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const risk = calculateRiskScore(a);
      const payload = {
        account_number: a.account_number,
        account_holder_name: parseJ(a.FULL_NAMES)?.[0] ?? parseJ(a.NAMES)?.[0] ?? 'Unknown',
        risk_score: +risk.score.toFixed(2),
        risk_level: risk.level,
        suspicion_type: suspicionType,
        findings: findings,
        risk_breakdown: risk.breakdown,
        transaction_stats: {
          sent_total: a.sent_amount_total,
          sent_count: a.sent_amount_count,
          received_total: a.recieve_amount_total,
          received_count: a.recieve_amount_count,
          combined_total: a.s_and_r_amount_total,
          cash_count_ratio: a.cash_count_ratio,
          irregular_amount_ratio: a.irregular_amount_ratio,
          night_day_ratio: a.night_day_frequency_ratio,
          unique_beneficiary_ratio: a.unique_beneficiary_ratio,
        },
        reported_at: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/sar-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit SAR');
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      alert('Failed to submit SAR: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div className="modal-title">
            <span>🚨</span>
            <span>Generate Suspicious Activity Report (SAR)</span>
          </div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="sar-success">✓ SAR submitted successfully to database</div>
          ) : (
            <div className="sar-form">
              <div style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", marginBottom: 6 }}>ACCOUNT</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{parseJ(a.FULL_NAMES)?.[0] ?? parseJ(a.NAMES)?.[0]}</div>
                <div style={{ fontSize: 11, color: "var(--blue)", fontFamily: "var(--mono)", marginTop: 2 }}>{a.account_number}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Suspicion Type</label>
                <select className="form-select" value={suspicionType} onChange={e => setSuspicionType(e.target.value)}>
                  <option value="structuring">Structuring / Smurfing</option>
                  <option value="unusual_patterns">Unusual Transaction Patterns</option>
                  <option value="cash_intensive">Cash-Intensive Activity</option>
                  <option value="layering">Layering / Complex Transfers</option>
                  <option value="round_amounts">Round Amount Transactions</option>
                  <option value="rapid_movement">Rapid Fund Movement</option>
                  <option value="below_threshold">Just-Below-Threshold Transactions</option>
                  <option value="night_activity">Unusual Time-of-Day Activity</option>
                  <option value="beneficiary_risk">Beneficiary Risk Indicators</option>
                  <option value="other">Other Suspicious Activity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Findings & Observations</label>
                <textarea
                  className="form-textarea"
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder="Describe the suspicious patterns observed, specific transactions of concern, behavioral indicators, and any other relevant context that supports this SAR filing..."
                  style={{ minHeight: 120 }}
                />
              </div>

              <div style={{ background: "var(--s3)", border: "1px solid var(--b1)", borderRadius: 8, padding: 12, fontSize: 11, color: "var(--t2)" }}>
                <strong style={{ color: "var(--tx)", display: "block", marginBottom: 4 }}>What will be included:</strong>
                Account details, computed risk score ({calculateRiskScore(a).score.toFixed(1)}/100), risk factor breakdown, transaction statistics, your findings, and timestamp. This report will be stored in the <code style={{ fontFamily: "var(--mono)", color: "var(--blue)" }}>sar_reports</code> table.
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-link" onClick={onClose}>Cancel</button>
          {!success && (
            <button className="btn btn-danger" onClick={handleSubmit} disabled={submitting || !findings.trim()}>
              {submitting ? 'Submitting...' : 'Submit SAR'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



const InfoField = ({ label, value }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ 
      fontSize: '0.8rem', 
      color: '#888', 
      textTransform: 'uppercase', 
      marginBottom: '4px' 
    }}>
      {label}
    </div>
    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>
      {value}
    </div>
  </div>
);


// Fayda Verification Modal Component
const FaydaModal = ({ a, onClose, onSuccess }) => {
  const [findings, setFindings] = useState('');
  const [suspicionType, setSuspicionType] = useState('unusual_patterns');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Construct the URL for the iframe (e.g., a verification portal)
  // Using the account number or a specific ID field from 'a'
  const faydaUrl = `https://172.0.0.0:3010`;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const risk = calculateRiskScore(a);
      const payload = {
        account_number: a.account_number,
        account_holder_name: parseJ(a.FULL_NAMES)?.[0] ?? parseJ(a.NAMES)?.[0] ?? 'Unknown',
        risk_score: +risk.score.toFixed(2),
        suspicion_type: suspicionType,
        findings: findings,
        reported_at: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/fayda-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to log Fayda verification');
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '95vw', maxWidth: '1200px', height: '90vh' }}>
        <div className="modal-hdr">
          <div className="modal-title">
            <span>🆔</span>
            <span>Fayda Identity Verification</span>
          </div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>

        <div className="modal-body" style={{ padding: 0, overflow: 'hidden', display: 'flex', background: 'var(--s2)' }}>
          {success ? (
            <div className="sar-success" style={{ margin: 'auto', textAlign: 'center' }}>
              ✓ Verification logged successfully
            </div>
          ) : (
            <>
              
              {/* Fayda Identity Information Section */}
              <div style={{ 
                flex: 1, 
                background: '#121212', 
                color: '#e0e0e0', 
                padding: '20px', 
                borderRadius: '8px',
                overflowY: 'auto',
                fontFamily: 'sans-serif'
              }}>
                <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                  National ID Profile
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                  
                  {/* ID Card Image Preview */}
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src="/fayda.jpg" 
                      alt="Fayda National ID Card Front" 
                      style={{ 
                        width: '100%', 
                        maxWidth: '4500px', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        border: '1px solid #444'
                      }} 
                    />
                  </div>

                  {/* Information Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '15px',
                    background: '#1e1e1e',
                    padding: '20px',
                    borderRadius: '10px'
                  }}>
                    <InfoField label="Full Name" value="Test Test Test" />
                    <InfoField label="FCN (ID Number)" value="285473403197" />
                    <InfoField label="Date of Birth" value="11/Sep/1991 (1984 E.C.)" />
                    <InfoField label="Sex" value="Male" />
                    <InfoField label="Nationality" value="Ethiopian (ET)" />
                    <InfoField label="Phone Number" value="+251 911 000 000" />
                    <InfoField label="Email Address" value="test.user@example.com" />
                    <InfoField label="Address" value="Addis Ababa, Ethiopia" />
                  </div>
                </div>
              </div>

              {/* Sidebar for quick notes/actions */}
              <div style={{ width: '300px', borderLeft: '1px solid var(--b1)', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 'bold' }}>VERIFICATION NOTES</div>
                
                <div className="form-group">
                  <label className="form-label">Status Flag</label>
                  <select className="form-select" value={suspicionType} onChange={e => setSuspicionType(e.target.value)}>
                    <option value="verified">Verified - No Issues</option>
                    <option value="unusual_patterns">Pattern Mismatch</option>
                    <option value="beneficiary_risk">High Risk Flag</option>
                    <option value="other">Manual Review Required</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Observation</label>
                  <textarea
                    className="form-textarea"
                    value={findings}
                    onChange={e => setFindings(e.target.value)}
                    placeholder="Enter verification findings..."
                    style={{ minHeight: '120px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--s1)', borderRadius: '6px', fontSize: '11px' }}>
                  <strong>ID:</strong> {a.account_number}<br/>
                  <strong>Name:</strong> {parseJ(a.FULL_NAMES)?.[0] ?? 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-link" onClick={onClose}>Close</button>
          {!success && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !findings.trim()}>
              {submitting ? 'Processing...' : 'Complete Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};




// AI Behavior Profile Summary Modal
const AiAnalysisModal = ({ accountProfile, geminiToken, onClose, onSave }) => {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [encodedAccountProfile, setEncodedAccountProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (accountProfile && geminiToken && !summary) {
      
      const sanitizedProfile = { ...accountProfile };
      sanitizedProfile.FULL_NAMES = ["Classified User"];
      sanitizedProfile.NAMES = ["Classified User"];
      sanitizedProfile.PHONE_NUMBERS = [];
      sanitizedProfile.KYC_EXTENDED_JSON = {};
      setEncodedAccountProfile(sanitizedProfile);      

    }
  }, [accountProfile, geminiToken]);


  const generateAiSummary = async () => {

    const sanitizedProfile = { ...accountProfile };
    sanitizedProfile.FULL_NAMES = ["Classified User"];
    sanitizedProfile.NAMES = ["Classified User"];
    sanitizedProfile.PHONE_NUMBERS = [];
    sanitizedProfile.KYC_EXTENDED_JSON = {};

    setIsGenerating(true);
    setError(null);
    
    try {
      // 1. Construct the prompt using the account behavior profile
      const prompt = `
        You are a financial risk AI assistant. Analyze the following account behavior profile.
        Provide a concise, professional summary of their behavior patterns, highlighting any unusual activities, risk factors, or notable trends.
        
        Account Data:
        ${JSON.stringify(sanitizedProfile, null, 2)}
      `;

      // 2. Call the Gemini API (using gemini-1.5-flash for fast text generation)
      // Change gemini-1.5-flash to gemini-2.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        // Read the JSON error body from Google
        const errorData = await response.json().catch(() => ({}));
        const googleErrorMessage = errorData?.error?.message || response.statusText;
        const errorCode = errorData?.error?.code || response.status;
        
        throw new Error(`[HTTP ${errorCode}] ${googleErrorMessage}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
      
      setSummary(aiText);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Optional: Pass the generated summary back to the parent component or save to your DB
      await onSave?.({
        account_number: accountProfile?.account_number,
        ai_summary: summary,
        analyzed_at: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      alert('Error saving summary: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper to safely display nested profile objects
  const renderProfileData = (data) => {
    return Object.entries(data || {}).map(([key, value]) => (
      <div key={key} style={{ marginBottom: '8px', fontSize: '13px' }}>
        <strong style={{ color: '#aaa', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}: </strong>
        <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
      </div>
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '95vw', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: '8px' }}>
        
        {/* Header */}
        <div className="modal-hdr" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #333', color: '#fff' }}>
          <div className="modal-title" style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', gap: '8px' }}>
            <span>🤖</span>
            <span>AI Behavior Profile Summary</span>
          </div>
          <div className="modal-close" onClick={onClose} style={{ cursor: 'pointer' }}>✕</div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', color: '#e0e0e0' }}>
          
          {/* Left Panel: Raw Account Data */}
          <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #333', overflowY: 'auto', background: '#121212' }}>
            <h3 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0 }}>
              Account Data Feed
            </h3>
            <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
              {renderProfileData(encodedAccountProfile)}
            </div>
          </div>

          {/* Right Panel: AI Summary Output */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#181818' }}>
            <h3 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>AI Analysis</span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {summary && !isGenerating && (
                  <button 
                    onClick={handleCopy}
                    style={{ 
                      fontSize: '12px', 
                      padding: '4px 10px', 
                      cursor: 'pointer', 
                      background: copied ? '#28a745' : '#2a2a2a', 
                      color: '#fff', 
                      border: '1px solid #444', 
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Summary'}
                  </button>
                )}

                <button 
                  onClick={() => generateAiSummary()} 
                  disabled={isGenerating}
                  style={{ fontSize: '12px', padding: '4px 8px', cursor: isGenerating ? 'not-allowed' : 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                  {isGenerating ? 'Analyzing...' : 'Generate Summary'}
                </button>
              </div>
            </h3>

            {isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ marginBottom: '10px' }}>Analyzing behavior vectors...</div>
                <div style={{ width: '30px', height: '30px', border: '3px solid #333', borderTop: '3px solid #007bff', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : error ? (
              <div style={{ color: '#ff6b6b', background: '#2d1818', padding: '12px', borderRadius: '6px' }}>
                <strong>Error:</strong> {error}
              </div>
            ) : (
              /* 2. CHANGER HERE: Use ReactMarkdown wrapper with custom styles for proper layout */
              <div className="markdown-container" style={{ lineHeight: '1.6', fontSize: '14px', color: '#ccc' }}>
                {summary ? (
                  <ReactMarkdown 
                    components={{
                      // Styling markdown elements to visually blend with your dark theme
                      p: ({node, ...props}) => <p style={{ margin: '0 0 12px 0' }} {...props} />,
                      ul: ({node, ...props}) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }} {...props} />,
                      ol: ({node, ...props}) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
                      strong: ({node, ...props}) => <strong style={{ color: '#fff', fontWeight: 'bold' }} {...props} />
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                ) : (
                  "Click 'Generate Summary' to analyze this profile."
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#1a1a1a' }}>
          <button className="btn btn-link" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={saving || !summary || isGenerating}
            style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: (saving || !summary || isGenerating) ? 'not-allowed' : 'pointer', opacity: (saving || !summary || isGenerating) ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save AI Summary'}
          </button>
        </div>
      </div>
      
      {/* Inline style for the spinner if you don't have a global one */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};




const Detail = ({ a }) => {
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showSARModal, setShowSARModal] = useState(false);
  const [showFaydaModal, setShowFaydaModal] = useState(false);
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false);

  if (!a) return <div className="empty"><div style={{fontSize:32}}>◈</div><div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:2}}>SELECT AN ACCOUNT</div></div>;

  const names = parseJ(a.NAMES) ?? [];
  const fullNames = parseJ(a.FULL_NAMES) ?? [];
  const occs = parseJ(a.OCCUPATIONS) ?? [];
  const types = parseJ(a.ACCOUNT_TYPES) ?? [];
  const brs = parseJ(a.BRANCHES) ?? [];
  const genders = parseJ(a.GENDERS) ?? [];
  const phones = parseJ(a.PHONE_NUMBERS) ?? [];

  const fullName = fullNames[0] ?? names[0] ?? "Unknown";
  const gender = genders[0] ?? "—";
  const gColor = gender==="male"?"#4d8ef0":gender==="female"?"#e06aa8":"#9b7be8";
  const avatarBg = gender==="male"?"#0d2040":gender==="female"?"#2a0d20":"#1a0d2a";

  const timeData = (parseJ(a.time_of_day_profile_list)??[]).sort((x,y)=>x.hour_of_day-y.hour_of_day).map(d=>({h:`${d.hour_of_day}h`,freq:d.hourly_tx_frequency,amount:+(d.hourly_total_amount).toFixed(0)}));
  const bens = parseJ(a.beneficiaries_list)??[];
  const manners = parseJ(a.conducting_manner_list)??[];
  const currencies = parseJ(a.currency_list)??[];
  const branchData = parseJ(a.branch_list)??[];

  const benMax = Math.max(...bens.map(b=>b.tx_frequency),1);
  const mMax = Math.max(...manners.map(m=>m.tx_frequency),1);
  const brMax = Math.max(...branchData.map(b=>b.total_amt_per_branch),1);

  const rolling = [
    {w:"1h",sum:a.average_rolling_sum_1hr,avg:a.average_rolling_avg_1hr,std:a.average_rolling_std_1hr,freq:a.average_rolling_frequency_1hr},
    {w:"3h",sum:a.average_rolling_sum_3hr,avg:a.average_rolling_avg_3hr,std:a.average_rolling_std_3hr,freq:a.average_rolling_frequency_3hr},
    {w:"6h",sum:a.average_rolling_sum_6hr,avg:a.average_rolling_avg_6hr,std:a.average_rolling_std_6hr,freq:a.average_rolling_frequency_6hr},
    {w:"12h",sum:a.average_rolling_sum_12hr,avg:a.average_rolling_avg_12hr,std:a.average_rolling_std_12hr,freq:a.average_rolling_frequency_12hr},
    {w:"1d",sum:a.average_rolling_sum_1day,avg:a.average_rolling_avg_1day,std:a.average_rolling_std_1day,freq:a.average_rolling_frequency_1day},
    {w:"7d",sum:a.average_rolling_sum_7days,avg:a.average_rolling_avg_7days,std:a.average_rolling_std_7days,freq:a.average_rolling_frequency_7days},
    {w:"30d",sum:a.average_rolling_sum_30days,avg:a.average_rolling_avg_30days,std:a.average_rolling_std_30days,freq:a.average_rolling_frequency_30days},
  ];
  const rChart = rolling.map(r=>({w:r.w,sum:+(r.sum??0).toFixed(0),avg:+(r.avg??0).toFixed(0),freq:+(r.freq??0).toFixed(2)}));

  const flowFreqPie = [{name:"Sent",value:+((a.sent_percentage_by_frequency??0)*100).toFixed(1),fill:"#4d8ef0"},{name:"Recv",value:+((a.receive_percentage_by_frequency??0)*100).toFixed(1),fill:"#38c9a8"}];
  const flowAmtPie = [{name:"Sent",value:+((a.sent_percentage_by_amount??0)*100).toFixed(1),fill:"#4d8ef0"},{name:"Recv",value:+((a.receive_percentage_by_amount??0)*100).toFixed(1),fill:"#38c9a8"}];
  const cashPie = [{name:"Cash",value:a.cash_count??0,fill:"#e09a2a"},{name:"Non-cash",value:a.non_cash_count??0,fill:"#4d8ef0"}];

  const radarData = [
    {x:"Irregular",v:+(( a.irregular_amount_ratio??0)*100).toFixed(1)},
    {x:"Cash%",v:+((a.cash_count_ratio??0)*100).toFixed(1)},
    {x:"Round1k",v:+((a.round_1000_ratio??0)*100).toFixed(1)},
    {x:"SameVal",v:+((a.same_value_ratio??0)*100).toFixed(1)},
    {x:"BelowThr",v:+((a.just_below_threshold_frequency??0)*100).toFixed(1)},
    {x:"Night",v:+((a.night_day_frequency_ratio??0)*100).toFixed(1)},
    {x:"Weekend",v:+((a.weekend_vs_workday_freq_ratio??0)*100).toFixed(1)},
    {x:"UniqBenef",v:+((a.unique_beneficiary_ratio??0)*100).toFixed(1)},
  ];

  const rl = riskLevel(a.irregular_amount_ratio??0);

  return (
    <div>
      {showRiskModal && <RiskModal a={a} onClose={() => setShowRiskModal(false)} />}
      {showSARModal && <SARModal a={a} onClose={() => setShowSARModal(false)} />}
      {showFaydaModal && <FaydaModal a={a} onClose={() => setShowFaydaModal(false)} />}
      {showAiAnalysisModal && <AiAnalysisModal accountProfile={a} onClose={() => setShowAiAnalysisModal(false)} onSave={() => {}} geminiToken={`AIzaSyCJPOER46fost5NCJBHWhFXQKKO6KR_eH0`}  />}

      {/* ── Profile Header ── */}
      <div className="dhdr">
        <div className="avatar" style={{background:avatarBg,color:gColor}}>{initials(fullName)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div className="dname">{fullName}</div>
          <div className="dacct">{a.account_number}</div>
          <div className="chips">
            <span className="chip">👤 {gender}</span>
            <span className="chip">💼 {occs[0]??'—'}</span>
            <span className="chip">🏦 {types[0]??'—'}</span>
            <span className="chip">📍 {brs[0]??'—'}</span>
            <span className="chip">📞 {phones[0]??'—'}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div className="rbadge" style={{background:rl.color+"22",color:rl.color,fontSize:12,padding:"4px 10px"}}>{rl.label} RISK</div>
          <div className="action-row">
            <button className="btn-action" onClick={() => setShowFaydaModal(true)}>
              <span>📦</span>
              <span>Fayda</span>
            </button>
            <button className="btn-action" onClick={() => setShowAiAnalysisModal(true)}>
              <span>🤖</span>
              <span>AI Co-Analyst</span>
            </button>
            <button className="btn-action" onClick={() => setShowRiskModal(true)}>
              <span>📊</span>
              <span>Risk Breakdown</span>
            </button>
            <button className="btn-action primary" onClick={() => setShowSARModal(true)}>
              <span>🚨</span>
              <span>Add to My SAR Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dcontent">

        {/* ── KYC ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--blue)"}}/><div className="ctitle">KYC Identity</div></div>
          <div className="cbody">
            <div className="sg3">
              <div className="scard"><div className="slabel">All Names</div>{[...new Set([...names,...fullNames])].map((n,i)=><div key={i} style={{fontSize:11,color:"var(--tx)",fontWeight:500,marginTop:3}}>{n}</div>)}</div>
              <div className="scard"><div className="slabel">Occupations</div>{occs.length?occs.map((o,i)=><div key={i} style={{fontSize:11,color:"var(--teal)",marginTop:3}}>{o}</div>):<span style={{fontSize:11,color:"var(--t3)"}}>—</span>}</div>
              <div className="scard"><div className="slabel">Account Types</div>{types.map((t,i)=><div key={i} style={{fontSize:11,color:"var(--purple)",marginTop:3}}>{t}</div>)}</div>
              <div className="scard"><div className="slabel">Branches</div>{brs.map((b,i)=><div key={i} style={{fontSize:11,color:"var(--amber)",marginTop:3}}>{b}</div>)}</div>
              <div className="scard"><div className="slabel">Genders</div>{genders.map((g,i)=><div key={i} style={{fontSize:11,color:gColor,marginTop:3}}>{g}</div>)}</div>
              <div className="scard"><div className="slabel">Phone Numbers</div>{phones.map((p,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:3}}>{p}</div>)}</div>
            </div>
          </div>
        </div>

        {/* ── Volume: Sent ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--blue)"}}/><div className="ctitle">Sent Transactions</div></div>
          <div className="cbody">
            <div className="sg4">
              <Sc label="Total Sent" value={fmtK(a.sent_amount_total)} sub={`${a.sent_amount_count??0} txns`} color="var(--blue)"/>
              <Sc label="Average" value={fmtK(a.sent_amount_average)} sub="per txn"/>
              <Sc label="Std Deviation" value={fmtK(a.sent_amount_std)}/>
              <Sc label="Count" value={fmt(a.sent_amount_count)} sub="sent"/>
            </div>
          </div>
        </div>

        {/* ── Volume: Received ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--teal)"}}/><div className="ctitle">Received Transactions</div></div>
          <div className="cbody">
            <div className="sg4">
              <Sc label="Total Received" value={fmtK(a.recieve_amount_total)} sub={`${a.recieve_amount_count??0} txns`} color="var(--teal)"/>
              <Sc label="Average" value={fmtK(a.recieve_amount_average)} sub="per txn"/>
              <Sc label="Std Deviation" value={fmtK(a.recieve_amount_std)}/>
              <Sc label="Count" value={fmt(a.recieve_amount_count)} sub="received"/>
            </div>
          </div>
        </div>

        {/* ── Combined + Flow ── */}
        <div className="col2">
          <div className="card">
            <div className="card-hdr"><div className="cdot" style={{background:"var(--purple)"}}/><div className="ctitle">Combined S+R</div></div>
            <div className="cbody">
              <div className="sg2">
                <Sc label="S+R Total" value={fmtK(a.s_and_r_amount_total)} color="var(--purple)"/>
                <Sc label="S+R Count" value={fmt(a.s_and_r_amount_count)}/>
                <Sc label="S+R Average" value={fmtK(a.s_and_r_amount_average)}/>
                <Sc label="S+R Std Dev" value={fmtK(a.s_and_r_amount_std)}/>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr"><div className="cdot" style={{background:"var(--teal)"}}/><div className="ctitle">Flow by Frequency &amp; Amount</div></div>
            <div className="cbody" style={{display:"flex",gap:20,alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:4}}>BY COUNT</div>
                <PieChart width={90} height={90}><Pie data={flowFreqPie} cx={45} cy={45} innerRadius={26} outerRadius={40} dataKey="value" stroke="none">{flowFreqPie.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip formatter={v=>`${v}%`} contentStyle={{background:"var(--s3)",border:"1px solid var(--b2)",fontSize:10}}/></PieChart>
              </div>
              <div>
                <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:4}}>BY AMOUNT</div>
                <PieChart width={90} height={90}><Pie data={flowAmtPie} cx={45} cy={45} innerRadius={26} outerRadius={40} dataKey="value" stroke="none">{flowAmtPie.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip formatter={v=>`${v}%`} contentStyle={{background:"var(--s3)",border:"1px solid var(--b2)",fontSize:10}}/></PieChart>
              </div>
              <div style={{flex:1}}>
                {[["Sent %  (freq)", fmtPct(a.sent_percentage_by_frequency), "var(--blue)"],["Recv % (freq)", fmtPct(a.receive_percentage_by_frequency), "var(--teal)"],["Sent % (amt)", fmtPct(a.sent_percentage_by_amount), "var(--blue)"],["Recv % (amt)", fmtPct(a.receive_percentage_by_amount), "var(--teal)"]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:5}}>
                    <span style={{color:"var(--t2)"}}>{l}</span>
                    <span style={{fontFamily:"var(--mono)",color:c,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cash vs Non-Cash ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--amber)"}}/><div className="ctitle">Cash vs Non-Cash</div></div>
          <div className="cbody">
            <div className="col2">
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <PieChart width={90} height={90}><Pie data={cashPie} cx={45} cy={45} innerRadius={26} outerRadius={40} dataKey="value" stroke="none">{cashPie.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip contentStyle={{background:"var(--s3)",border:"1px solid var(--b2)",fontSize:10}}/></PieChart>
                <div>{cashPie.map(d=><div key={d.name} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:6}}><span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--t2)"}}><span style={{width:7,height:7,borderRadius:1,background:d.fill,display:"inline-block"}}/>{d.name}</span><span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:d.fill}}>{d.value}</span></div>)}</div>
              </div>
              <div className="sg2">
                <Sc label="Cash Total" value={fmtK(a.cash_amount_total)} color="var(--amber)"/>
                <Sc label="Non-Cash Total" value={fmtK(a.non_cash_amount_total)} color="var(--blue)"/>
                <Sc label="Cash Count Ratio" value={fmtPct(a.cash_count_ratio)}/>
                <Sc label="Cash Amount Ratio" value={fmtPct(a.cash_amount_ratio)}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── Risk Indicators ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--red)"}}/><div className="ctitle">Risk Indicators</div></div>
          <div className="cbody" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="rg">
              <RB label="Irregular Amount" value={a.irregular_amount_ratio}/>
              <RB label="Cash Count %" value={a.cash_count_ratio}/>
              <RB label="Cash Amount %" value={a.cash_amount_ratio}/>
              <RB label="Round 1000 Ratio" value={a.round_1000_ratio}/>
              <RB label="Same Value Ratio" value={a.same_value_ratio}/>
              <RB label="Below Threshold" value={a.just_below_threshold_frequency}/>
              <RB label="Night/Day Ratio" value={a.night_day_frequency_ratio}/>
              <RB label="Unique Beneficiary" value={a.unique_beneficiary_ratio}/>
            </div>
            <div style={{height:200}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--b1)"/>
                  <PolarAngleAxis dataKey="x" tick={{fill:"var(--t3)",fontSize:9,fontFamily:"var(--mono)"}}/>
                  <PolarRadiusAxis domain={[0,100]} tick={{fill:"var(--t3)",fontSize:8}} axisLine={false} tickLine={false}/>
                  <Radar name="Risk%" dataKey="v" stroke="#e05252" fill="#e05252" fillOpacity={0.15}/>
                  <Tooltip content={<CT/>}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Night / Day ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--purple)"}}/><div className="ctitle">Night / Day Breakdown</div></div>
          <div className="cbody">
            <div className="sg4">
              <Sc label="Day Tx Count" value={fmt(a.day_tx_count)} color="var(--amber)"/>
              <Sc label="Night Tx Count" value={fmt(a.night_tx_count)} color="var(--purple)"/>
              <Sc label="Day Total Amt" value={fmtK(a.day_total_amount)}/>
              <Sc label="Night Total Amt" value={fmtK(a.night_total_amount)}/>
              <Sc label="Night/Day Freq Ratio" value={fmtPct(a.night_day_frequency_ratio)}/>
              <Sc label="Night/Day Amt Ratio" value={fmtPct(a.night_day_amount_ratio)}/>
            </div>
          </div>
        </div>

        {/* ── Hourly Activity ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--blue)"}}/><div className="ctitle">Hourly Activity Profile</div></div>
          <div className="cbody">
            <div style={{height:180}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{top:4,right:4,bottom:0,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" vertical={false}/>
                  <XAxis dataKey="h" tick={{fontSize:9,fill:"var(--t3)",fontFamily:"var(--mono)"}} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="l" tick={{fontSize:9,fill:"var(--t3)"}} axisLine={false} tickLine={false} width={24}/>
                  <YAxis yAxisId="r" orientation="right" tick={{fontSize:9,fill:"var(--t3)"}} axisLine={false} tickLine={false} width={38} tickFormatter={fmtK}/>
                  <Tooltip content={<CT/>}/>
                  <Bar yAxisId="l" dataKey="freq" name="Frequency" fill="#4d8ef0" radius={[3,3,0,0]} opacity={0.9}/>
                  <Bar yAxisId="r" dataKey="amount" name="Amount" fill="#38c9a8" radius={[3,3,0,0]} opacity={0.5}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",gap:14,marginTop:8,fontSize:10,color:"var(--t2)"}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:1,background:"#4d8ef0",display:"inline-block"}}/> Frequency (left axis)</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:1,background:"#38c9a8",display:"inline-block"}}/> Amount (right axis)</span>
            </div>
          </div>
        </div>

        {/* ── Rolling Windows ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--amber)"}}/><div className="ctitle">Rolling Window Averages (all windows)</div></div>
          <div className="cbody" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="rwg">
              {rolling.map(r=>(
                <div key={r.w} className="rwcell">
                  <div className="rww">{r.w}</div>
                  <div className="rwv">{fmtK(r.sum)}</div>
                  <div className="rwf">avg {fmtK(r.avg)}</div>
                  <div className="rwf">±{fmtK(r.std)}</div>
                  <div className="rwf">×{r.freq?.toFixed(1)??"—"}/win</div>
                </div>
              ))}
            </div>
            <div style={{height:150}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rChart} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4d8ef0" stopOpacity={0.3}/><stop offset="95%" stopColor="#4d8ef0" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" vertical={false}/>
                  <XAxis dataKey="w" tick={{fontSize:9,fill:"var(--t3)",fontFamily:"var(--mono)"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:"var(--t3)"}} axisLine={false} tickLine={false} width={34} tickFormatter={fmtK}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="sum" name="Avg Sum" stroke="#4d8ef0" fill="url(#rg1)" strokeWidth={1.5} dot={{r:2,fill:"#4d8ef0"}}/>
                  <Area type="monotone" dataKey="avg" name="Avg Per Txn" stroke="#38c9a8" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={{r:2,fill:"#38c9a8"}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Workday vs Weekend ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--teal)"}}/><div className="ctitle">Workday vs Weekend</div></div>
          <div className="cbody" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="col2">
              <div>
                <div className="divlbl">Workday</div>
                <div className="sg2">
                  <Sc label="Total" value={fmtK(a.workday_total_amount)} color="var(--blue)"/>
                  <Sc label="Count" value={fmt(a.workday_count)}/>
                  <Sc label="Average" value={fmtK(a.workday_avg_amount)}/>
                  <Sc label="Std Dev" value={fmtK(a.workday_std_amount)}/>
                  <Sc label="Recv/Send Ratio" value={fmtPct(a.workday_receive_to_send_ratio)}/>
                </div>
              </div>
              <div>
                <div className="divlbl">Weekend</div>
                <div className="sg2">
                  <Sc label="Total" value={fmtK(a.weekend_total_amount)} color="var(--purple)"/>
                  <Sc label="Count" value={fmt(a.weekend_count)}/>
                  <Sc label="Average" value={fmtK(a.weekend_avg_amount)}/>
                  <Sc label="Std Dev" value={fmtK(a.weekend_std_amount)}/>
                  <Sc label="Recv/Send Ratio" value={fmtPct(a.weekend_receive_to_send_ratio)}/>
                </div>
              </div>
            </div>
            <div className="divlbl">Comparison Ratios</div>
            <div className="sg3">
              <Sc label="Freq Ratio (wknd/work)" value={fmtPct(a.weekend_vs_workday_freq_ratio)}/>
              <Sc label="Amount Ratio" value={fmtPct(a.weekend_vs_workday_amount_ratio)}/>
              <Sc label="Recv/Send Comp" value={fmtPct(a.weekend_vs_workday_receive_send_ratio_comp)}/>
            </div>
          </div>
        </div>

        {/* ── Time Lapse ── */}
        <div className="card">
          <div className="card-hdr"><div className="cdot" style={{background:"var(--pink)"}}/><div className="ctitle">Time Lapse Between Transactions</div></div>
          <div className="cbody" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="sg4">
              <Sc label="Min Lapse" value={lapseHrs(a.min_time_lapse)} sub={`${fmt(a.min_time_lapse)}s raw`}/>
              <Sc label="Max Lapse" value={lapseHrs(a.max_time_lapse)} sub={`${fmt(a.max_time_lapse)}s raw`}/>
              <Sc label="Avg Lapse" value={lapseHrs(a.avg_time_lapse)} sub={`${fmt(a.avg_time_lapse)}s raw`}/>
              <Sc label="Std Dev" value={lapseHrs(a.stddev_time_lapse)}/>
              <Sc label="Lapse Count" value={fmt(a.lapse_count)} sub="intervals"/>
              <Sc label="Gap (Recv→Sent)" value={lapseHrs(a.gap_between_last_received_and_sent)}/>
            </div>
            <div className="divlbl">Last Activity Timestamps</div>
            <div className="sg3">
              <div className="scard"><div className="slabel">Last Sent</div><div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:4,wordBreak:"break-all"}}>{a.last_sent_activity_timestamp??"—"}</div></div>
              <div className="scard"><div className="slabel">Last Received</div><div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:4,wordBreak:"break-all"}}>{a.last_received_activity_timestamp??"—"}</div></div>
              <div className="scard"><div className="slabel">Last Activity</div><div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:4,wordBreak:"break-all"}}>{a.last_activity_timestamp??"—"}</div></div>
            </div>
          </div>
        </div>

        {/* ── Beneficiaries ── */}
        {bens.length > 0 && (
          <div className="card">
            <div className="card-hdr"><div className="cdot" style={{background:"var(--green)"}}/><div className="ctitle">Beneficiaries · {bens.length} total · unique ratio {fmtPct(a.unique_beneficiary_ratio)}</div></div>
            <div className="cbody" style={{display:"flex",flexDirection:"column",gap:4}}>
              {bens.sort((x,y)=>y.tx_frequency-x.tx_frequency).map((b,i)=><HBar key={i} name={b.BENEFICIARY_ACCOUNT_NO} value={b.tx_frequency} max={benMax} color="#4caf80"/>)}
            </div>
          </div>
        )}

        {/* ── Methods + Currencies + Branches ── */}
        <div className="col3">
          {manners.length > 0 && (
            <div className="card">
              <div className="card-hdr"><div className="cdot" style={{background:"var(--blue)"}}/><div className="ctitle">Transaction Methods</div></div>
              <div className="cbody" style={{display:"flex",flexDirection:"column",gap:4}}>
                {manners.map((m,i)=><HBar key={i} name={m.CONDUCTING_MANNER} value={m.tx_frequency} max={mMax} color="#4d8ef0"/>)}
              </div>
            </div>
          )}
          {currencies.length > 0 && (
            <div className="card">
              <div className="card-hdr"><div className="cdot" style={{background:"var(--amber)"}}/><div className="ctitle">Currencies</div></div>
              <div className="cbody" style={{padding:0}}>
                <table className="mtbl">
                  <thead><tr><th>CCY</th><th>Count</th><th>Total</th><th>Mean</th></tr></thead>
                  <tbody>{currencies.map((c,i)=><tr key={i}><td><span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--amber)",fontWeight:600}}>{c.CURRENCY_TYPE?.toUpperCase()}</span></td><td className="mono">{c.tx_frequency}</td><td className="mono">{fmtK(c.total_amt_per_currency)}</td><td className="mono">{fmtK(c.mean_amt_per_currency)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
          {branchData.length > 0 && (
            <div className="card">
              <div className="card-hdr"><div className="cdot" style={{background:"var(--purple)"}}/><div className="ctitle">Branch Activity</div></div>
              <div className="cbody" style={{display:"flex",flexDirection:"column",gap:4}}>
                {branchData.map((b,i)=><HBar key={i} name={b.BRANCH_ID} value={b.total_amt_per_branch} max={brMax} color="#9b7be8"/>)}
                <div style={{marginTop:8}}>
                  <table className="mtbl">
                    <thead><tr><th>Branch</th><th>Txns</th><th>Mean/Txn</th></tr></thead>
                    <tbody>{branchData.map((b,i)=><tr key={i}><td className="mono">{b.BRANCH_ID}</td><td className="mono">{b.tx_frequency}</td><td className="mono">{fmtK(b.mean_amt_per_branch)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("account_number");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [isDemo, setIsDemo] = useState(false);

  const fetchData = useCallback(async (pg=1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({page:pg,page_size:20,sort_by:sortBy,sort_dir:sortDir});
      if (search.trim()) p.set("search",search.trim());
      const res = await fetch(`${API_BASE}/customers?${p}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAccounts(data.data); setPagination(data.pagination); setIsDemo(false);
      if (data.data.length && !selected) setSelected(data.data[0]);
    } catch {
      setAccounts(MOCK); setPagination({page:1,page_size:20,total_records:1,total_pages:1,has_next:false,has_prev:false}); setIsDemo(true); setSelected(MOCK[0]);
    } finally { setLoading(false); }
  }, [search,sortBy,sortDir]);

  useEffect(()=>{ fetchData(page); },[page]);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="hdr" style={{display:"none",alignItems:"center",justifyContent:"space-between"}}>
          <div className="hdr-logo">FI</div>
          <div><div className="hdr-title">Customer Profile Intelligence</div><div className="hdr-sub">v3_customer_profile · FastAPI</div></div>
          <div className="hdr-right"><div className="pulse"/>{pagination && <div className="hdr-stat">{fmt(pagination.total_records)} profiles</div>}</div>
        </header>
        {isDemo && <div className="demo" style={{ display: "none" }}>⚠ Demo data — set API_BASE to your FastAPI server URL to load live records</div>}
        <div className="body">
          <aside className="sidebar">
            <div className="srch">
              <div className="srch-row">
                <input className="inp" placeholder="Search names, accounts, KYC…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchData(1)}/>
                <button className="btn" onClick={()=>{setPage(1);fetchData(1);}}>Go</button>
              </div>
              <div className="srch-row">
                <select className="sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="account_number">Sort: Account #</option>
                  <option value="sent_amount_total">Sort: Sent Total</option>
                  <option value="s_and_r_amount_total">Sort: Combined Vol</option>
                  <option value="irregular_amount_ratio">Sort: Risk Score</option>
                  <option value="s_and_r_amount_count">Sort: Tx Count</option>
                  <option value="unique_beneficiary_ratio">Sort: Benef Ratio</option>
                </select>
                <select className="sel" value={sortDir} onChange={e=>setSortDir(e.target.value)} style={{maxWidth:68}}>
                  <option value="asc">↑ Asc</option>
                  <option value="desc">↓ Desc</option>
                </select>
                <button className="btn-sm" onClick={()=>{setPage(1);fetchData(1);}}>↺</button>
              </div>
            </div>
            {pagination && <div className="smeta"><span>TOTAL <span className="mv">{fmt(pagination.total_records)}</span></span><span>PG <span className="mv">{pagination.page}/{pagination.total_pages}</span></span></div>}
            <div className="acc-list">
              {loading ? <div className="ld"><div className="spin"/></div> : accounts.map(a=><AccItem key={a.account_number} a={a} active={selected?.account_number===a.account_number} onClick={()=>setSelected(a)}/>)}
            </div>
            <div className="pgn">
              <button className="btn-sm" disabled={!pagination?.has_prev} onClick={()=>setPage(p=>p-1)}>← Prev</button>
              <span className="pg-info">Page {pagination?.page??1}</span>
              <button className="btn-sm" disabled={!pagination?.has_next} onClick={()=>setPage(p=>p+1)}>Next →</button>
            </div>
          </aside>
          <main className="detail"><Detail a={selected}/></main>
        </div>
      </div>
    </>
  );
}
