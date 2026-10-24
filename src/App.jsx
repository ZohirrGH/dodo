import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  Shield, Star, Clock, Users, Trophy, LogOut, Plus, Search, ChevronRight,
  Medal, X, Radio, Lock, Bell, Plane, ArrowRight, Upload, Image as ImageIcon, Award, ScrollText, Headphones, Download, Shirt,
} from "lucide-react";


import badgeLogo from "./assets/badge-logo.png";   
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import backgroundVideo from "./assets/background.mp4";

const BACKGROUND_VIDEO_URL = backgroundVideo;
const BACKGROUND_VIDEO_TYPE = "video/mp4";


const DISCORD_INVITE_URL = "https://discord.gg/tWwmV44dhE";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --gx-gold: #D4A72C;
  --gx-gold-bright: #F4C744;
  --gx-glass: rgba(14,13,11,0.42);
  --gx-glass-strong: rgba(10,10,9,0.66);
  --gx-border: rgba(212,167,44,0.22);
}

* { box-sizing: border-box; }

@keyframes gxFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes gxFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes gxGlowPulse {
  0%, 100% { box-shadow: 0 0 0px rgba(212,167,44,0); }
  50% { box-shadow: 0 0 22px rgba(212,167,44,0.35); }
}
@keyframes gxSpinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes gxFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.gx-video-wrap { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -2; overflow: hidden; background: #050505; }
.gx-video-bg { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); object-fit: cover; }
.gx-video-overlay {
  position: fixed; inset: 0; z-index: -1;
  background: linear-gradient(180deg, rgba(5,5,6,0.78) 0%, rgba(5,5,6,0.55) 40%, rgba(5,5,6,0.82) 100%);
  pointer-events: none;
}

.gx-fade-up { animation: gxFadeUp 0.5s ease both; }
.gx-fade-in { animation: gxFadeIn 0.6s ease both; }

.gx-glass-card {
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  animation: gxFadeUp 0.45s ease both;
}
.gx-hover-lift:hover {
  transform: translateY(-4px);
  border-color: rgba(212,167,44,0.5) !important;
  box-shadow: 0 14px 30px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,167,44,0.15);
}
.gx-stat-card:hover {
  border-color: rgba(212,167,44,0.4) !important;
  box-shadow: 0 10px 26px -14px rgba(0,0,0,0.6);
}
.gx-hover-row {
  transition: background 0.2s ease, transform 0.2s ease;
}
.gx-hover-row:hover {
  background: rgba(212,167,44,0.08) !important;
  transform: translateX(-3px);
}

.gx-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, background 0.18s ease;
}
.gx-btn-gold:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -8px rgba(212,167,44,0.55);
  filter: brightness(1.06);
}
.gx-btn-gold:active:not(:disabled) { transform: translateY(0); }
.gx-btn-ghost:hover {
  border-color: rgba(212,167,44,0.4) !important;
  color: var(--gx-gold-bright) !important;
  background: rgba(212,167,44,0.06) !important;
}
.gx-filter-btn:hover {
  border-color: rgba(212,167,44,0.35) !important;
  color: var(--gx-gold-bright) !important;
}

.gx-nav-item {
  transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease;
  position: relative;
  overflow: hidden;
}
.gx-nav-item:hover {
  background: rgba(212,167,44,0.08);
  color: var(--gx-gold-bright);
  transform: translateX(-4px);
}
.gx-nav-item-active {
  animation: gxGlowPulse 2.6s ease-in-out infinite;
}
.gx-nav-item-active::before {
  content: "";
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--gx-gold-bright), var(--gx-gold));
  border-radius: 3px 0 0 3px;
}

.gx-logo-badge {
  filter: drop-shadow(0 0 10px rgba(212,167,44,0.45));
  animation: gxFloat 4.5s ease-in-out infinite;
}

.gx-footer {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 28px;
  margin-top: 24px;
  background: var(--gx-glass-strong);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-top: 1px solid var(--gx-border);
  color: #B9B3A2;
  font-size: 12.5px;
  flex-wrap: wrap;
}
.gx-footer-brand { display: flex; align-items: center; gap: 10px; }
.gx-discord-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(88,101,242,0.14);
  color: #8f9aff;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.gx-discord-btn:hover {
  background: #5865F2;
  color: #fff;
  transform: translateY(-2px) scale(1.05);
}

.gx-sound-toggle {
  position: fixed;
  bottom: 78px;
  left: 20px;
  z-index: 25;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--gx-border);
  background: var(--gx-glass-strong);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  color: #F5F1E6;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.gx-sound-toggle:hover {
  transform: scale(1.08);
  border-color: rgba(212,167,44,0.5);
}


input, select, textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
input:hover:not(:disabled), select:hover:not(:disabled), textarea:hover:not(:disabled) {
  border-color: rgba(212,167,44,0.4) !important;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--gx-gold-bright) !important;
  box-shadow: 0 0 0 3px rgba(212,167,44,0.15);
  background: rgba(5,5,6,0.65) !important;
}
input:disabled, select:disabled, textarea:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
input::placeholder, textarea::placeholder {
  color: rgba(245,241,230,0.32);
}
select {
  cursor: pointer;
}


.gx-glass-card:focus-within {
  border-color: rgba(212,167,44,0.35) !important;
  box-shadow: 0 0 0 1px rgba(212,167,44,0.12);
}


button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--gx-gold-bright);
  outline-offset: 2px;
}


.gx-record-card {
  position: relative;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015));
  border: 1px solid rgba(255,255,255,0.07);
  border-right: 3px solid var(--gx-gold);
}
.gx-record-danger { border-right-color: #C24B3F; }
.gx-record-success { border-right-color: #4CAF7D; }

.gx-record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}
.gx-record-id {
  font-family: 'Oswald', sans-serif;
  font-size: 10.5px;
  letter-spacing: 1.2px;
  color: rgba(212,167,44,0.65);
  text-transform: uppercase;
  display: block;
  margin-bottom: 3px;
}
.gx-record-title {
  font-family: 'Oswald', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #F5F1E6;
}

.gx-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 1px solid;
  white-space: nowrap;
}
.gx-tag-gold { color: var(--gx-gold-bright); border-color: rgba(212,167,44,0.4); background: rgba(212,167,44,0.08); }
.gx-tag-danger { color: #E0776A; border-color: rgba(194,75,63,0.45); background: rgba(194,75,63,0.1); }
.gx-tag-success { color: #7FD9A6; border-color: rgba(76,175,125,0.45); background: rgba(76,175,125,0.1); }

.gx-record-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px 16px;
  margin-bottom: 4px;
}
.gx-record-field-label {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #7A7566;
  margin-bottom: 2px;
}
.gx-record-field-value {
  font-size: 13px;
  color: #E7E2D4;
}

.gx-mugshot {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(212,167,44,0.3);
  flex-shrink: 0;
}

/* ---- Uniform room: 3D card gallery ---- */
.gx-uni { position: relative; height: 640px; margin-top: 30px; perspective: 1400px; overflow: hidden; cursor: grab; user-select: none; touch-action: pan-y; }
.gx-uni:active { cursor: grabbing; }
.gx-uni-stage { position: absolute; inset: 0; transform-style: preserve-3d; pointer-events: none; }
.gx-uni-item { position: absolute; left: 50%; top: 50%; width: 240px; margin-left: -120px; margin-top: -190px;
  transition: transform 1.1s cubic-bezier(.22,.8,.25,1), opacity 1.1s, filter 1.1s; will-change: transform; }
.gx-uni-inner { transition: transform .35s cubic-bezier(.22,.8,.25,1); transform-origin: center 40%; }
.gx-uni-item:hover .gx-uni-inner { transform: scale(1.14); }
.gx-uni-item:hover { z-index: 100 !important; filter: none !important; opacity: 1 !important; }
.gx-uni-card { height: 360px; border-radius: 16px; overflow: hidden; background: var(--c);
  border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
.gx-uni-item.active .gx-uni-card { border-color: var(--gx-gold); box-shadow: 0 0 0 1px var(--gx-gold), 0 0 40px rgba(212,167,44,0.3), 0 20px 40px rgba(0,0,0,0.6); }
.gx-uni-card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.gx-uni-ph { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.45)); }
.gx-uni-ph i { display: block; width: 64px; height: 64px; border-radius: 50%; background: #d9b896; }
.gx-uni-ph b { display: block; width: 110px; height: 130px; margin-top: -6px; border-radius: 6px; background: #12121a; }
.gx-uni-label { text-align: center; margin-top: 16px; }
.gx-uni-name { display: inline-block; font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 18px; letter-spacing: 2px;
  text-transform: uppercase; color: #fff; padding-bottom: 6px; border-bottom: 2px solid var(--gx-gold); text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
.gx-uni-code { display: block; width: max-content; margin: 10px auto 0; font-family: Consolas, monospace; font-size: 13px;
  color: var(--gx-gold-bright); background: rgba(212,167,44,0.1); border: 1px solid rgba(212,167,44,0.45);
  border-radius: 999px; padding: 4px 14px; cursor: pointer; }
.gx-uni-code:hover { background: rgba(212,167,44,0.22); }
.gx-uni-dots { display: flex; justify-content: center; gap: 8px; margin-top: 8px; }
.gx-uni-dots span { width: 8px; height: 8px; border-radius: 50%; background: #444; cursor: pointer; transition: .3s; }
.gx-uni-dots span.on { background: var(--gx-gold); width: 24px; border-radius: 6px; }
@media (max-width: 640px) {
  .gx-uni { height: 590px; }
  .gx-uni-item { width: 210px; margin-left: -105px; }
  .gx-uni-card { height: 310px; }
}


`;

const RANKS = [
  "Chef Sheriff", "Under Sheriff", "Management", "Assistant Chef", "Division Chef", "Major",
  "Capitan", "Lieutnant", "Sergent", "Master Deputy", "Deputy First Class", "Deputy",
];
const CHIEF_RANK = "Chef Sheriff";
const isChief = (rank) => rank === CHIEF_RANK;

// ---------------------------------------------------------------------------
// Permissions
// Every rank has two things the Chef Sheriff can change from the "permissions" room:
//   rooms: which pages of the side menu the rank can see
//   caps:  what the rank can do inside the app
// The settings live in the role_permissions table. Anything not stored there falls back to the
// defaults below, which reproduce the behaviour the app had before the permissions room existed.
// NOTE: the database enforces the same settings: has_perm() for actions, has_room() for who can read a room's data.
// ---------------------------------------------------------------------------
const ROOMS = [
  { key: "dashboard", label: "dashboard", icon: Shield },
  { key: "leaderboard", label: "leaderboard", icon: Trophy },
  { key: "officers", label: "officers", icon: Users },
  { key: "operations", label: "Operations", icon: Radio },
  { key: "wanted", label: "Wanted", icon: Search },
  { key: "dispatch", label: "Dispatch", icon: Headphones },
  { key: "tests", label: "TEST MDT", icon: Award },
  { key: "vacations", label: "Vacations", icon: Plane },
  { key: "weekly", label: "weekly schedule", icon: Clock },
  { key: "uniform", label: "uniform", icon: Shirt },
  { key: "activity", label: "activity log", icon: ScrollText },
];

// What a rank can do inside each room. "their own" = records the person created (or their own logs),
// "anyone's" = records created by somebody else. The database enforces the same switches.
const ACTION_GROUPS = [
  { room: "operations", label: "Operations", icon: Radio, actions: [
    { key: "create", label: "Create operations" },
    { key: "edit_own", label: "Edit their own operations" },
    { key: "edit_all", label: "Edit anyone's operations" },
    { key: "delete_own", label: "Delete their own operations" },
    { key: "delete_all", label: "Delete anyone's operations" },
  ] },
  { room: "wanted", label: "Wanted", icon: Search, actions: [
    { key: "create", label: "Add wanted persons" },
    { key: "edit_own", label: "Edit their own entries" },
    { key: "edit_all", label: "Edit anyone's entries" },
    { key: "delete_own", label: "Delete their own entries" },
    { key: "delete_all", label: "Delete anyone's entries" },
  ] },
  { room: "tests", label: "TEST MDT", icon: Award, actions: [
    { key: "create", label: "Add tests" },
    { key: "edit_own", label: "Edit their own tests" },
    { key: "edit_all", label: "Edit anyone's tests" },
    { key: "delete_own", label: "Delete their own tests" },
    { key: "delete_all", label: "Delete anyone's tests" },
  ] },
  { room: "dispatch", label: "Dispatch", icon: Headphones, actions: [
    { key: "create", label: "Submit dispatch logs" },
    { key: "edit_own", label: "Edit their own logs" },
    { key: "delete_own", label: "Delete their own logs" },
  ] },
  { room: "uniform", label: "Uniform", icon: Shirt, actions: [
    { key: "create", label: "Add uniform cards" },
    { key: "edit_own", label: "Edit their own cards" },
    { key: "edit_all", label: "Edit anyone's cards" },
    { key: "delete_own", label: "Delete their own cards" },
    { key: "delete_all", label: "Delete anyone's cards" },
  ] },
  { room: "vacations", label: "Vacations", icon: Plane, actions: [
    { key: "create", label: "Submit vacation requests" },
    { key: "review", label: "See every request and accept / reject", hint: "Without this, an officer only sees their own requests" },
  ] },
];

const DEFAULT_MANAGEMENT_RANKS = [
  "Chef Sheriff", "Under Sheriff", "Management", "Assistant Chef", "Division Chef", "Major", "Capitan", "Lieutnant",
];

function defaultActionsFor(rank) {
  const management = DEFAULT_MANAGEMENT_RANKS.includes(rank);
  const write = rank !== "Deputy";
  const advanced = !["Deputy", "Deputy First Class"].includes(rank);
  const chief = isChief(rank);
  const records = (create, any) => ({ create, edit_own: true, edit_all: any, delete_own: true, delete_all: any });
  return {
    operations: records(write, management),
    wanted: records(advanced, chief),
    tests: records(advanced, chief),
    dispatch: records(advanced, chief),
    // Uniform cards: closed for everybody; the Chef Sheriff opens them rank by rank in the permissions room
    uniform: { create: chief, edit_own: chief, edit_all: chief, delete_own: chief, delete_all: chief },
    vacations: { create: write, review: management },
  };
}

function defaultPermsFor(rank) {
  const management = DEFAULT_MANAGEMENT_RANKS.includes(rank);
  const writeAdvanced = !["Deputy", "Deputy First Class"].includes(rank);
  return {
    actions: defaultActionsFor(rank),
    rooms: {
      dashboard: true, leaderboard: true, operations: true, wanted: true, tests: true, vacations: true, uniform: true,
      officers: management, weekly: management, dispatch: writeAdvanced, activity: isChief(rank),
    },
  };
}

// Saved settings, keyed by rank. Filled from the database right after sign-in.
let PERMS = {};
const applyPerms = (rows) => {
  const next = {};
  (rows || []).forEach((r) => { next[r.rank] = { rooms: r.rooms || {}, actions: r.actions || {} }; });
  PERMS = next;
};
const setRankPerms = (rank, perms) => { PERMS = { ...PERMS, [rank]: perms }; };

function getPerms(rank) {
  const base = defaultPermsFor(rank);
  // The Chef Sheriff is never locked out of anything, whatever is stored
  if (isChief(rank)) {
    return {
      actions: Object.fromEntries(Object.entries(base.actions).map(([room, a]) => [room, Object.fromEntries(Object.keys(a).map((k) => [k, true]))])),
      rooms: Object.fromEntries(ROOMS.map((r) => [r.key, true])),
    };
  }
  const saved = PERMS[rank];
  const actions = {};
  Object.keys(base.actions).forEach((room) => {
    actions[room] = { ...base.actions[room], ...(saved?.actions?.[room] || {}) };
  });
  return { actions, rooms: { ...base.rooms, ...(saved?.rooms || {}) } };
}

const can = (rank, room, action) => !!getPerms(rank).actions[room]?.[action];
const canEditItem = (me, room, ownerId) => can(me.rank, room, "edit_all") || (ownerId === me.id && can(me.rank, room, "edit_own"));
const canDeleteItem = (me, room, ownerId) => can(me.rank, room, "delete_all") || (ownerId === me.id && can(me.rank, room, "delete_own"));
const canSeeRoom = (rank, key) => !!getPerms(rank).rooms[key];

function startOfWeek(ts) {
  const d = new Date(ts);
  d.setDate(d.getDate() - d.getDay()); 
  d.setHours(0, 0, 0, 0);
  return d;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }


function parseTimeToHours(str) {
  if (!str) return null;
  const s = str.trim().replace(",", ".");
  if (/^\d{1,2}:\d{1,2}$/.test(s)) {
    const [h, m] = s.split(":").map(Number);
    if (h > 24 || m > 59) return null;
    return h + m / 60;
  }
  if (/^\d{1,2}(\.\d+)?$/.test(s)) {
    const v = parseFloat(s);
    if (v > 24) return null;
    return v;
  }
  return null;
}
function computeDuration(timeIn, timeOut) {
  const a = parseTimeToHours(timeIn);
  const b = parseTimeToHours(timeOut);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff <= 0) diff += 24;
  return Math.round(diff * 100) / 100;
}
function fmtHours(h) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toFixed(1)} h`;
}

// Hourly rate per rank (from the "Hourly Salary by Rank" chart).
// Chef Sheriff has no listed rate on the chart — assumed 20000 as the next
// step above Under Sheriff (18000); change this if you have an official value.
const HOURLY_RATES = {
  "Chef Sheriff": 20000,
  "Under Sheriff": 18000,
  "Assistant Chef": 16000,
  "Division Chef": 14000,
  "Major": 12000,
  "Capitan": 10000,
  "Lieutnant": 9000,
  "Sergent": 8000,
  "Master Deputy": 7000,
  "Deputy First Class": 6000,
  "Deputy": 5000,
};
function getHourlyRate(rank) {
  return HOURLY_RATES[rank] || 0;
}
function fmtMoney(n) {
  return `$${Math.round(n || 0).toLocaleString("en-US")}`;
}


function matchesQuery(officer, query) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const name = (officer.name || "").toLowerCase();
  const badge = (officer.badge || "").toLowerCase();
  return tokens.some((t) => name.startsWith(t) || badge.startsWith(t) || name.includes(t));
}


function shortId(id) {
  if (!id) return "000000";
  return String(id).replace(/-/g, "").slice(-6).toUpperCase();
}

export default function SheriffApp() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // id of the user whose profile fetch has finished (avoids a "Profile not found" flash right after sign-in)
  const [profileFor, setProfileFor] = useState(null);
  // id of the user whose role permissions have been loaded (the menu must not flash the wrong rooms)
  const [permsFor, setPermsFor] = useState(null);
  const [, setPermsTick] = useState(0);
  const [view, setView] = useState("dashboard");
  const [viewedProfileId, setViewedProfileId] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState(null);
  // True while we are coming back from Discord (?code=...) and exchanging it for a session
  const [exchanging, setExchanging] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.has("code") || p.has("error");
    } catch { return false; }
  });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2800);
  };

  // 1) Auth listener: subscribe once, ignore token refreshes
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "TOKEN_REFRESHED") return;
      setSession(sess);
      if (!sess) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Load profile, keyed on the user id (a string), not the session object
  const userId = session?.user?.id ?? null;

  const loadProfile = useCallback(async (id) => {
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) console.error("profile error:", error);
    setProfile(data ?? null);
    setProfileFor(id);
    setLoading(false);
  }, []);

  // Role permissions (rooms + capabilities per rank). On any failure we keep the built-in defaults.
  const loadPerms = useCallback(async (id) => {
    try {
      const { data, error } = await supabase.from("role_permissions").select("rank, rooms, actions");
      if (error) console.error("permissions error:", error);
      else applyPerms(data);
    } catch (e) {
      console.error("permissions error:", e);
    }
    setPermsTick((t) => t + 1);
    setPermsFor(id);
  }, []);

  useEffect(() => {
    if (userId) loadPerms(userId);
  }, [userId, loadPerms]);

  // Discord OAuth callback: ?code=...&state=...
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    if (!code && !oauthError) return;
    window.history.replaceState({}, "", url.pathname);

    (async () => {
      if (oauthError) {
        // prompt=none fails for members who never approved the app: retry with the normal Discord screen
        if (["consent_required", "interaction_required", "login_required"].includes(oauthError)) {
          try { localStorage.removeItem("gx_discord_ok"); } catch { /* ignore */ }
          startDiscordLogin();
          return;
        }
        setAuthError(GATE_MESSAGES.denied);
        setExchanging(false);
        return;
      }

      let expected = null;
      try {
        expected = sessionStorage.getItem("gx_oauth_state");
        sessionStorage.removeItem("gx_oauth_state");
      } catch { /* ignore */ }
      if (!expected || expected !== state) {
        setAuthError(GATE_MESSAGES.state_mismatch);
        setExchanging(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("discord-auth", {
        body: { action: "login", code, redirectUri: oauthRedirectUri() },
      });
      if (error || !data?.token_hash) {
        const info = error ? await readFnError(error) : null;
        setAuthError(GATE_MESSAGES[info?.error] || info?.message || "Sign-in failed. Please try again.");
        setExchanging(false);
        return;
      }
      const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: "magiclink" });
      if (otpErr) {
        setAuthError("Sign-in failed. Please try again.");
        setExchanging(false);
        return;
      }
      try { localStorage.setItem("gx_discord_ok", "1"); } catch { /* ignore */ }
      // exchanging stays true on purpose: the session event takes over from here
    })();
  }, []);

  // Load the profile; once per session also re-check the Discord roles on the server
  const syncedFor = useRef(null);
  useEffect(() => {
    if (!userId) { setProfile(null); syncedFor.current = null; return; }
    loadProfile(userId);          // no setLoading(true): this was unmounting the app
    if (syncedFor.current === userId) return;
    syncedFor.current = userId;
    (async () => {
      const { error } = await supabase.functions.invoke("discord-auth", { body: { action: "sync" } });
      if (!error) { loadProfile(userId); return; }   // name / rank may have changed in Discord
      const info = await readFnError(error);
      if (info?.error === "no_role" || info?.error === "not_in_server") {
        setAuthError(GATE_MESSAGES[info.error]);
        try { sessionStorage.setItem("gx_manual_login", "1"); } catch { /* ignore */ }
        await supabase.auth.signOut();
      }
      // any other error (network, server) is ignored on purpose: don't lock people out on a hiccup
    })();
  }, [userId, loadProfile]);

  const logout = async () => {
    try { sessionStorage.setItem("gx_manual_login", "1"); } catch { /* ignore */ }
    await supabase.auth.signOut();
    setView("dashboard");
    setViewedProfileId(null);
  };

  if ((loading && (session || !exchanging)) || (session && !profile && profileFor !== userId) || (session && profile && permsFor !== userId)) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS}</style>
        <div style={{ color: "#B9B3A2" }}>Loading...</div>
      </div>
    );
  }

  // Logged in but no profile row: don't show the login form
  if (session && !profile) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <style>{FONTS}</style>
        <div>Profile not found for this account.</div>
        <button className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={logout}>Sign out</button>
      </div>
    );
  }

  if (!session) {
    let manual = false;
    try { manual = sessionStorage.getItem("gx_manual_login") === "1"; } catch { /* ignore */ }
    return <DiscordGate busy={exchanging} error={authError} autoStart={!exchanging && !authError && !manual} />;
  }


  const management = can(profile.rank, "vacations", "review");

  // Rooms in the side menu come from the role permissions; the permissions room is always Chef Sheriff only
  const navItems = [
    ...ROOMS.filter((r) => canSeeRoom(profile.rank, r.key)),
    ...(isChief(profile.rank) ? [{ key: "permissions", label: "permissions", icon: Lock }] : []),
  ];

  // If the room being viewed was just hidden from this rank, fall back to the first room that is still visible
  const roomHidden = ROOMS.some((r) => r.key === view) && !canSeeRoom(profile.rank, view);
  const currentView = roomHidden ? (navItems[0]?.key ?? "profile") : view;

  const openOwnProfile = () => { setViewedProfileId(profile.id); setView("profile"); };
  const openProfile = (id) => { setViewedProfileId(id); setView("profile"); };

  return (
    <div style={styles.page}>
      <style>{FONTS}</style>
      <BackgroundVideo />

      <div style={styles.shell}>
        <aside style={{ ...styles.sidebar }} className="gx-sidebar-glass">
          <div style={styles.brand}>
            <img src={badgeLogo} alt="GXPD Badge" className="gx-logo-badge" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <div style={styles.brandTitle}>SHERIFF</div>
              <div style={styles.brandSub}>DEPARTMENT</div>
            </div>
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setViewedProfileId(null); setMobileNav(false); }}
                className={`gx-nav-item${currentView === item.key ? " gx-nav-item-active" : ""}`}
                style={{ ...styles.navItem, ...(currentView === item.key ? styles.navItemActive : {}) }}
              >
                <item.icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {currentView === item.key && <ChevronRight size={14} style={{ marginRight: "auto" }} />}
              </button>
            ))}
          </nav>

          <div style={styles.sidebarFooter}>
            <button style={styles.miniProfile} onClick={openOwnProfile}>
              <Avatar url={profile.avatar_url} name={profile.name} />
              <div style={{ overflow: "hidden", textAlign: "right" }}>
                <div style={styles.miniName}>{profile.name}</div>
                <div style={styles.miniRank}>{profile.rank} · #{profile.badge}</div>
              </div>
            </button>
            <button className="gx-btn gx-btn-ghost" style={styles.logoutBtn} onClick={logout}><LogOut size={15} /></button>
          </div>
        </aside>

        {mobileNav && <div style={styles.overlay} onClick={() => setMobileNav(false)} />}

        <main style={styles.main}>
          <div style={styles.topbar} className="gx-topbar-glass">
            <button style={styles.hamburger} onClick={() => setMobileNav(true)}>☰</button>
            <div style={styles.pageTitle}>
              {currentView === "dashboard" && "Dashboard"}
              {currentView === "officers" && "Officers"}
              {currentView === "leaderboard" && "Leaderboard"}
              
              {currentView === "profile" && "Profile"}
              {currentView === "operations" && "Operations"}
              {currentView === "wanted" && "Wanted"}
          
              {currentView === "tests" && "TEST MDT"}
              {currentView === "vacations" && "Vacations"} 
              {currentView === "weekly" && "Weekly Schedule"}
              {currentView === "dispatch" && "Dispatch"}
              {currentView === "uniform" && "Uniform"}
              {currentView === "activity" && "Activity Log"}
              {currentView === "permissions" && "Permissions"}
            </div>
          </div>

          <div key={currentView} className="gx-fade-up" style={{ flex: "1 0 auto", minHeight: 0, paddingBottom: 32 }}>
            {currentView === "dashboard" && canSeeRoom(profile.rank, "dashboard") && <Dashboard profile={profile} openOwnProfile={openOwnProfile} />}
            {currentView === "officers" && canSeeRoom(profile.rank, "officers") && <OfficersView showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "leaderboard" && canSeeRoom(profile.rank, "leaderboard") && <LeaderboardView onOpenProfile={openProfile} />}

            {currentView === "profile" && <ProfileView profileId={viewedProfileId} me={profile} showToast={showToast} onDeleted={() => { setView("officers"); setViewedProfileId(null); }} />}
            {currentView === "operations" && canSeeRoom(profile.rank, "operations") && <OperationsView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "wanted" && canSeeRoom(profile.rank, "wanted") && <WantedView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "tests" && canSeeRoom(profile.rank, "tests") && <TestsView me={profile} showToast={showToast} onOpenProfile={openProfile} />}

            {currentView === "dispatch" && canSeeRoom(profile.rank, "dispatch") && <DispatchView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "vacations" && canSeeRoom(profile.rank, "vacations") && <VacationsView me={profile} management={management} showToast={showToast} />}
            {currentView === "weekly" && canSeeRoom(profile.rank, "weekly") && <WeeklyTableView me={profile} onOpenProfile={openProfile} />}
            {currentView === "uniform" && canSeeRoom(profile.rank, "uniform") && <UniformView me={profile} showToast={showToast} />}
            {currentView === "activity" && canSeeRoom(profile.rank, "activity") && <ActivityLogView onOpenProfile={openProfile} />}
            {currentView === "permissions" && isChief(profile.rank) && <PermissionsView me={profile} showToast={showToast} onSaved={() => setPermsTick((t) => t + 1)} />}
          </div>

          <SiteFooter />
        </main>
      </div>

      {toast && (
        <div style={{ ...styles.toast, ...(toast.type === "error" ? styles.toastError : {}) }}>{toast.msg}</div>
      )}
    </div>
  );
}


function BackgroundVideo() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isSubscribed = true;

    const startVideo = async () => {
      try {
        await video.play();
        if (isSubscribed) console.log("✅ Video playing");
      } catch (err) {
        if (isSubscribed && err.name !== "AbortError") {
          console.warn("⏸️ Video autoplay blocked:", err);
          const playOnInteraction = () => {
            video.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        }
      }
    };

    startVideo();

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    
    return () => {
      isSubscribed = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <>
      <div className="gx-video-wrap">
        <video
          ref={videoRef}
          className="gx-video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={(e) => console.error("❌ Video failed to load:", e)}
          onLoadedData={() => console.log("✅ Video loaded successfully")}
        >
  
          <source src={BACKGROUND_VIDEO_URL} type={BACKGROUND_VIDEO_TYPE} />
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
      </div>
      <div className="gx-video-overlay" />
      <button
        className="gx-sound-toggle"
        onClick={toggleSound}
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="gx-footer">
      <div className="gx-footer-brand">
        <span>GXPD © {new Date().getFullYear()} — all rights reserved</span>
      </div>
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="gx-discord-btn"
        aria-label="Discord"
        title="Join our Discord server"
      >
        <DiscordIcon size={17} />
      </a>
    </footer>
  );
}

function DiscordIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.045-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.699.772 1.364 1.225 1.994a.077.077 0 0 0 .084.028 19.84 19.84 0 0 0 6.001-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
  );
}


const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const oauthRedirectUri = () => window.location.origin + window.location.pathname;

function startDiscordLogin() {
  let state = "";
  try {
    state = crypto.randomUUID();
    sessionStorage.setItem("gx_oauth_state", state);
    sessionStorage.removeItem("gx_manual_login");
  } catch { /* storage blocked: the state check fails and the person can retry */ }
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: oauthRedirectUri(),
    response_type: "code",
    scope: "identify",
    state,
  });
  // Members who already approved the app skip Discord's consent screen
  try { if (localStorage.getItem("gx_discord_ok") === "1") params.set("prompt", "none"); } catch { /* ignore */ }
  window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
}

async function readFnError(error) {
  try { return await error.context.json(); } catch { return null; }
}

const GATE_MESSAGES = {
  not_in_server: "You are not a member of the Discord server.",
  no_role: "Your Discord account has no role that gives access to this site.",
  badge_conflict: "Your badge number is already used by another account. Ask an administrator to link your Discord account.",
  bad_code: "Discord sign-in expired or failed. Please try again.",
  state_mismatch: "Sign-in could not be verified. Please try again.",
  denied: "Discord sign-in was cancelled.",
};

// No login form any more: people are sent straight to Discord.
// This screen only shows while we wait for Discord, after a sign-out, or when access is refused.
function DiscordGate({ busy, error, autoStart }) {
  useEffect(() => { if (autoStart) startDiscordLogin(); }, [autoStart]);
  const waiting = busy || autoStart;
  return (
    <div style={styles.loginPage}>
      <style>{FONTS}</style>
      <div style={styles.loginGrid} />
      <div className="gx-glass-card gx-fade-up" style={styles.loginCard}>
        <img src={badgeLogo} alt="GXPD Badge" className="gx-logo-badge" style={{ width: 64, height: 64, objectFit: "contain" }} />
        <div style={styles.loginTitle}>SHERIFF DEPARTMENT</div>
        {waiting ? (
          <div style={styles.loginSub}>Signing you in with Discord...</div>
        ) : (
          <>
            {error && <div style={{ color: "#E0776A", fontSize: 13, margin: "10px 0", textAlign: "center" }}>{error}</div>}
            <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, width: "100%", justifyContent: "center", marginTop: 16, gap: 8 }} onClick={startDiscordLogin}>
              <DiscordIcon size={17} /> Login with Discord
            </button>
          </>
        )}
      </div>
    </div>
  );
}


function OfficerPicker({ selectedIds, onChange, multiple = false, placeholder = "Enter name or badge number..." }) {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    supabase.from("profiles").select("id, name, badge, rank").then(({ data }) => setAll(data || []));
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = all.filter((o) => selectedIds.includes(o.id));
  const results = q.trim() ? all.filter((o) => matchesQuery(o, q) && !selectedIds.includes(o.id)).slice(0, 8) : [];

  const pick = (officer) => {
    if (multiple) onChange([...selectedIds, officer.id]);
    else { onChange([officer.id]); setOpen(false); }
    setQ("");
  };
  const remove = (id) => onChange(selectedIds.filter((x) => x !== id));

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {selected.map((o) => (
            <span key={o.id} style={styles.chip}>
              @[{o.badge}] {o.name}
              <button type="button" onClick={() => remove(o.id)} style={styles.chipX}><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
      {(multiple || selected.length === 0) && (
        <input
          style={styles.input}
          placeholder={placeholder}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      )}
      {open && results.length > 0 && (
        <div style={styles.dropdown}>
          {results.map((o) => (
            <div key={o.id} style={styles.dropdownItem} onClick={() => pick(o)}>
              <span style={{ color: "#D4A72C" }}>[{o.badge}]</span> {o.name} <span style={{ color: "#8A8579", fontSize: 11 }}>· {o.rank}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ profile, openOwnProfile }) {
  const [totalHours, setTotalHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [opsCount, setOpsCount] = useState(0);
  const [dispatchTotalHours, setDispatchTotalHours] = useState(0);
  const canSeeDispatch = canSeeRoom(profile.rank, "dispatch");
  const hourlyRate = getHourlyRate(profile.rank);
  const weekSalary = weekHours * hourlyRate;

  useEffect(() => {
    supabase.from("duty_logs").select("duration_hours, work_date").eq("officer_id", profile.id)
      .then(({ data }) => {
        if (data) {
          setTotalHours(data.reduce((s, r) => s + Number(r.duration_hours), 0));
          setLogsCount(data.length);
          const weekStart = startOfWeek(Date.now());
          setWeekHours(data.filter((r) => new Date(r.work_date) >= weekStart).reduce((s, r) => s + Number(r.duration_hours), 0));
        }
      });
    // Count only (security definer): works even when the Operations room is hidden for this rank
    supabase.rpc("operations_count", { p_officer: profile.id })
      .then(({ data }) => setOpsCount(Number(data) || 0));
    if (canSeeDispatch) {
      supabase.from("dispatch_logs").select("duration_hours").eq("officer_id", profile.id)
        .then(({ data }) => setDispatchTotalHours((data || []).reduce((s, r) => s + Number(r.duration_hours), 0)));
    }
  }, [profile.id, canSeeDispatch]);

  return (
    <div style={styles.content}>
      <div style={styles.greeting}>
        <div style={styles.greetingTitle}>Hello, {profile.name}</div>
        <div style={styles.greetingSub}>{profile.rank} · Badge #{profile.badge}</div>
      </div>
      {!["operations", "wanted", "tests", "vacations"].some((room) => can(profile.rank, room, "create")) && (
        <div style={styles.readOnlyBanner}>
          Your account is currently at the Deputy (read-only) level — you can view everything and log your work hours, but you cannot create operations, wanteds, reports, or leave requests. Your rank follows your Discord role in the server.
        </div>
      )}
      <div style={{ ...styles.statsRow, gridTemplateColumns: `repeat(${canSeeDispatch ? 5 : 4}, 1fr)` }}>
        <StatCard icon={Clock} label="Total Hours" value={fmtHours(totalHours)} accent />
        <StatCard icon={Shield} label="Number of Logs" value={logsCount} />
        <StatCard icon={Radio} label="Number of Operations" value={opsCount} />
        {canSeeDispatch && <StatCard icon={Headphones} label="Total Dispatch Hours" value={fmtHours(dispatchTotalHours)} />}
        <StatCard icon={Award} label="Weekly Salary" value={fmtMoney(weekSalary)} accent />
      </div>
      <div style={{ marginTop: 20 }}>
        <button className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={openOwnProfile}>Open Your Profile <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="gx-glass-card gx-stat-card" style={styles.statCard}>
      <div style={{ ...styles.statIcon, ...(accent ? styles.statIconAccent : {}) }}><Icon size={18} /></div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}


const ACTION_LABELS = {
  rank_change: "Rank Change",
  operation_delete: "Operation Delete",
  account_delete: "Account Delete",
};

const ACTIVITY_PAGE_SIZE = 50;

function Toggle({ on, disabled, onClick, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 42, height: 24, borderRadius: 12, padding: 0, flexShrink: 0, position: "relative",
        border: "1px solid rgba(212,167,44,0.4)",
        background: on ? "rgba(212,167,44,0.55)" : "rgba(255,255,255,0.06)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "background 0.2s ease",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%",
        background: on ? "#F4C744" : "#8A8579", transition: "left 0.2s ease",
      }} />
    </button>
  );
}

// Chef Sheriff only: choose, rank by rank, which rooms are visible and what the rank is allowed to do.
function PermissionsView({ me, showToast, onSaved }) {
  const firstEditable = RANKS.find((r) => !isChief(r));
  const [selected, setSelected] = useState(firstEditable);
  const [draft, setDraft] = useState(() => getPerms(firstEditable));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const locked = isChief(selected);

  const pick = (rank) => {
    if (rank === selected) return;
    if (dirty && !window.confirm("Discard the unsaved changes for this rank?")) return;
    setSelected(rank);
    setDraft(getPerms(rank));
    setDirty(false);
  };

  const toggle = (group, key) => {
    if (locked) return;
    setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: !d[group][key] } }));
    setDirty(true);
  };

  const toggleAction = (room, key) => {
    if (locked) return;
    setDraft((d) => ({ ...d, actions: { ...d.actions, [room]: { ...d.actions[room], [key]: !d.actions[room]?.[key] } } }));
    setDirty(true);
  };

  const resetToDefaults = () => {
    if (locked) return;
    setDraft(defaultPermsFor(selected));
    setDirty(true);
  };

  const save = async () => {
    if (locked || saving) return;
    setSaving(true);
    const row = {
      rank: selected,
      rooms: draft.rooms,
      actions: draft.actions,
      updated_at: new Date().toISOString(),
      updated_by: me.id,
    };
    const { error } = await supabase.from("role_permissions").upsert(row, { onConflict: "rank" });
    setSaving(false);
    if (error) {
      console.error("save permissions error:", error);
      showToast("error", "Could not save the permissions");
      return;
    }
    setRankPerms(selected, { rooms: draft.rooms, actions: draft.actions });
    setDirty(false);
    onSaved && onSaved();
    showToast("success", `Permissions saved for ${selected}`);
  };

  return (
    <div style={styles.content}>
      <div style={styles.filterRow}>
        {RANKS.map((r) => (
          <button
            key={r}
            className="gx-btn gx-filter-btn"
            style={{ ...styles.filterBtn, ...(selected === r ? styles.filterBtnActive : {}) }}
            onClick={() => pick(r)}
          >
            {isChief(r) && <Lock size={11} style={{ marginInlineEnd: 6, verticalAlign: "-1px" }} />}
            {r}
          </button>
        ))}
      </div>

      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.miniName}>{selected}</div>
        <div style={{ color: "#8A8579", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
          {locked
            ? "The Chef Sheriff always has every room and every permission, so this rank cannot be locked out."
            : "These settings control what this rank sees and can do. The server enforces the same switches, so a change here applies everywhere the moment you save."}
        </div>

        <div style={{ ...styles.label, marginTop: 20 }}>Rooms (side menu)</div>
        <div style={styles.rankList}>
          {ROOMS.map((room) => (
            <div key={room.key} style={styles.rankRow}>
              <room.icon size={16} strokeWidth={1.8} color="#B9B3A2" />
              <div style={{ ...styles.miniName, flex: 1 }}>{room.label}</div>
              <Toggle
                on={!!draft.rooms[room.key]}
                disabled={locked}
                label={`${room.label} room for ${selected}`}
                onClick={() => toggle("rooms", room.key)}
              />
            </div>
          ))}
        </div>

        <div style={{ ...styles.label, marginTop: 20 }}>What this rank can do inside each room</div>
        {ACTION_GROUPS.map((g) => (
          <div key={g.room} style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <g.icon size={15} strokeWidth={1.8} color="#D4A72C" />
              <div style={{ ...styles.miniName, color: "#D4A72C" }}>{g.label}</div>
            </div>
            <div style={styles.rankList}>
              {g.actions.map((a) => (
                <div key={a.key} style={styles.rankRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.miniName}>{a.label}</div>
                    {a.hint && <div style={{ color: "#8A8579", fontSize: 11, marginTop: 2 }}>{a.hint}</div>}
                  </div>
                  <Toggle
                    on={!!draft.actions[g.room]?.[a.key]}
                    disabled={locked}
                    label={`${a.label} for ${selected}`}
                    onClick={() => toggleAction(g.room, a.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {!locked && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, ...((!dirty || saving) ? { opacity: 0.55, cursor: "not-allowed" } : {}) }} onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetToDefaults} disabled={saving}>
              Reset to defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function ActivityLogView({ onOpenProfile }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all"); 

  const load = useCallback(async ({ reset = false } = {}) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    const from = reset ? 0 : logs.length;
    const to = from + ACTIVITY_PAGE_SIZE - 1;
    const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).range(from, to);
    setLogs((prev) => (reset ? (data || []) : [...prev, ...(data || [])]));
    setHasMore((data || []).length === ACTIVITY_PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);

  }, [logs.length]);

  useEffect(() => { load({ reset: true }); }, []); 


  useEffect(() => {
    const channel = supabase
      .channel("activity_logs_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs" }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filters = [
    { key: "all", label: "All" },
    { key: "delete", label: "Delete" },
    { key: "rank_change", label: "Rank Change" },
  ];
  const filtered = logs.filter((l) => {
    if (filter === "all") return true;
    if (filter === "delete") return l.action === "operation_delete" || l.action === "account_delete";
    if (filter === "rank_change") return l.action === "rank_change";
    return true;
  });

  return (
    <div style={styles.content}>
      <div style={styles.filterRow}>
        {filters.map((f) => (
          <button key={f.key} className="gx-btn gx-filter-btn" style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="gx-glass-card" style={styles.sectionCard}>
        {loading ? (
          <div style={styles.emptyState}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>No events in this category</div>
        ) : (
          <div style={styles.rankList}>
            {filtered.map((l) => (
              <div key={l.id} style={{ ...styles.rankRow, flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <div style={styles.miniName}>
                  <span
                    style={l.actor_id ? styles.mention : {}}
                    onClick={() => l.actor_id && onOpenProfile && onOpenProfile(l.actor_id)}
                  >
                    {l.actor_name || "Unknown"}
                  </span>
                  {" "}— {ACTION_LABELS[l.action] || l.action}
                  {l.target_name && (
                    <>
                      {": "}
                      <span
                        style={l.target_id ? styles.mention : {}}
                        onClick={() => l.target_id && onOpenProfile && onOpenProfile(l.target_id)}
                      >
                        {l.target_name}
                      </span>
                    </>
                  )}
                </div>
                {l.details && <div style={{ color: "#8A8579", fontSize: 12 }}>{l.details}</div>}
                <div style={{ color: "#5A5648", fontSize: 11 }}>{new Date(l.created_at).toLocaleString("ar-DZ")}</div>
              </div>
            ))}
          </div>
        )}
        {!loading && hasMore && filter === "all" && (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => load({ reset: false })} disabled={loadingMore}>
              {loadingMore ? "..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function OfficersView({ showToast, onOpenProfile }) {
  const [officers, setOfficers] = useState([]);
  const [vacatingIds, setVacatingIds] = useState(new Set());
  const [q, setQ] = useState("");

  const load = useCallback(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setOfficers(data || []));
    const today = todayStr();
    supabase.from("vacation_requests").select("officer_id, start_date, end_date, status").eq("status", "approved")
      .then(({ data }) => {
        const ids = new Set((data || []).filter((v) => v.start_date <= today && today <= v.end_date).map((v) => v.officer_id));
        setVacatingIds(ids);
      });
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = q.trim() ? officers.filter((o) => matchesQuery(o, q)) : officers;

  return (
    <div style={styles.content}>
      <div style={styles.viewHeader}>
        <div style={styles.searchBox}>
          <Search size={15} color="#8A8579" />
          <input style={styles.searchInput} placeholder="Search by name or badge number..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginBottom: 14 }}>
        <div style={{ color: "#8A8579", fontSize: 13 }}>Number of results: {filtered.length} / {officers.length}</div>
      </div>
      <div style={styles.officerGrid}>
        {filtered.map((o) => (
          <div key={o.id} className="gx-glass-card gx-hover-lift" style={styles.officerCard} onClick={() => onOpenProfile(o.id)}>
            {vacatingIds.has(o.id) && <div style={styles.vacationBadge}>🏖️ On Vacation</div>}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Avatar url={o.avatar_url} name={o.name} large /></div>
            <div style={styles.officerName}>{o.name}</div>
            <div style={styles.officerRank}>{o.rank} · BADGE #{o.badge}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#5A5648", marginTop: 14, textAlign: "center" }}>
        Accounts are created automatically the first time an officer signs in with Discord.
      </div>
    </div>
  );
}


function ProfileView({ profileId, me, showToast, onDeleted }) {
  const [officer, setOfficer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [opsCount, setOpsCount] = useState(0);
  const [onVacation, setOnVacation] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [newRank, setNewRank] = useState("");
  const [savingRank, setSavingRank] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [logTab, setLogTab] = useState("duty");
  const [editingLogId, setEditingLogId] = useState(null);
  const isOwn = profileId === me.id;
  const iAmChief = isChief(me.rank);
  const canSeeDispatch = canSeeRoom(me.rank, "dispatch");

  const load = useCallback(() => {
    supabase.from("profiles").select("*").eq("id", profileId).single().then(({ data }) => {
      setOfficer(data);
      if (data) setNewRank(data.rank);
    });
    supabase.from("duty_logs").select("*").eq("officer_id", profileId).order("work_date", { ascending: false })
      .then(({ data }) => setLogs(data || []));
    if (canSeeDispatch) {
      supabase.from("dispatch_logs").select("*").eq("officer_id", profileId).order("work_date", { ascending: false })
        .then(({ data }) => setDispatchLogs(data || []));
    } else {
      setDispatchLogs([]);
    }
    supabase.rpc("operations_count", { p_officer: profileId })
      .then(({ data }) => setOpsCount(Number(data) || 0));
    const today = todayStr();
    supabase.from("vacation_requests").select("start_date, end_date").eq("officer_id", profileId).eq("status", "approved")
      .then(({ data }) => setOnVacation((data || []).some((v) => v.start_date <= today && today <= v.end_date)));
  }, [profileId, canSeeDispatch]);
  useEffect(() => { load(); }, [load]);

  const totalHours = logs.reduce((s, l) => s + Number(l.duration_hours), 0);
  const weekStart = startOfWeek(Date.now());
  const weekHours = logs.filter((l) => new Date(l.work_date) >= weekStart).reduce((s, l) => s + Number(l.duration_hours), 0);
  const dispatchTotalHours = dispatchLogs.reduce((s, l) => s + Number(l.duration_hours), 0);
  const dispatchWeekHours = dispatchLogs.filter((l) => new Date(l.work_date) >= weekStart).reduce((s, l) => s + Number(l.duration_hours), 0);
  const hourlyRate = getHourlyRate(officer?.rank);
  const weekSalary = weekHours * hourlyRate;
  const totalSalary = totalHours * hourlyRate;

  const resetLogForm = () => {
    setWorkDate(new Date().toISOString().slice(0, 10)); setTimeIn(""); setTimeOut(""); setEditingLogId(null);
  };

  const startEditLog = (l) => {
    setEditingLogId(l.id);
    setWorkDate(l.work_date);
    setTimeIn(l.time_in);
    setTimeOut(l.time_out);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addLog = async (e) => {
    e.preventDefault();
    const duration = computeDuration(timeIn, timeOut);
    if (duration === null) { showToast("error", "Invalid time format, e.g., 17 or 17:30"); return; }
    const payload = { work_date: workDate, time_in: timeIn, time_out: timeOut, duration_hours: duration };
    let error;
    if (editingLogId) {
      ({ error } = await supabase.from("duty_logs").update(payload).eq("id", editingLogId));
    } else {
      ({ error } = await supabase.from("duty_logs").insert({ ...payload, officer_id: me.id }));
    }
    if (error) { showToast("error", editingLogId ? "Failed to update log" : "Failed to record time"); return; }
    showToast("success", editingLogId ? "Log updated" : `Time recorded — ${fmtHours(duration)}`);
    resetLogForm(); load();
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    const { error } = await supabase.from("duty_logs").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete"); return; }
    if (editingLogId === id) resetLogForm();
    showToast("success", "Deleted successfully");
    load();
  };

  const saveRank = async () => {
    if (newRank === officer.rank) return;
    setSavingRank(true);
    const { error } = await supabase.from("profiles").update({ rank: newRank }).eq("id", officer.id);
    setSavingRank(false);
    if (error) { showToast("error", "Failed to change rank"); return; }
    showToast("success", "Rank changed successfully");
    load();
  };

  const deleteAccount = async () => {
    if (!window.confirm(`Are you sure you want to delete account ${officer.name} permanently? This action cannot be undone.`)) return;
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.functions.invoke("delete-officer", {
      body: { officerId: officer.id },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setDeleting(false);
    if (error) { showToast("error", "Failed to delete account"); return; }
    showToast("success", "Account deleted successfully");
    if (onDeleted) onDeleted();
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const path = `${me.id}/avatar-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("proofs").upload(path, file);
    if (upErr) { setUploadingAvatar(false); showToast("error", "Failed to upload image"); return; }
    const { data: pub } = supabase.storage.from("proofs").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", me.id);
    setUploadingAvatar(false);
    if (error) { showToast("error", "Failed to save image"); return; }
    showToast("success", "Profile picture updated");
    load();
  };

  if (!officer) return <div style={styles.content}><div style={styles.emptyState}>Loading...</div></div>;

  return (
    <div style={styles.content}>
      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          {isOwn ? (
            <label style={{ position: "relative", cursor: "pointer" }}>
              <Avatar url={officer.avatar_url} name={officer.name} large />
              <div style={styles.avatarEditBadge}>{uploadingAvatar ? "..." : "✎"}</div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => uploadAvatar(e.target.files?.[0])} />
            </label>
          ) : (
            <Avatar url={officer.avatar_url} name={officer.name} large />
          )}
          <div style={{ flex: 1 }}>
            <div style={styles.officerName}>{officer.name}</div>
            <div style={styles.officerRank}>{officer.rank} · شارة #{officer.badge}</div>
          </div>
          {onVacation && <div style={styles.vacationBadge}>🏖️ in vacation</div>}
        </div>
        <div style={{ ...styles.statsRow, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <StatCard icon={Clock} label="Total Hours" value={fmtHours(totalHours)} accent />
          <StatCard icon={Clock} label="This Week" value={fmtHours(weekHours)} />
          <StatCard icon={Shield} label="Number of Shifts" value={logs.length} />
          <StatCard icon={Radio} label="Number of Operations" value={opsCount} />
        </div>
        {canSeeDispatch && (
          <div style={{ ...styles.statsRow, gridTemplateColumns: "repeat(2, 1fr)", marginTop: 14 }}>
            <StatCard icon={Headphones} label="Total Dispatch Hours" value={fmtHours(dispatchTotalHours)} accent />
            <StatCard icon={Clock} label="This Week's Dispatch Hours" value={fmtHours(dispatchWeekHours)} />
          </div>
        )}
        <div style={{ ...styles.statsRow, gridTemplateColumns: "repeat(2, 1fr)", marginTop: 14 }}>
          <StatCard icon={Award} label="Weekly Salary" value={fmtMoney(weekSalary)} accent />
          <StatCard icon={Award} label="Total Salary" value={fmtMoney(totalSalary)} />
        </div>
      </div>

      {iAmChief && !isOwn && (
        <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16, border: "1px solid rgba(212,167,44,0.3)" }}>
          <div style={styles.sectionHeader}>Chief Sheriff Control Panel</div>
          <label style={styles.label}>Edit Rank</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={styles.input} value={newRank} onChange={(e) => setNewRank(e.target.value)}>
              {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={saveRank} disabled={savingRank || newRank === officer.rank}>
              {savingRank ? "..." : "Save"}
            </button>
          </div>
          <button
            className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, marginTop: 14, borderColor: "rgba(194,75,63,0.4)", color: "#E0776A" }}
            onClick={deleteAccount}
            disabled={deleting}
          >
            {deleting ? "..." : "Delete Account Permanently"}
          </button>
        </div>
      )}

      {isOwn && (
        <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
          <div style={styles.sectionHeader}>{editingLogId ? "Edit Log" : "New Time Log"}</div>
          <form onSubmit={addLog} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={styles.label}>Date</label>
              <input style={styles.input} type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
            </div>
            <div>
              <label style={styles.label}>Time In</label>
              <input style={styles.input} placeholder="e.g., 17 or 17:30" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
            </div>
            <div>
              <label style={styles.label}>Time Out</label>
              <input style={styles.input} placeholder="e.g., 19 or 19:15" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, flex: 1, justifyContent: "center" }}>{editingLogId ? "Save Changes" : "Add Log"}</button>
              {editingLogId && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetLogForm}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        {canSeeDispatch ? (
          <>
            <div style={styles.filterRow}>
              <button
                className="gx-btn gx-filter-btn" style={{ ...styles.filterBtn, ...(logTab === "duty" ? styles.filterBtnActive : {}) }}
                onClick={() => setLogTab("duty")}
              >
                Time Logs
              </button>
              <button
                className="gx-btn gx-filter-btn" style={{ ...styles.filterBtn, ...(logTab === "dispatch" ? styles.filterBtnActive : {}) }}
                onClick={() => setLogTab("dispatch")}
              >
                Dispatch Logs · {fmtHours(dispatchTotalHours)}
              </button>
            </div>
            {logTab === "duty" ? (
              <LogRows list={logs} emptyMsg="No logs available yet" onEdit={isOwn ? startEditLog : undefined} onDelete={isOwn ? deleteLog : undefined} />
            ) : (
              <LogRows list={dispatchLogs} emptyMsg="No dispatch logs available yet" />
            )}
          </>
        ) : (
          <>
            <div style={styles.sectionHeader}>Time Logs</div>
            <LogRows list={logs} emptyMsg="No logs available yet" onEdit={isOwn ? startEditLog : undefined} onDelete={isOwn ? deleteLog : undefined} />
          </>
        )}
      </div>
    </div>
  );
}

function LogRows({ list, emptyMsg, onEdit, onDelete }) {
  if (list.length === 0) return <div style={styles.emptyState}>{emptyMsg}</div>;
  return (
    <div style={styles.rankList}>
      {list.map((l) => (
        <div key={l.id} style={styles.rankRow}>
          <div style={{ flex: 1 }}>{l.work_date}</div>
          <div style={{ flex: 1, color: "#8A8579" }}>{l.time_in} → {l.time_out}</div>
          <div style={styles.rankHours}>{fmtHours(Number(l.duration_hours))}</div>
          {(onEdit || onDelete) && (
            <div style={{ display: "flex", gap: 6, marginRight: 8 }}>
              {onEdit && <button style={styles.iconBtnSmall} onClick={() => onEdit(l)}>✎</button>}
              {onDelete && <button style={{ ...styles.iconBtnSmall, color: "#E0776A" }} onClick={() => onDelete(l.id)}>✕</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Uniform room: a 3D gallery of outfit cards, ordered by rank (highest first), with the rank name and the
// outfit code under each card. The cards live in the "uniforms" table; who can add / edit / delete them is
// set per rank in the permissions room (room "uniform").
// image_url is a full link (photos uploaded from the site) or a file name inside public/uniforms/.
// ---------------------------------------------------------------------------
const UNIFORM_COLORS = ["#1d3557", "#5a3a2a", "#3a3a5c", "#4a2f5c", "#2b4a7a", "#1f6b5a", "#6b4a1f", "#7a2f55", "#2f5c4a", "#5c6320", "#6b3a3a", "#2b4a7a"];
const uniformImg = (img) => (!img ? "" : /^https?:\/\//.test(img) ? img : `${import.meta.env.BASE_URL}uniforms/${img}`);

function UniformView({ me, showToast }) {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const galleryRef = useRef(null);
  const formRef = useRef(null);
  const [width, setWidth] = useState(900);
  const drag = useRef({ startX: null, moved: false });
  const lock = useRef(false);
  const dragged = useRef(false);
  const countRef = useRef(0);
  const focusId = useRef(null);
  const firstLoad = useRef(true);

  const n = items.length;
  countRef.current = n;
  const go = useCallback((i) => setCurrent(Math.max(0, Math.min(countRef.current - 1, i))), []);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("uniforms").select("*");
    if (error) { console.error("load uniforms error:", error); return; }
    const sorted = (data || []).slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at) || String(a.id).localeCompare(String(b.id)));
    setItems(sorted);
    if (focusId.current) {
      // a card was just added or edited: bring it to the centre
      const idx = sorted.findIndex((x) => x.id === focusId.current);
      if (idx >= 0) setCurrent(idx);
      focusId.current = null;
    } else if (firstLoad.current) {
      setCurrent(Math.max(0, Math.floor(sorted.length / 2) - 1));
    }
    firstLoad.current = false;
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("uniforms_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "uniforms" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  // If cards were deleted, keep the centre card inside the list
  useEffect(() => { setCurrent((c) => Math.max(0, Math.min(c, n - 1))); }, [n]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (countRef.current < 2) return;
      e.preventDefault();
      if (lock.current) return;
      lock.current = true;
      setTimeout(() => { lock.current = false; }, 700);
      setCurrent((c) => Math.max(0, Math.min(countRef.current - 1, c + ((e.deltaY || e.deltaX) > 0 ? 1 : -1))));
    };
    const onResize = () => setWidth(el.clientWidth);
    onResize();
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    return () => { el.removeEventListener("wheel", onWheel); window.removeEventListener("resize", onResize); };
  }, []);

  const onDown = (e) => {
    dragged.current = false;
    drag.current = { startX: e.clientX, moved: false, onCode: !!e.target.closest(".gx-uni-code") };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (d.startX === null) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 50) { d.moved = true; dragged.current = true; go(current + (dx < 0 ? 1 : -1)); d.startX = e.clientX; }
  };
  // Going to a card is done on release (not on "click"), so it still works while the card is growing under the mouse
  const onUp = () => {
    drag.current = { startX: null, moved: false, onCode: false };
  };

  const copy = (text) => {
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  // --- add / edit / delete -------------------------------------------------
  const preview = useMemo(() => (imgFile ? URL.createObjectURL(imgFile) : null), [imgFile]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const resetForm = () => { setName(""); setCode(""); setImgFile(null); setEditingId(null); };
  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);

  const openAdd = () => { resetForm(); setFormOpen(true); scrollToForm(); };
  const openEdit = (it) => {
    setEditingId(it.id);
    setName(it.name || it.rank || "");
    setCode(it.outfit_code || "");
    setImgFile(null);
    setFormOpen(true);
    scrollToForm();
  };
  const closeForm = () => { resetForm(); setFormOpen(false); };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { showToast("error", "Please write the name of the card"); return; }
    if (!editingId && !imgFile) { showToast("error", "Please choose the uniform image"); return; }
    if (imgFile && imgFile.size > 8 * 1024 * 1024) { showToast("error", "The image is too big (8 MB max)"); return; }
    setBusy(true);
    let image_url;
    if (imgFile) {
      const safeName = imgFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${me.id}/uniform-${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("proofs").upload(path, imgFile);
      if (upErr) { setBusy(false); showToast("error", "Failed to upload image"); return; }
      image_url = supabase.storage.from("proofs").getPublicUrl(path).data.publicUrl;
    }
    const payload = { name: name.trim(), outfit_code: code.trim() || null, ...(image_url ? { image_url } : {}) };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("uniforms").update(payload).eq("id", editingId));
      focusId.current = editingId;
    } else {
      const res = await supabase.from("uniforms").insert({ ...payload, created_by: me.id }).select("id").single();
      error = res.error;
      focusId.current = res.data?.id || null;
    }
    setBusy(false);
    if (error) { focusId.current = null; showToast("error", editingId ? "Failed to update the card" : "Failed to add the card"); return; }
    showToast("success", editingId ? "Card updated" : "Card added");
    closeForm();
    load();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    const { error } = await supabase.from("uniforms").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete the card"); return; }
    showToast("success", "Card deleted");
    load();
  };

  const step = Math.min(250, width * 0.36);
  const cur = items[current];
  const canCreate = can(me.rank, "uniform", "create");
  const canEdit = !!cur && canEditItem(me, "uniform", cur.created_by);
  const canDelete = !!cur && canDeleteItem(me, "uniform", cur.created_by);
  const editingItem = editingId ? items.find((x) => x.id === editingId) : null;
  const formImg = preview || (editingItem ? uniformImg(editingItem.image_url) : "");

  return (
    <div>
      <h2 style={{ textAlign: "center", fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 34, letterSpacing: 4, textTransform: "uppercase", margin: "6px 0 8px", color: "#F4C744", textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>Sheriff Uniform</h2>
      <div style={{ textAlign: "center", opacity: 0.7, fontSize: 13, marginBottom: 4 }}>
        Click any card to bring it to the center. Hover to enlarge it. Click a code to copy it.
      </div>
      <div className="gx-uni" ref={galleryRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { drag.current = { startX: null, moved: false, idx: null, onCode: false }; }}>
        {n === 0 && <div style={{ ...styles.emptyState, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>No uniform cards yet</div>}
        <div className="gx-uni-stage">
          {items.map((it, i) => {
            const o = i - current;
            const a = Math.abs(o);
            return (
              <div
                key={it.id}
                className={`gx-uni-item${a === 0 ? " active" : ""}`}
                style={{
                  transform: `translateX(${o * step}px) translateZ(${-a * 90}px) rotateY(${-o * 16}deg) scale(${a === 0 ? 1.08 : 1})`,
                  zIndex: 50 - a,
                  opacity: a > 3 ? 0 : 1 - a * 0.12,
                  filter: a === 0 ? "none" : `brightness(${1 - a * 0.12})`,
                  pointerEvents: a > 3 ? "none" : "auto",
                }}
                onClick={() => { if (!dragged.current) go(i); }}
                data-uni={i}
              >
                <div className="gx-uni-inner">
                  <div className="gx-uni-card" style={{ "--c": UNIFORM_COLORS[i % UNIFORM_COLORS.length] }}>
                    {it.image_url
                      ? <img src={uniformImg(it.image_url)} alt={it.name || it.rank} draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      : <div className="gx-uni-ph"><i /><b /></div>}
                  </div>
                  <div className="gx-uni-label">
                    <span className="gx-uni-name">{it.name || it.rank}</span>
                    {it.outfit_code && (
                      <span className="gx-uni-code" title="Copy code" onClick={(e) => { e.stopPropagation(); copy(it.outfit_code); }}>
                        {copied && a === 0 ? "Copied ✓" : it.outfit_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="gx-uni-dots">
        {items.map((it, i) => <span key={it.id} className={i === current ? "on" : ""} onClick={() => go(i)} />)}
      </div>

      {(canCreate || canEdit || canDelete) && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
          {canCreate && !formOpen && (
            <button type="button" className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={openAdd}><Plus size={15} /> Add card</button>
          )}
          {canEdit && (
            <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => openEdit(cur)}>✎ Edit {cur.name || cur.rank}</button>
          )}
          {canDelete && (
            <button type="button" className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, color: "#E0776A" }} onClick={() => deleteItem(cur.id)}>✕ Delete</button>
          )}
        </div>
      )}

      {formOpen && (
        <div style={styles.content}>
          <div ref={formRef} className="gx-glass-card" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>{editingId ? "Edit Card" : "Add Card"}</div>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={styles.label}>Name (shown under the card)</label>
                <input style={styles.input} placeholder="Capitan" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Outfit code</label>
                <input style={styles.input} placeholder="s2YMa10BAE" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Uniform image {editingId && "— Leave it blank to keep the current one"}</label>
                <label style={styles.uploadBox}>
                  <Upload size={16} />
                  <span>{imgFile ? imgFile.name : "Click to select an image"}</span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setImgFile(e.target.files?.[0] || null)} />
                </label>
                {formImg && <img src={formImg} alt="preview" style={{ marginTop: 10, height: 150, borderRadius: 10, border: "1px solid rgba(212,167,44,0.3)", objectFit: "cover" }} />}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Add"}</button>
                <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardView({ onOpenProfile }) {
  const [topOverall, setTopOverall] = useState([]);
  const [topWeek, setTopWeek] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: officers } = await supabase.from("profiles").select("*");
      const { data: logs } = await supabase.from("duty_logs").select("officer_id, duration_hours, work_date");

      const totals = {};
      (logs || []).forEach((l) => { totals[l.officer_id] = (totals[l.officer_id] || 0) + Number(l.duration_hours); });
      const overall = (officers || []).map((o) => ({ ...o, hours: totals[o.id] || 0 }))
        .sort((a, b) => b.hours - a.hours).slice(0, 3);
      setTopOverall(overall);

      const weekStart = startOfWeek(Date.now());
      const weekTotals = {};
      (logs || []).forEach((l) => {
        if (new Date(l.work_date) >= weekStart) weekTotals[l.officer_id] = (weekTotals[l.officer_id] || 0) + Number(l.duration_hours);
      });
      const week = (officers || []).map((o) => ({ ...o, hours: weekTotals[o.id] || 0 }))
        .filter((o) => o.hours > 0)
        .sort((a, b) => b.hours - a.hours).slice(0, 3);
      setTopWeek(week);
    })();
  }, []);

  const PodiumRow = ({ list }) => (
    <div style={styles.topThreeRow}>
      {[list[1], list[0], list[2]].map((o, idx) => {
        if (!o) return <div key={idx} style={{ flex: 1 }} />;
        const isFirst = idx === 1;
        return (
          <div key={o.id} className="gx-glass-card gx-hover-lift" style={{ ...styles.podiumCard, ...(isFirst ? styles.podiumCardFirst : {}) }} onClick={() => onOpenProfile && onOpenProfile(o.id)}>
            <Medal size={isFirst ? 26 : 20} color={isFirst ? "#D4A72C" : idx === 0 ? "#C7C2B5" : "#B8834A"} />
            <Avatar url={o.avatar_url} name={o.name} large />
            <div style={styles.officerName}>{o.name}</div>
            <div style={styles.officerRank}>{o.rank}</div>
            <div style={styles.podiumHoursBig}>{fmtHours(o.hours)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={styles.content}>
      <div style={styles.sectionHeader}>Overall Rankings (All Time)</div>
      {topOverall.length === 0 ? (
        <div className="gx-glass-card" style={{ ...styles.sectionCard, marginBottom: 28 }}><div style={styles.emptyState}>No data available</div></div>
      ) : (
        <div style={{ marginBottom: 28 }}><PodiumRow list={topOverall} /></div>
      )}

      <div style={styles.sectionHeader}>Top Sheriff Week</div>
      {topWeek.length === 0 ? (
        <div className="gx-glass-card" style={styles.sectionCard}><div style={styles.emptyState}>No data available for this week yet</div></div>
      ) : (
        <PodiumRow list={topWeek} />
      )}
    </div>
  );
}


function WeeklyTableView({ me, onOpenProfile }) {
  const [byRank, setByRank] = useState({});
  const [weekLabel, setWeekLabel] = useState("");
  const [weekRange, setWeekRange] = useState({ start: "", end: "" });

  useEffect(() => {
    (async () => {
      const { data: officers } = await supabase.from("profiles").select("*");
      const { data: logs } = await supabase.from("duty_logs").select("officer_id, duration_hours, work_date");

      const weekStart = startOfWeek(Date.now());
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
      setWeekLabel(`${weekStart.toISOString().slice(0, 10)} → ${weekEnd.toISOString().slice(0, 10)}`);
      setWeekRange({ start: weekStart.toISOString().slice(0, 10), end: weekEnd.toISOString().slice(0, 10) });

      const weekTotals = {};
      (logs || []).forEach((l) => {
        if (new Date(l.work_date) >= weekStart) weekTotals[l.officer_id] = (weekTotals[l.officer_id] || 0) + Number(l.duration_hours);
      });

      const grouped = {};
      RANKS.forEach((r) => { grouped[r] = []; });
      (officers || []).forEach((o) => {
        if (!grouped[o.rank]) grouped[o.rank] = [];
        grouped[o.rank].push({ ...o, weekHours: weekTotals[o.id] || 0 });
      });
      Object.keys(grouped).forEach((r) => grouped[r].sort((a, b) => a.name.localeCompare(b.name)));
      setByRank(grouped);
    })();
  }, []);


  const GOLD = [212, 167, 44];
  const GOLD_BRIGHT = [244, 199, 68];
  const INK = [26, 19, 0];
  const DARK = [20, 19, 17];
  const CREAM = [245, 241, 230];
  const MUTED = [138, 133, 121];
  const RANK_BG = [247, 238, 214];
  const RANK_TEXT = [107, 84, 23];

  const exportWeeklyPDF = () => {
    let totalHours = 0;
    let rowNum = 0;
    const rows = [];

    RANKS.forEach((rank) => {
      const list = byRank[rank] || [];
      if (list.length === 0) return;

      rows.push([
        { content: rank, colSpan: 5, styles: { fillColor: RANK_BG, textColor: RANK_TEXT, fontStyle: "bold", halign: "left" } },
      ]);

      list.forEach((o) => {
        rowNum += 1;
        totalHours += Number(o.weekHours) || 0;
        rows.push([
          String(rowNum),
          o.badge || "",
          o.name || "",
          rank,
          fmtHours(o.weekHours),
        ]);
      });
    });

    if (rowNum === 0) {
      rows.push([
        { content: "No officers to display", colSpan: 5, styles: { halign: "center", textColor: MUTED } },
      ]);
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();


    doc.setFillColor(...INK);
    doc.rect(0, 0, pageWidth, 64, "F");
    doc.setTextColor(...GOLD_BRIGHT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("WEEKLY SCHEDULE — DUTY HOURS", pageWidth / 2, 30, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...CREAM);
    doc.text(`Week: ${weekRange.start}  →  ${weekRange.end}`, pageWidth / 2, 47, { align: "center" });

    autoTable(doc, {
      startY: 84,
      head: [["#", "Badge", "Name", "Rank", "Hours"]],
      body: rows,
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
        lineColor: [226, 226, 226],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: INK,
        textColor: GOLD_BRIGHT,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        4: { halign: "center", fontStyle: "bold", textColor: [168, 121, 31] },
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
     
   
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = data.settings.margin.left;
        const lineY = pageHeight - 34;

        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.7);
        doc.line(margin, lineY, pageWidth - margin, lineY);

        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text("Automatically generated report", margin, lineY + 14, { align: "left" });
        doc.text(`Page ${data.pageNumber}`, pageWidth - margin, lineY + 14, { align: "right" });
      },
    });

    doc.save(`weekly-schedule-${weekRange.start}-to-${weekRange.end}.pdf`);
  };

  return (
    <div style={styles.content}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ color: "#8A8579", fontSize: 12 }}>
          Current Week (Sunday → Sunday): {weekLabel}
        </div>
        {isChief(me?.rank) && (
          <button
            className="gx-btn gx-btn-ghost"
            style={{ ...styles.btnGhost, padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
            onClick={exportWeeklyPDF}
            title="Export weekly schedule as PDF"
          >
            <Download size={14} /> Export PDF
          </button>
        )}
      </div>
      {RANKS.map((rank) => {
        const list = byRank[rank] || [];
        if (list.length === 0) return null;
        return (
          <div key={rank} style={{ marginBottom: 18 }}>
            <div style={styles.weeklyRankHeader}>{rank}</div>
            <div style={styles.weeklyTable}>
              {list.map((o) => (
                <div key={o.id} className="gx-hover-row" style={styles.weeklyTableRow} onClick={() => onOpenProfile && onOpenProfile(o.id)}>
                  <div style={{ flex: 1 }}>[{o.badge}] {o.name}</div>
                  <div style={{ color: "#D4A72C", fontFamily: "'Oswald', sans-serif" }}>{fmtHours(o.weekHours)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function OperationsView({ me, showToast, onOpenProfile }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");
  const [opDate, setOpDate] = useState(new Date().toISOString().slice(0, 10));
  const [chiefId, setChiefId] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [officersById, setOfficersById] = useState({});
  const [editingId, setEditingId] = useState(null);


  const load = useCallback(() => {
    supabase.from("operations").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
    supabase.from("profiles").select("id, name, badge").then(({ data }) => {
      const map = {};
      (data || []).forEach((o) => { map[o.id] = o; });
      setOfficersById(map);
    });
  }, []);
  useEffect(() => { load(); }, [load]);


  useEffect(() => {
    const channel = supabase
      .channel("operations_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "operations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const resetForm = () => {
    setTitle(""); setResult(""); setChiefId([]); setMemberIds([]); setProofFile(null); setEditingId(null);
    setOpDate(new Date().toISOString().slice(0, 10));
  };

  const startEdit = (op) => {
    setEditingId(op.id);
    setTitle(op.title || "");
    setResult(op.result || "");
    setOpDate(op.op_date || new Date().toISOString().slice(0, 10));
    setChiefId(op.chief_id ? [op.chief_id] : []);
    setMemberIds(op.member_ids || []);
    setProofFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    let proof_url = editingId ? undefined : null;
    if (proofFile) {
      const path = `${me.id}/${Date.now()}-${proofFile.name}`;
      const { error: upErr } = await supabase.storage.from("proofs").upload(path, proofFile);
      if (upErr) { setBusy(false); showToast("error", "Failed to upload proof"); return; }
      const { data: pub } = supabase.storage.from("proofs").getPublicUrl(path);
      proof_url = pub.publicUrl;
    }

    const payload = {
      title, result, op_date: opDate,
      chief_id: chiefId[0] || null,
      member_ids: memberIds,
      ...(proof_url !== undefined ? { proof_url } : {}),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("operations").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("operations").insert({ ...payload, proof_url: proof_url ?? null, created_by: me.id }));
    }
    setBusy(false);
    if (error) { showToast("error", editingId ? "Failed to update operation" : "Failed to add operation"); return; }
    resetForm();
    showToast("success", editingId ? "Operation updated" : "Operation added");
    load();
  };

  const deleteOp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this operation?")) return;
    const { error } = await supabase.from("operations").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete operation"); return; }
    showToast("success", "Operation deleted");
    load();
  };

  return (
    <div style={styles.content}>
      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>{editingId ? "Edit Operation" : "New Operation"}</div>
        {!can(me.rank, "operations", "create") ? (
          <div style={styles.emptyState}>Your account has read-only access, you cannot add operations at the moment.</div>
        ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={styles.label}>Operation Name</label>
            <input style={styles.input} placeholder="Operation : labo" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Result</label>
            <input style={styles.input} placeholder="Result : win gg" value={result} onChange={(e) => setResult(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Date</label>
            <input style={styles.input} type="date" value={opDate} onChange={(e) => setOpDate(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Operation Chief</label>
            <OfficerPicker selectedIds={chiefId} onChange={setChiefId} multiple={false} placeholder="اكتب LA أو رقم الشارة..." />
          </div>
          <div>
            <label style={styles.label}>Members</label>
            <OfficerPicker selectedIds={memberIds} onChange={setMemberIds} multiple={true} placeholder="زيد عضو..." />
          </div>
          <div>
            <label style={styles.label}>Proof Image {editingId && "— Leave it blank to keep the current one"}</label>
            <label style={styles.uploadBox}>
              <Upload size={16} />
              <span>{proofFile ? proofFile.name : "Click to select an image"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Submit"}</button>
            {editingId && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetForm}>Cancel Changes</button>}
          </div>
        </form>
        )}
      </div>

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        <div style={styles.sectionHeader}>List</div>
        {items.length === 0 ? <div style={styles.emptyState}>No operations available</div> : items.map((it) => {
          const chief = officersById[it.chief_id];
          const canEdit = canEditItem(me, "operations", it.created_by);
          const canDelete = canDeleteItem(me, "operations", it.created_by);
          return (
            <div key={it.id} className="gx-glass-card gx-record-card">
              <div className="gx-record-header">
                <div>
                  <span className="gx-record-id">OP-{shortId(it.id)} · {it.op_date}</span>
                  <div className="gx-record-title">{it.title}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {it.result && <span className="gx-tag gx-tag-gold">{it.result}</span>}
                  {(canEdit || canDelete) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {canEdit && <button style={styles.iconBtnSmall} onClick={() => startEdit(it)} aria-label="Edit operation" title="Edit">✎</button>}
                      {canDelete && <button style={{ ...styles.iconBtnSmall, color: "#E0776A" }} onClick={() => deleteOp(it.id)} aria-label="Delete operation" title="Delete">✕</button>}
                    </div>
                  )}
                </div>
              </div>
              <div className="gx-record-grid">
                {chief && (
                  <div>
                    <div className="gx-record-field-label">Operation Chief</div>
                    <div className="gx-record-field-value"><span style={styles.mention} onClick={() => onOpenProfile(chief.id)}>@[{chief.badge}] {chief.name}</span></div>
                  </div>
                )}
                {it.member_ids?.length > 0 && (
                  <div>
                    <div className="gx-record-field-label">Members</div>
                    <div className="gx-record-field-value" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {it.member_ids.map((mid) => officersById[mid] && (
                        <span key={mid} style={styles.mention} onClick={() => onOpenProfile(mid)}>@[{officersById[mid].badge}] {officersById[mid].name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {it.proof_url && (
                <img src={it.proof_url} alt="proof" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 10, border: "1px solid rgba(212,167,44,0.15)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function WantedView({ me, showToast, onOpenProfile }) {
  const [items, setItems] = useState([]);
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("male");
  const [nationality, setNationality] = useState("DZ");
  const [reason, setReason] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    supabase.from("wanted_persons").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
  }, []);
  useEffect(() => { load(); }, [load]);


  useEffect(() => {
    const channel = supabase
      .channel("wanted_persons_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "wanted_persons" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const resetForm = () => {
    setFullName(""); setBirthday(""); setGender("male"); setNationality("DZ"); setReason(""); setPhotoFile(null); setEditingId(null);
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setFullName(it.full_name || "");
    setBirthday(it.birthday || "");
    setGender(it.gender || "male");
    setNationality(it.nationality || "DZ");
    setReason(it.description || "");
    setPhotoFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setBusy(true);
    let photo_url = editingId ? undefined : null;
    if (photoFile) {
      const path = `${me.id}/wanted-${Date.now()}-${photoFile.name}`;
      const { error: upErr } = await supabase.storage.from("proofs").upload(path, photoFile);
      if (upErr) { setBusy(false); showToast("error", "Failed to upload image"); return; }
      const { data: pub } = supabase.storage.from("proofs").getPublicUrl(path);
      photo_url = pub.publicUrl;
    }
    const payload = {
      full_name: fullName, birthday: birthday || null, gender, nationality, description: reason,
      ...(photo_url !== undefined ? { photo_url } : {}),
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("wanted_persons").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("wanted_persons").insert({ ...payload, photo_url: photo_url ?? null, created_by: me.id }));
    }
    setBusy(false);
    if (error) { showToast("error", editingId ? "Failed to update wanted person" : "Failed to add wanted person"); return; }
    resetForm();
    showToast("success", editingId ? "Wanted person updated" : "Wanted person added");
    load();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this wanted person?")) return;
    const { error } = await supabase.from("wanted_persons").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete wanted person"); return; }
    showToast("success", "Wanted person deleted");
    load();
  };

  return (
    <div style={styles.content}>
      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>{editingId ? "Edit Wanted Person" : "Add Wanted Person"}</div>
        {!can(me.rank, "wanted", "create") ? (
          <div style={styles.emptyState}>Only Master Deputy and above can add wanted persons. You can view the list.</div>
        ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={styles.label}>Full name</label>
            <input style={styles.input} placeholder="haroun" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={styles.label}>Birthday</label>
              <input style={styles.input} type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </div>
            <div>
              <label style={styles.label}>Gender</label>
              <select style={styles.input} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </div>
          </div>
          <div>
            <label style={styles.label}>Nationality</label>
            <input style={styles.input} placeholder="DZ" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Reason</label>
            <input style={styles.input} placeholder="ROB COD -6" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Wanted Person Image {editingId && "— Leave it blank to keep the current one"}</label>
            <label style={styles.uploadBox}>
              <Upload size={16} />
              <span>{photoFile ? photoFile.name : "Click to select an image"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Submit"}</button>
            {editingId && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetForm}>Cancel Changes</button>}
          </div>
        </form>
        )}
      </div>

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        <div style={styles.sectionHeader}>List</div>
        {items.length === 0 ? <div style={styles.emptyState}>No wanted persons found</div> : items.map((it) => {
          const canEdit = canEditItem(me, "wanted", it.created_by);
          const canDelete = canDeleteItem(me, "wanted", it.created_by);
          return (
            <div key={it.id} className="gx-glass-card gx-record-card gx-record-danger">
              <div className="gx-record-header">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {it.photo_url && <img src={it.photo_url} alt={it.full_name} className="gx-mugshot" />}
                  <div>
                    <span className="gx-record-id">WANTED · REF #{shortId(it.id)}</span>
                    <div className="gx-record-title">{it.full_name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="gx-tag gx-tag-danger">{it.status || "wanted"}</span>
                  {(canEdit || canDelete) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {canEdit && <button style={styles.iconBtnSmall} onClick={() => startEdit(it)} aria-label="Edit wanted person" title="Edit">✎</button>}
                      {canDelete && <button style={{ ...styles.iconBtnSmall, color: "#E0776A" }} onClick={() => deleteItem(it.id)} aria-label="Delete wanted person" title="Delete">✕</button>}
                    </div>
                  )}
                </div>
              </div>
              <div className="gx-record-grid">
                {it.birthday && (
                  <div>
                    <div className="gx-record-field-label">Birthday</div>
                    <div className="gx-record-field-value">{it.birthday}</div>
                  </div>
                )}
                {it.gender && (
                  <div>
                    <div className="gx-record-field-label">Gender</div>
                    <div className="gx-record-field-value">{it.gender}</div>
                  </div>
                )}
                {it.nationality && (
                  <div>
                    <div className="gx-record-field-label">Nationality</div>
                    <div className="gx-record-field-value">{it.nationality}</div>
                  </div>
                )}
              </div>
              {it.description && (
                <div style={{ marginTop: 6 }}>
                  <div className="gx-record-field-label">Reason</div>
                  <div className="gx-record-field-value">{it.description}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function TestsView({ me, showToast, onOpenProfile }) {
  const [items, setItems] = useState([]);
  const [officerId, setOfficerId] = useState([]);
  const [testedById, setTestedById] = useState([]);
  const [score, setScore] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [officersById, setOfficersById] = useState({});
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    supabase.from("officer_tests").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
    supabase.from("profiles").select("id, name, badge").then(({ data }) => {
      const map = {};
      (data || []).forEach((o) => { map[o.id] = o; });
      setOfficersById(map);
    });
  }, []);
  useEffect(() => { load(); }, [load]);


  useEffect(() => {
    const channel = supabase
      .channel("officer_tests_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "officer_tests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const resetForm = () => {
    setOfficerId([]); setTestedById([]); setScore(""); setProofFile(null); setEditingId(null);
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setOfficerId(it.officer_id ? [it.officer_id] : []);
    setTestedById(it.tested_by ? [it.tested_by] : []);
    setScore(String(it.score));
    setProofFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const scoreNum = Number(score);
    if (!officerId[0] || !testedById[0] || Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      showToast("error", "Please fill all fields, and the score must be between 0 and 10");
      return;
    }
    setBusy(true);
    let proof_url = editingId ? undefined : null;
    if (proofFile) {
      const path = `${me.id}/test-${Date.now()}-${proofFile.name}`;
      const { error: upErr } = await supabase.storage.from("proofs").upload(path, proofFile);
      if (upErr) { setBusy(false); showToast("error", "Failed to upload image"); return; }
      const { data: pub } = supabase.storage.from("proofs").getPublicUrl(path);
      proof_url = pub.publicUrl;
    }
    const payload = {
      officer_id: officerId[0], tested_by: testedById[0], score: scoreNum,
      ...(proof_url !== undefined ? { proof_url } : {}),
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("officer_tests").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("officer_tests").insert({ ...payload, proof_url: proof_url ?? null, created_by: me.id }));
    }
    setBusy(false);
    if (error) { showToast("error", editingId ? "Failed to update test" : "Failed to add test"); return; }
    resetForm();
    showToast("success", editingId ? "Test updated" : "Test added");
    load();
  };

  const deleteTest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    const { error } = await supabase.from("officer_tests").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete test"); return; }
    showToast("success", "Test deleted");
    load();
  };

  return (
    <div style={styles.content}>
      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>{editingId ? "Edit Test" : "New Test"}</div>
        {!can(me.rank, "tests", "create") ? (
          <div style={styles.emptyState}>Only Master Deputies and above can add tests. You can view the list.</div>
        ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={styles.label}>name (officer's name)</label>
            <OfficerPicker selectedIds={officerId} onChange={setOfficerId} multiple={false} placeholder="name or badge number..." />
          </div>
          <div>
            <label style={styles.label}>tested by</label>
            <OfficerPicker selectedIds={testedById} onChange={setTestedById} multiple={false} placeholder="officer who conducted the test..." />
          </div>
          <div>
            <label style={styles.label}>note (/10)</label>
            <input style={styles.input} type="number" min="0" max="10" step="0.5" placeholder="e.g., 10" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>proof image</label>
            <label style={styles.uploadBox}>
              <Upload size={16} />
              <span>{proofFile ? proofFile.name : "click to select an image"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Submit"}</button>
            {editingId && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>
        )}
      </div>

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        <div style={styles.sectionHeader}>TEST MDT</div>
        {items.length === 0 ? <div style={styles.emptyState}>No tests available</div> : items.map((it) => {
          const officer = officersById[it.officer_id];
          const tester = officersById[it.tested_by];
          const canEdit = canEditItem(me, "tests", it.created_by);
          const canDelete = canDeleteItem(me, "tests", it.created_by);
          return (
            <div key={it.id} className={`gx-glass-card gx-record-card ${Number(it.score) >= 5 ? "gx-record-success" : "gx-record-danger"}`}>
              <div className="gx-record-header">
                <div>
                  <span className="gx-record-id">TEST · REF #{shortId(it.id)}</span>
                  <div className="gx-record-title">
                    {officer ? <span style={styles.mention} onClick={() => onOpenProfile(officer.id)}>@[{officer.badge}] {officer.name}</span> : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`gx-tag ${Number(it.score) >= 5 ? "gx-tag-success" : "gx-tag-danger"}`}>{Number(it.score) >= 5 ? "Pass" : "Fail"}</span>
                  {(canEdit || canDelete) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {canEdit && <button style={styles.iconBtnSmall} onClick={() => startEdit(it)} aria-label="Edit test" title="Edit">✎</button>}
                      {canDelete && <button style={{ ...styles.iconBtnSmall, color: "#E0776A" }} onClick={() => deleteTest(it.id)} aria-label="Delete test" title="Delete">✕</button>}
                    </div>
                  )}
                </div>
              </div>
              <div className="gx-record-grid">
                <div>
                  <div className="gx-record-field-label">Score</div>
                  <div className="gx-record-field-value" style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600, color: Number(it.score) >= 5 ? "#7FD9A6" : "#E0776A" }}>{it.score}/10</div>
                </div>
                {tester && (
                  <div>
                    <div className="gx-record-field-label">Tested By</div>
                    <div className="gx-record-field-value"><span style={styles.mention} onClick={() => onOpenProfile(tester.id)}>@[{tester.badge}] {tester.name}</span></div>
                  </div>
                )}
              </div>
              {it.proof_url && (
                <img src={it.proof_url} alt="proof" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 10, border: "1px solid rgba(212,167,44,0.15)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function VacationsView({ me, management, showToast }) {
  const [items, setItems] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    supabase.from("vacation_requests").select("*, profiles!vacation_requests_officer_id_fkey(name, rank)").order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!start || !end) return;
    const { data, error } = await supabase
      .from("vacation_requests")
      .insert({ officer_id: me.id, start_date: start, end_date: end, reason })
      .select("*, profiles!vacation_requests_officer_id_fkey(name, rank)");
    if (error) {
      console.error("vacation_requests insert error:", error);
      showToast("error", error.message || "Failed to submit request");
      return;
    }
    if (!data || data.length === 0) {
      // Insert reported no error but returned no row — almost always a missing/incorrect
      // Row Level Security SELECT policy on vacation_requests blocking the return.
      showToast("error", "Request may not have saved — check permissions");
      return;
    }
    setStart(""); setEnd(""); setReason("");
    showToast("success", "Vacation request submitted");
    load();
  };

  const setStatus = async (id, status) => {
    const { data, error } = await supabase
      .from("vacation_requests")
      .update({ status, reviewed_by: me.id })
      .eq("id", id)
      .select();
    if (error) {
      console.error("vacation_requests update error:", error);
      showToast("error", error.message || "Failed to update status");
      return;
    }
    if (!data || data.length === 0) {
      showToast("error", "Update may not have saved — check permissions");
      return;
    }
    showToast("success", `Request ${status}`);
    load();
  };

  return (
    <div style={styles.content}>
      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>New Vacation Request</div>
        {!can(me.rank, "vacations", "create") ? (
          <div style={styles.emptyState}>Your account has read-only access, you cannot submit a vacation request at this time.</div>
        ) : (
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={styles.label}>From</label><input style={styles.input} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><label style={styles.label}>To</label><input style={styles.input} type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Reason</label>
            <textarea style={{ ...styles.input, minHeight: 60 }} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, gridColumn: "1 / -1", justifyContent: "center" }}>Submit Request</button>
        </form>
        )}
      </div>

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        <div style={styles.sectionHeader}>{management ? "All Requests" : "My Requests"}</div>
        {items.length === 0 ? <div style={styles.emptyState}>No requests available</div> : items.map((it) => (
          <div key={it.id} style={{ ...styles.rankRow, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <div style={styles.miniName}>{it.profiles?.name || ""} — {it.start_date} → {it.end_date}</div>
            <div style={{ color: "#8A8579", fontSize: 12 }}>{it.reason}</div>
            <div style={{ fontSize: 11, color: it.status === "approved" ? "#4C8B5C" : it.status === "rejected" ? "#E0776A" : "#D4A72C" }}>{it.status}</div>
            {management && it.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={() => setStatus(it.id, "approved")}>Accept</button>
                <button className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => setStatus(it.id, "rejected")}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Avatar({ url, name, size = 34, large = false }) {
  const s = large ? 48 : size;
  if (url) {
    return <img src={url} alt={name} style={{ width: s, height: s, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ ...styles.avatar, width: s, height: s, fontSize: large ? 18 : 14 }}>
      {name?.[0] || "?"}
    </div>
  );
}

function DispatchView({ me, showToast, onOpenProfile }) {
  const [myLogs, setMyLogs] = useState([]);
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    supabase.from("dispatch_logs").select("*").eq("officer_id", me.id).order("work_date", { ascending: false })
      .then(({ data }) => setMyLogs(data || []));
  }, [me.id]);
  useEffect(() => { load(); }, [load]);


  useEffect(() => {
    const channel = supabase
      .channel(`dispatch_logs_realtime_${me.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dispatch_logs", filter: `officer_id=eq.${me.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, me.id]);

  const totalHours = myLogs.reduce((s, l) => s + Number(l.duration_hours), 0);
  const weekStart = startOfWeek(Date.now());
  const weekHours = myLogs.filter((l) => new Date(l.work_date) >= weekStart).reduce((s, l) => s + Number(l.duration_hours), 0);

  const resetForm = () => {
    setWorkDate(new Date().toISOString().slice(0, 10)); setTimeIn(""); setTimeOut(""); setEditingId(null);
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setWorkDate(it.work_date);
    setTimeIn(it.time_in);
    setTimeOut(it.time_out);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const duration = computeDuration(timeIn, timeOut);
    if (duration === null) { showToast("error", "Invalid time format, e.g., 17 or 17:30"); return; }
    setBusy(true);
    const payload = { work_date: workDate, time_in: timeIn, time_out: timeOut, duration_hours: duration };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("dispatch_logs").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("dispatch_logs").insert({ ...payload, officer_id: me.id }));
    }
    setBusy(false);
    if (error) { showToast("error", editingId ? "Failed to update log" : "Failed to submit log"); return; }
    resetForm();
    showToast("success", editingId ? "Log updated successfully" : `Log submitted — ${fmtHours(duration)}`);
    load();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    const { error } = await supabase.from("dispatch_logs").delete().eq("id", id);
    if (error) { showToast("error", "Failed to delete log"); return; }
    showToast("success", "Log deleted successfully");
    load();
  };

  return (
    <div style={styles.content}>
      <div style={styles.statsRow}>
        <StatCard icon={Headphones} label="Total Dispatch Hours" value={fmtHours(totalHours)} accent />
        <StatCard icon={Clock} label="This Week's Dispatch Hours" value={fmtHours(weekHours)} />
      </div>

      <div className="gx-glass-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>{editingId ? "Edit Log" : "Submit Dispatch Time"}</div>
        {!can(me.rank, "dispatch", "create") ? (
          <div style={styles.emptyState}>You are not authorized to submit dispatch logs.</div>
        ) : (
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={styles.label}>Date</label>
            <input style={styles.input} type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>On (Time In)</label>
            <input style={styles.input} placeholder="e.g., 19:10" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Off (Time Out)</label>
            <input style={styles.input} placeholder="e.g., 20:00" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, flex: 1, justifyContent: "center" }} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Submit Log"}</button>
            {editingId && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        )}
      </div>

      <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
        <div style={styles.sectionHeader}>Logs</div>
        {myLogs.length === 0 ? (
          <div style={styles.emptyState}>No logs available.</div>
        ) : (
          <div style={styles.rankList}>
            {myLogs.map((it) => (
              <div key={it.id} style={styles.rankRow}>
                <div style={{ flex: 1 }}>{it.work_date}</div>
                <div style={{ flex: 1, color: "#8A8579" }}>{it.time_in} → {it.time_out}</div>
                <div style={styles.rankHours}>{fmtHours(Number(it.duration_hours))}</div>
                {(can(me.rank, "dispatch", "edit_own") || can(me.rank, "dispatch", "delete_own")) && (
                  <div style={{ display: "flex", gap: 6, marginRight: 8 }}>
                    {can(me.rank, "dispatch", "edit_own") && <button style={styles.iconBtnSmall} onClick={() => startEdit(it)}>✎</button>}
                    {can(me.rank, "dispatch", "delete_own") && <button style={{ ...styles.iconBtnSmall, color: "#E0776A" }} onClick={() => deleteItem(it.id)}>✕</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#050506", fontFamily: "'Inter', sans-serif", color: "#F5F1E6", direction: "rtl", position: "relative", zIndex: 0 },
  shell: { display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 },
  sidebar: { width: 240, background: "rgba(14,13,11,0.42)", borderLeft: "1px solid rgba(212,167,44,0.22)", display: "flex", flexDirection: "column", padding: "24px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0, zIndex: 20 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 15 },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, paddingRight: 4 },
  brandTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 16, letterSpacing: 2, color: "#F5F1E6", fontWeight: 600 },
  brandSub: { fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "#D4A72C" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "transparent", border: "none", color: "#B9B3A2", fontSize: 14, cursor: "pointer", textAlign: "right", fontFamily: "'Inter', sans-serif" },
  navItemActive: { background: "rgba(212,167,44,0.14)", color: "#F4C744" },
  sidebarFooter: { display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(212,167,44,0.16)", paddingTop: 16 },
  miniProfile: { display: "flex", alignItems: "center", gap: 10, flex: 1, overflow: "hidden", background: "none", border: "none", cursor: "pointer", padding: 0 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "rgba(212,167,44,0.18)", color: "#D4A72C", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald', sans-serif", fontSize: 14, flexShrink: 0 },
  avatarLg: { width: 48, height: 48, borderRadius: "50%", background: "rgba(212,167,44,0.18)", color: "#D4A72C", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald', sans-serif", fontSize: 18 },
  miniName: { fontSize: 13, fontWeight: 500, color: "#F5F1E6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  miniRank: { fontSize: 11, color: "#8A8579" },
  logoutBtn: { background: "transparent", border: "1px solid rgba(212,167,44,0.2)", borderRadius: 8, padding: 8, color: "#B9B3A2", cursor: "pointer" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", gap: 16, padding: "18px 28px", borderBottom: "1px solid rgba(212,167,44,0.16)", position: "sticky", top: 0, background: "rgba(8,8,9,0.38)", zIndex: 10 },
  hamburger: { display: "none", background: "none", border: "none", color: "#F5F1E6", fontSize: 20, cursor: "pointer" },
  pageTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 500 },
  content: { padding: "24px 28px 60px", maxWidth: 1000, width: "100%", margin: "0 auto" },
  greeting: { marginBottom: 24 },
  greetingTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 500, color: "#F5F1E6" },
  greetingSub: { fontSize: 14, color: "#8A8579", marginTop: 4 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 },
  statCard: { background: "rgba(20,19,17,0.4)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1px solid rgba(212,167,44,0.16)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 },
  statIcon: { width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8579", flexShrink: 0 },
  statIconAccent: { background: "rgba(212,167,44,0.16)", color: "#D4A72C" },
  statValue: { fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 500, color: "#F5F1E6", lineHeight: 1.1 },
  statLabel: { fontSize: 12, color: "#8A8579", marginTop: 2 },
  sectionCard: { background: "rgba(20,19,17,0.4)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1px solid rgba(212,167,44,0.16)", borderRadius: 12, padding: 18 },
  sectionHeader: { fontSize: 14, fontWeight: 500, color: "#F5F1E6", marginBottom: 14 },
  emptyState: { fontSize: 13, color: "#8A8579", textAlign: "center", padding: "20px 0" },
  viewHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "rgba(20,19,17,0.4)", backdropFilter: "blur(10px)", border: "1px solid rgba(212,167,44,0.2)", borderRadius: 9, padding: "9px 14px", flex: 1, minWidth: 200 },
  searchInput: { background: "none", border: "none", outline: "none", color: "#F5F1E6", fontSize: 13, width: "100%", fontFamily: "'Inter', sans-serif" },
  btnGold: { display: "flex", alignItems: "center", gap: 6, background: "#D4A72C", color: "#1A1300", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", justifyContent: "center" },
  btnGhost: { background: "rgba(255,255,255,0.02)", color: "#B9B3A2", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  officerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  officerCard: { background: "rgba(20,19,17,0.4)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1px solid rgba(212,167,44,0.16)", borderRadius: 12, padding: 18, cursor: "pointer", textAlign: "center" },
  officerName: { fontSize: 15, fontWeight: 500, color: "#F5F1E6", marginTop: 8 },
  officerRank: { fontSize: 12, color: "#8A8579", marginTop: 2 },
  rankList: { display: "flex", flexDirection: "column", gap: 4 },
  rankRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  rankNum: { width: 20, textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#8A8579" },
  rankBarWrap: { flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", maxWidth: 160 },
  rankBar: { height: "100%", background: "linear-gradient(90deg, #D4A72C, #F4C744)", borderRadius: 3, transition: "width 0.6s ease" },
  rankHours: { fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#F5F1E6", minWidth: 50, textAlign: "left" },
  label: { display: "block", fontSize: 12, color: "#8A8579", marginBottom: 6, marginTop: 12 },
  input: { width: "100%", background: "rgba(5,5,6,0.5)", border: "1px solid rgba(212,167,44,0.2)", borderRadius: 8, padding: "10px 12px", color: "#F5F1E6", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease, box-shadow 0.2s ease" },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(20,19,17,0.85)", backdropFilter: "blur(14px)", border: "1px solid rgba(76,139,92,0.4)", color: "#F5F1E6", padding: "12px 20px", borderRadius: 10, fontSize: 13, zIndex: 60, animation: "gxFadeUp 0.3s ease" },
  toastError: { border: "1px solid rgba(194,75,63,0.4)" },
  loginPage: { minHeight: "100vh", background: "#050506", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden", direction: "rtl", padding: 16 },
  loginGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(212,167,44,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,167,44,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" },
  loginCard: { position: "relative", background: "rgba(17,17,16,0.5)", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(212,167,44,0.26)", borderRadius: 16, padding: "36px 32px", width: 380, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
  loginTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: 3, marginTop: 16, color: "#F5F1E6" },
  loginSub: { fontSize: 13, color: "#8A8579", marginTop: 6, marginBottom: 24, textAlign: "center" },
  chip: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,167,44,0.14)", color: "#F4C744", borderRadius: 20, padding: "5px 10px", fontSize: 12 },
  chipX: { background: "none", border: "none", color: "#F4C744", cursor: "pointer", padding: 0, display: "flex" },
  dropdown: { position: "absolute", top: "100%", right: 0, left: 0, background: "rgba(27,26,23,0.9)", backdropFilter: "blur(14px)", border: "1px solid rgba(212,167,44,0.24)", borderRadius: 8, marginTop: 4, zIndex: 30, maxHeight: 220, overflowY: "auto" },
  dropdownItem: { padding: "9px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" },
  uploadBox: { display: "flex", alignItems: "center", gap: 8, border: "1px dashed rgba(212,167,44,0.35)", borderRadius: 8, padding: "12px", cursor: "pointer", color: "#B9B3A2", fontSize: 13, transition: "border-color 0.2s ease, background 0.2s ease" },
  opCard: { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 10 },
  mention: { color: "#8AB4F8", cursor: "pointer", marginLeft: 4 },
  vacationBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(212,167,44,0.16)", color: "#F4C744", fontSize: 11, padding: "4px 10px", borderRadius: 20, marginBottom: 8 },
  iconBtnSmall: { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, width: 26, height: 26, color: "#B9B3A2", cursor: "pointer", fontSize: 13, transition: "background 0.2s ease, color 0.2s ease" },
  weeklyRankHeader: { background: "rgba(17,17,16,0.5)", backdropFilter: "blur(10px)", color: "#F5F1E6", fontFamily: "'Oswald', sans-serif", fontSize: 14, padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "1px solid rgba(212,167,44,0.2)", borderBottom: "none" },
  weeklyTable: { border: "1px solid rgba(212,167,44,0.16)", borderRadius: "0 0 8px 8px", overflow: "hidden" },
  weeklyTableRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", fontSize: 13, background: "rgba(20,19,17,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" },
  readOnlyBanner: { background: "rgba(212,167,44,0.12)", border: "1px solid rgba(212,167,44,0.3)", color: "#F4C744", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 20 },
  avatarEditBadge: { position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: "#D4A72C", color: "#1A1300", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid rgba(20,19,17,0.8)" },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filterBtn: { background: "rgba(20,19,17,0.4)", border: "1px solid rgba(212,167,44,0.16)", color: "#B9B3A2", borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  filterBtnActive: { background: "rgba(212,167,44,0.18)", color: "#F4C744", borderColor: "rgba(212,167,44,0.45)" },
  topThreeRow: { display: "flex", alignItems: "flex-end", gap: 14 },
  podiumCard: {
    flex: 1, background: "rgba(20,19,17,0.4)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1px solid rgba(212,167,44,0.16)", borderRadius: 12,
    padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer",
  },
  podiumCardFirst: { border: "1px solid rgba(212,167,44,0.45)", paddingTop: 28, background: "rgba(23,20,16,0.5)" },
  podiumHoursBig: { fontFamily: "'Oswald', sans-serif", fontSize: 20, color: "#D4A72C" },
};
