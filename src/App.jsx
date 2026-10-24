import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  Shield, Star, Clock, Users, Trophy, LogOut, Plus, Search, ChevronRight,
  Medal, X, Radio, Lock, Bell, Plane, ArrowRight, Upload, Image as ImageIcon, Award, ScrollText, Headphones, Download, Shirt,
  Scale, Gavel, Receipt, RadioTower, Siren, ShieldAlert, BookOpen, Fingerprint, Unlock, Sparkles, Eye, FileText, Play, Square,
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
@keyframes gxDmPulse {
  0% { box-shadow: 0 0 0 0 rgba(59,160,255,0.6); }
  70% { box-shadow: 0 0 0 9px rgba(59,160,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(59,160,255,0); }
}
.gx-dm-led { animation: gxDmPulse 1.6s ease-out infinite; }
.gx-dm-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 26px; align-items: start; }
@media (max-width: 760px) { .gx-dm-grid { grid-template-columns: 1fr; } }

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
.gx-uni-item.lifted .gx-uni-inner { transform: translateY(-22px) scale(1.12); }
.gx-uni-item.lifted .gx-uni-card { border-color: #fff; box-shadow: 0 0 0 2px var(--gx-gold-bright), 0 0 56px rgba(244,199,68,0.7), 0 30px 50px rgba(0,0,0,0.65); }
.gx-uni.moving .gx-uni-item:not(.lifted) { cursor: copy; }
.gx-uni-moving { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 10px auto 0; max-width: 760px;
  padding: 10px 16px; border-radius: 10px; font-size: 13px; color: #F4C744; background: rgba(212,167,44,0.12); border: 1px solid rgba(212,167,44,0.45); }
.gx-uni-dots { display: flex; justify-content: center; gap: 8px; margin-top: 8px; }
.gx-uni-dots span { width: 8px; height: 8px; border-radius: 50%; background: #444; cursor: pointer; transition: .3s; }
.gx-uni-dots span.on { background: var(--gx-gold); width: 24px; border-radius: 6px; }
@media (max-width: 640px) {
  .gx-uni { height: 590px; }
  .gx-uni-item { width: 210px; margin-left: -105px; }
  .gx-uni-card { height: 310px; }
}

/* ---- Rules room: sealed chapters that open on click ---- */
@keyframes gxRlIn { from { opacity: 0; transform: translateY(12px); filter: blur(5px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes gxRlShine { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
@keyframes gxRlSweep { from { transform: translateX(-130%) skewX(-18deg); } to { transform: translateX(380%) skewX(-18deg); } }
@keyframes gxRlPeek { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.9; } }

.gx-rl { padding: 24px 28px 70px; max-width: 1120px; width: 100%; margin: 0 auto; direction: ltr; text-align: left; }
.gx-rl-hero { text-align: center; margin: 8px 0 34px; }
.gx-rl-kicker { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
  color: #F4C744; border: 1px solid rgba(212,167,44,0.35); background: rgba(212,167,44,0.08); padding: 6px 14px; border-radius: 999px; }
.gx-rl-h1 { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: clamp(38px, 7vw, 68px); letter-spacing: 10px; text-transform: uppercase;
  margin: 16px 0 8px; line-height: 1; padding-left: 10px;
  background: linear-gradient(100deg, #8a6a12 0%, #F4C744 25%, #fff3c4 50%, #F4C744 75%, #8a6a12 100%); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: gxRlShine 6s linear infinite; }
.gx-rl-lede { color: #B9B3A2; font-size: 14px; max-width: 520px; margin: 0 auto; line-height: 1.6; }
.gx-rl-add { margin-top: 20px; display: flex; justify-content: center; }
.gx-rl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.gx-rl-card { --ac: #F4C744; position: relative; border-radius: 24px; overflow: hidden; scroll-margin-top: 90px;
  background: linear-gradient(150deg, rgba(30,28,24,0.78), rgba(10,10,10,0.68));
  backdrop-filter: blur(18px) saturate(150%); -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 18px 40px -22px rgba(0,0,0,0.8);
  transition: transform .35s cubic-bezier(.22,.8,.25,1), border-color .35s, box-shadow .35s; animation: gxFadeUp .5s ease both; }
.gx-rl-card::before { content: ""; position: absolute; inset: -1px; pointer-events: none; opacity: .55; transition: opacity .4s;
  background: radial-gradient(420px 220px at 100% 0%, color-mix(in srgb, var(--ac) 30%, transparent), transparent 70%); }
.gx-rl-card::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 28%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent); transform: translateX(-130%) skewX(-18deg); }
.gx-rl-card:hover { transform: translateY(-6px); border-color: color-mix(in srgb, var(--ac) 60%, transparent);
  box-shadow: 0 26px 50px -24px color-mix(in srgb, var(--ac) 55%, black), 0 0 0 1px color-mix(in srgb, var(--ac) 25%, transparent); }
.gx-rl-card:hover::before { opacity: 1; }
.gx-rl-card:hover::after { animation: gxRlSweep 1.1s ease; }
.gx-rl-card.open { grid-column: 1 / -1; transform: none; border-color: color-mix(in srgb, var(--ac) 70%, transparent);
  box-shadow: 0 30px 70px -30px color-mix(in srgb, var(--ac) 60%, black), 0 0 0 1px color-mix(in srgb, var(--ac) 30%, transparent); }
.gx-rl-card.open::before { opacity: 1; }

.gx-rl-top { position: relative; z-index: 1; display: block; width: 100%; padding: 24px 24px 20px; cursor: pointer; outline: none; }
.gx-rl-top:focus-visible { box-shadow: inset 0 0 0 2px var(--ac); border-radius: 24px; }
.gx-rl-num { position: absolute; top: 6px; right: 18px; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 92px; line-height: 1;
  color: color-mix(in srgb, var(--ac) 16%, transparent); pointer-events: none; user-select: none; }
.gx-rl-icon { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0b0a08;
  background: linear-gradient(145deg, color-mix(in srgb, var(--ac) 75%, white), var(--ac));
  box-shadow: 0 10px 26px -8px var(--ac), inset 0 1px 0 rgba(255,255,255,0.5); }
.gx-rl-title { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 21px; letter-spacing: 2.5px; text-transform: uppercase; color: #fff; margin-top: 18px; }
.gx-rl-sub { font-size: 13px; color: #a9a392; margin-top: 4px; min-height: 18px; }
.gx-rl-peek { margin-top: 16px; }
.gx-rl-peek span { display: block; height: 9px; border-radius: 6px; margin-top: 8px; filter: blur(2.5px); animation: gxRlPeek 2.6s ease-in-out infinite;
  background: linear-gradient(90deg, color-mix(in srgb, var(--ac) 55%, transparent), rgba(255,255,255,0.1)); }
.gx-rl-peek span:nth-child(1) { width: 92%; }
.gx-rl-peek span:nth-child(2) { width: 74%; animation-delay: .4s; }
.gx-rl-peek span:nth-child(3) { width: 58%; animation-delay: .8s; }
.gx-rl-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; }
.gx-rl-count { font-size: 11px; letter-spacing: 1px; color: var(--ac); background: color-mix(in srgb, var(--ac) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--ac) 35%, transparent); padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.gx-rl-hint { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #8f897a; transition: color .3s; }
.gx-rl-card:hover .gx-rl-hint, .gx-rl-card.open .gx-rl-hint { color: var(--ac); }

.gx-rl-card.open .gx-rl-top { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.gx-rl-card.open .gx-rl-tt { flex: 1; min-width: 200px; }
.gx-rl-card.open .gx-rl-title { margin-top: 0; }
.gx-rl-card.open .gx-rl-peek { display: none; }
.gx-rl-card.open .gx-rl-foot { margin-top: 0; gap: 16px; }
.gx-rl-card.open .gx-rl-num { font-size: 120px; top: -6px; }

.gx-rl-panel { position: relative; z-index: 1; padding: 0 24px 26px; animation: gxFadeIn .4s ease both; }
.gx-rl-panel::before { content: ""; display: block; height: 1px; margin-bottom: 18px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ac) 60%, transparent), transparent); }
.gx-rl-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }

.gx-rl-rows { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 10px 14px; }
.gx-rl-rows > * { animation: gxRlIn .5s cubic-bezier(.22,.8,.25,1) both; }
.gx-rl-h { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; margin-top: 14px; font-family: 'Oswald', sans-serif;
  font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: var(--ac); }
.gx-rl-h:first-child { margin-top: 0; }
.gx-rl-h::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, color-mix(in srgb, var(--ac) 55%, transparent), transparent); }
.gx-rl-h b { min-width: 28px; height: 28px; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9px; font-size: 13px; letter-spacing: 0;
  background: color-mix(in srgb, var(--ac) 18%, transparent); border: 1px solid color-mix(in srgb, var(--ac) 45%, transparent); }
.gx-rl-note { grid-column: 1 / -1; display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 14px; font-size: 14px; line-height: 1.55; color: #f1ecde;
  background: linear-gradient(100deg, color-mix(in srgb, var(--ac) 20%, transparent), rgba(255,255,255,0.03)); border: 1px solid color-mix(in srgb, var(--ac) 40%, transparent); }
.gx-rl-note svg { color: var(--ac); flex-shrink: 0; margin-top: 2px; }
.gx-rl-p { grid-column: 1 / -1; color: #cfc9b8; line-height: 1.6; font-size: 14px; }
.gx-rl-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 12px 14px; border-radius: 14px; font-size: 14px; color: #ece7d8;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid var(--ac); transition: background .2s, transform .2s; }
.gx-rl-row:hover { background: rgba(255,255,255,0.08); transform: translateX(3px); }
.gx-rl-row.code { justify-content: flex-start; gap: 14px; }
.gx-rl-detail { flex-basis: 100%; font-size: 12px; color: #9a9486; }
.gx-rl-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.gx-rl-chip { font-size: 12px; font-weight: 600; padding: 4px 11px; border-radius: 999px; white-space: nowrap; color: var(--ac);
  background: color-mix(in srgb, var(--ac) 14%, transparent); border: 1px solid color-mix(in srgb, var(--ac) 38%, transparent); }
.gx-rl-chip.money { color: #F4C744; background: rgba(244,199,68,0.12); border-color: rgba(244,199,68,0.4); font-family: 'Oswald', sans-serif; letter-spacing: .5px; }
.gx-rl-code { min-width: 78px; text-align: center; font-family: Consolas, monospace; font-weight: 700; font-size: 13px; padding: 5px 10px; border-radius: 9px; color: #0b0a08; background: var(--ac); }
.gx-rl-bullet { grid-column: 1 / -1; display: flex; gap: 12px; align-items: flex-start; color: #e4dfd0; line-height: 1.55; font-size: 14px; padding: 2px 4px; }
.gx-rl-bullet i { width: 8px; height: 8px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; background: var(--ac); box-shadow: 0 0 10px var(--ac); }
.gx-rl-empty { color: #8A8579; font-size: 13px; padding: 14px 0; }

.gx-rl-form { margin-bottom: 26px; }
.gx-rl-pick { display: flex; flex-wrap: wrap; gap: 8px; }
.gx-rl-pick button { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #B9B3A2; transition: all .2s; }
.gx-rl-pick button.on { color: #F4C744; border-color: #F4C744; background: rgba(244,199,68,0.14); }
.gx-rl-pick button.sw { border-radius: 50%; width: 30px; height: 30px; border-width: 2px; }
.gx-rl-pick button.sw.on { box-shadow: 0 0 0 3px rgba(255,255,255,0.35); }
.gx-rl-help { font-size: 12px; color: #8A8579; line-height: 1.9; margin-top: 8px; direction: ltr; text-align: left; }
.gx-rl-help code { font-family: Consolas, monospace; color: #F4C744; background: rgba(212,167,44,0.1); padding: 1px 6px; border-radius: 5px; }
.gx-rl-prev { margin-top: 14px; padding: 16px; border-radius: 14px; background: rgba(0,0,0,0.25); border: 1px dashed rgba(212,167,44,0.3); --ac: #F4C744; }

@media (max-width: 640px) {
  .gx-rl { padding: 16px 14px 60px; }
  .gx-rl-h1 { letter-spacing: 5px; }
  .gx-rl-rows { grid-template-columns: 1fr; }
  .gx-rl-num { font-size: 70px; }
  .gx-rl-panel, .gx-rl-top { padding-left: 16px; padding-right: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .gx-rl-h1, .gx-rl-peek span, .gx-rl-rows > *, .gx-rl-card { animation: none !important; }
  .gx-rl-card:hover::after { animation: none; }
}
/* ---------- Leaderboard: hand-picked podium with 3D cards ---------- */
.gx-lb { direction: ltr; }
.gx-lb-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; min-height: 40px; }
.gx-lb-hint { font-size: 13px; color: #8A8579; }
.gx-lb-board + .gx-lb-board { margin-top: 44px; }
.gx-lb-title { font-family: 'Oswald', sans-serif; font-size: 15px; letter-spacing: .14em; text-transform: uppercase; color: #F5F1E6; }
.gx-lb-stage { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: end; padding: 22px 4px 6px; }
.gx-lb-slot { display: flex; flex-direction: column; gap: 10px; animation: gxLbRise .7s cubic-bezier(.2,.8,.2,1) both; }
.gx-lb-slot[data-place="1"] { order: 2; animation-delay: .28s; }
.gx-lb-slot[data-place="2"] { order: 1; animation-delay: .14s; }
.gx-lb-slot[data-place="3"] { order: 3; animation-delay: .02s; }
@keyframes gxLbRise { from { opacity: 0; transform: perspective(900px) translateY(46px) rotateX(26deg) scale(.94); } to { opacity: 1; transform: none; } }

.gx-lb-card {
  --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 50%; --accent-rgb: 244,199,68;
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px;
  min-height: 250px; padding: 26px 14px 22px; text-align: center; border-radius: 18px; outline: none;
  background: linear-gradient(160deg, rgba(36,31,22,.78), rgba(14,13,11,.66));
  border: 1px solid rgba(var(--accent-rgb), .38);
  box-shadow: 0 20px 38px -20px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.05);
  backdrop-filter: blur(12px) saturate(140%); -webkit-backdrop-filter: blur(12px) saturate(140%);
  transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d; touch-action: pan-y; will-change: transform;
  transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease, border-color .3s ease;
}
.gx-lb-slot[data-place="1"] .gx-lb-card { min-height: 320px; box-shadow: 0 26px 46px -22px rgba(0,0,0,.9), 0 0 42px -14px rgba(var(--accent-rgb), .55), inset 0 1px 0 rgba(255,255,255,.07); }
.gx-lb-slot[data-place="2"] .gx-lb-card { min-height: 280px; }
.gx-lb-card.is-live { transition: transform .08s linear, box-shadow .3s ease, border-color .3s ease; }
.gx-lb-card:hover, .gx-lb-card:focus-visible { border-color: rgba(var(--accent-rgb), .75); box-shadow: 0 34px 54px -22px rgba(0,0,0,.95), 0 0 46px -8px rgba(var(--accent-rgb), .6); }
.gx-lb-card.is-link { cursor: pointer; }
.gx-lb-place {
  position: absolute; top: 4px; left: 50%; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 104px; line-height: 1;
  color: rgba(var(--accent-rgb), .13); transform: translate3d(-50%, 0, 14px); pointer-events: none; user-select: none;
}
.gx-lb-medal { transform: translateZ(64px); filter: drop-shadow(0 8px 10px rgba(0,0,0,.65)); }
.gx-lb-slot[data-place="1"] .gx-lb-medal { animation: gxFloat 3.2s ease-in-out infinite; }
.gx-lb-avatar {
  transform: translateZ(48px); border-radius: 50%; padding: 3px; line-height: 0; margin: 4px 0 6px;
  background: conic-gradient(from 210deg, rgba(var(--accent-rgb), 1), rgba(var(--accent-rgb), .25), rgba(var(--accent-rgb), 1));
  box-shadow: 0 14px 24px -10px rgba(0,0,0,.85), 0 0 24px -6px rgba(var(--accent-rgb), .5);
}
.gx-lb-avatar > * { border: 2px solid rgba(14,13,11,.9); }
.gx-lb-name { transform: translateZ(36px); font-size: 17px; font-weight: 600; color: #F5F1E6; text-shadow: 0 2px 8px rgba(0,0,0,.6); word-break: break-word; }
.gx-lb-rank { transform: translateZ(26px); font-size: 12px; color: rgb(var(--accent-rgb)); letter-spacing: .06em; text-transform: uppercase; }
.gx-lb-badge { transform: translateZ(30px); margin-top: 4px; font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: .08em; color: #B9B3A2; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 20px; padding: 3px 10px; }
.gx-lb-glare { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .3s ease; background: radial-gradient(280px circle at var(--mx) var(--my), rgba(255,255,255,.17), transparent 62%); }
.gx-lb-card:hover .gx-lb-glare { opacity: 1; }
.gx-lb-empty { align-items: center; justify-content: center; background: rgba(20,19,17,.28); border: 1px dashed rgba(var(--accent-rgb), .35); box-shadow: none; transform: none; }
.gx-lb-empty .gx-lb-place { top: 50%; transform: translate(-50%, -50%); font-size: 120px; color: rgba(var(--accent-rgb), .08); }
.gx-lb-empty-text { position: relative; font-size: 13px; color: #8A8579; }
.gx-lb-actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }

.gx-lb-modal-bg { position: fixed; inset: 0; z-index: 40; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,.6); backdrop-filter: blur(3px); animation: gxFadeIn .2s ease both; }
.gx-lb-modal { width: 440px; max-width: 100%; max-height: min(620px, 86vh); display: flex; flex-direction: column; padding: 18px; border-radius: 16px; background: rgba(20,19,17,.94); border: 1px solid rgba(212,167,44,.3); box-shadow: 0 30px 60px -20px rgba(0,0,0,.9); }
.gx-lb-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.gx-lb-modal-title { font-family: 'Oswald', sans-serif; font-size: 20px; color: #F4C744; letter-spacing: .06em; }
.gx-lb-modal-sub { font-size: 12px; color: #8A8579; margin-top: 2px; }
.gx-lb-modal-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; min-height: 80px; }
.gx-lb-pick { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; background: rgba(255,255,255,.03); color: #F5F1E6; cursor: pointer; font-family: 'Inter', sans-serif; transition: background .15s ease, border-color .15s ease, transform .15s ease; }
.gx-lb-pick:hover, .gx-lb-pick:focus-visible { background: rgba(212,167,44,.12); border-color: rgba(212,167,44,.4); transform: translateX(3px); outline: none; }
.gx-lb-pick-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.gx-lb-pick-name { font-size: 14px; font-weight: 500; }
.gx-lb-pick-rank { font-size: 12px; color: #8A8579; }
.gx-lb-pick-tag { font-size: 11px; color: #F4C744; background: rgba(212,167,44,.14); border-radius: 20px; padding: 3px 9px; white-space: nowrap; }

@media (max-width: 680px) {
  .gx-lb-stage { grid-template-columns: 1fr; gap: 16px; }
  .gx-lb-slot[data-place="1"] { order: 1; } .gx-lb-slot[data-place="2"] { order: 2; } .gx-lb-slot[data-place="3"] { order: 3; }
  .gx-lb-card, .gx-lb-slot[data-place="1"] .gx-lb-card, .gx-lb-slot[data-place="2"] .gx-lb-card { min-height: 220px; }
}
@media (prefers-reduced-motion: reduce) {
  .gx-lb-slot, .gx-lb-slot .gx-lb-medal { animation: none !important; }
  .gx-lb-card { transform: none !important; }
}

/* ---------- CV Sheriff ---------- */
.gx-cv { direction: ltr; text-align: left; max-width: 980px; margin: 0 auto; padding: 8px 4px 24px; display: flex; flex-direction: column; gap: 18px; }
.gx-cv-hero { text-align: center; padding: 18px 8px 4px; }
.gx-cv-hero h2 { font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; font-size: 30px; margin: 6px 0 4px; color: var(--gx-gold-bright); }
.gx-cv-hero p { margin: 0; color: #B9B3A2; font-size: 14px; }
.gx-cv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.gx-cv-grid .full { grid-column: 1 / -1; }
.gx-cv-note { border: 1px solid var(--gx-border); border-radius: 12px; padding: 14px 16px; background: rgba(212,167,44,.07); color: #E4DDC9; font-size: 14px; line-height: 1.55; }
.gx-cv-note.bad { border-color: rgba(224,119,106,.45); background: rgba(224,119,106,.08); }
.gx-cv-note.good { border-color: rgba(52,211,153,.45); background: rgba(52,211,153,.08); }
.gx-cv-row { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid var(--gx-border); border-radius: 12px; background: var(--gx-glass); flex-wrap: wrap; }
.gx-cv-row .t { flex: 1; min-width: 160px; }
.gx-cv-row .t b { font-family: 'Oswald', sans-serif; letter-spacing: .08em; text-transform: uppercase; font-weight: 500; font-size: 15px; color: #F2ECD8; display: block; }
.gx-cv-row .t span { color: #8A8579; font-size: 12px; }
.gx-cv-pill { font-family: 'Oswald', sans-serif; letter-spacing: .1em; font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid currentColor; }
.gx-cv-eye { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  background: rgba(212,167,44,.12); border: 1px solid var(--gx-border); color: var(--gx-gold-bright); transition: transform .15s, background .15s; }
.gx-cv-eye:hover { transform: translateY(-1px); background: rgba(212,167,44,.22); }
.gx-cv-modal { position: fixed; inset: 0; z-index: 90; background: rgba(5,5,4,.72); backdrop-filter: blur(4px); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 28px 14px; }
.gx-cv-paper { position: relative; width: 100%; max-width: 640px; direction: ltr; text-align: left; color: #1d1a14; padding: 30px 34px 28px; border-radius: 4px;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.025) 0 1px, transparent 1px 28px), linear-gradient(180deg, #F3ECD8, #E8DFC6);
  box-shadow: 0 24px 60px rgba(0,0,0,.55), inset 0 0 0 1px rgba(90,70,30,.25); font-family: 'Courier New', Courier, monospace; }
.gx-cv-paper::before { content: ""; position: absolute; left: 14px; top: 0; bottom: 0; width: 2px; background: rgba(150,40,40,.28); }
.gx-cv-ph { text-align: center; border-bottom: 2px double #3b3220; padding-bottom: 12px; margin-bottom: 16px; }
.gx-cv-ph .dept { font-family: 'Oswald', sans-serif; letter-spacing: .22em; font-size: 13px; text-transform: uppercase; color: #5a4a22; }
.gx-cv-ph .ttl { font-family: 'Oswald', sans-serif; letter-spacing: .12em; font-size: 24px; font-weight: 700; text-transform: uppercase; margin: 2px 0; }
.gx-cv-ph .no { font-size: 12px; color: #6b5a2c; }
.gx-cv-f { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed rgba(60,48,20,.4); font-size: 14px; }
.gx-cv-f .k { width: 150px; flex-shrink: 0; text-transform: uppercase; letter-spacing: .06em; font-size: 12px; color: #6b5a2c; padding-top: 2px; }
.gx-cv-f .v { flex: 1; font-weight: 700; word-break: break-word; white-space: pre-wrap; }
.gx-cv-stamp { position: absolute; top: 96px; right: 22px; transform: rotate(-12deg); border: 3px solid currentColor; border-radius: 6px; padding: 4px 12px;
  font-family: 'Oswald', sans-serif; letter-spacing: .16em; font-size: 22px; font-weight: 700; opacity: .85; pointer-events: none; }
.gx-cv-reason { margin-top: 14px; border: 2px solid #9b2c2c; background: rgba(155,44,44,.07); padding: 10px 12px; font-size: 14px; }
.gx-cv-reason b { display: block; text-transform: uppercase; font-size: 12px; letter-spacing: .08em; color: #9b2c2c; margin-bottom: 4px; }
.gx-cv-actions { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
.gx-cv-x { position: absolute; top: 10px; right: 12px; background: none; border: none; cursor: pointer; color: #5a4a22; }
@media (max-width: 640px) {
  .gx-cv-grid { grid-template-columns: 1fr; }
  .gx-cv-paper { padding: 26px 18px 22px; }
  .gx-cv-f { flex-direction: column; gap: 2px; }
  .gx-cv-f .k { width: auto; }
  .gx-cv-stamp { top: 88px; right: 10px; font-size: 18px; }
}


`;

const RANKS = [
  "Chef Sheriff", "Under Sheriff", "Management", "Assistant Chef", "Division Chef", "Major",
  "Capitan", "Lieutnant", "Sergent", "Master Deputy", "Deputy First Class", "Deputy",
];
// People who are only citizens in the Discord server (role GALAXY CITIZEN). They are not officers:
// they see the Rules (public chapters) and CV Sheriff rooms only, and are left out of every officer list.
const CITIZEN_RANK = "Galaxy Citizen";
const ALL_RANKS = [...RANKS, CITIZEN_RANK];   // permissions room; RANKS stays "officers only"
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
  { key: "rules", label: "rules", icon: Scale },
  { key: "cv", label: "CV Sheriff", icon: FileText },
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
    { key: "reorder", label: "Reorder the cards", hint: "Right-click a card to lift it, then click the place where it should go" },
  ] },
  { room: "rules", label: "Rules", icon: Scale, actions: [
    { key: "create", label: "Add rule chapters" },
    { key: "edit_own", label: "Edit their own chapters" },
    { key: "edit_all", label: "Edit anyone's chapters" },
    { key: "delete_own", label: "Delete their own chapters" },
    { key: "delete_all", label: "Delete anyone's chapters" },
    { key: "reorder", label: "Reorder the chapters", hint: "Use the arrows inside an opened chapter" },
  ] },
  { room: "leaderboard", label: "Leaderboard", icon: Trophy, actions: [
    { key: "manage", label: "Choose who stands on the podium", hint: "Nothing is counted: this person picks the officers for each place" },
  ] },
  { room: "cv", label: "CV Sheriff", icon: FileText, actions: [
    { key: "create", label: "Send a CV", hint: "For Galaxy Citizen. Officers do not need it" },
    { key: "review", label: "See every CV and accept / reject", hint: "Accepting gives the Discord role Accepted CV Sheriff" },
  ] },
  { room: "duty", label: "Duty time logs", icon: Clock, actions: [
    { key: "edit_all", label: "Edit anyone's time logs", hint: "Fix an officer's hours by hand from their profile" },
    { key: "delete_all", label: "Delete anyone's time logs" },
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
  if (rank === CITIZEN_RANK) {
    // citizens can do nothing except send their CV
    const none = (keys) => Object.fromEntries(keys.map((k) => [k, false]));
    const rec = ["create", "edit_own", "edit_all", "delete_own", "delete_all"];
    return {
      operations: none(rec), wanted: none(rec), tests: none(rec), dispatch: none(["create", "edit_own", "delete_own"]),
      uniform: none([...rec, "reorder"]), rules: none([...rec, "reorder"]), leaderboard: none(["manage"]), vacations: none(["create", "review"]),
      duty: none(["edit_all", "delete_all"]),
      cv: { create: true, review: false },
    };
  }
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
    uniform: { create: chief, edit_own: chief, edit_all: chief, delete_own: chief, delete_all: chief, reorder: chief },
    // Rules chapters: same idea as the uniform cards
    rules: { create: chief, edit_own: chief, edit_all: chief, delete_own: chief, delete_all: chief, reorder: chief },
    vacations: { create: write, review: management },
    // Duty time logs: only the timer creates them; management can correct anyone's hours
    duty: { edit_all: management, delete_all: management },
    // Leaderboard podium: picked by hand; closed until the Chef Sheriff opens it for the senior ranks he trusts
    leaderboard: { manage: chief },
    // CV Sheriff: officers do not send CVs; reviewing is closed until the Chef Sheriff opens it per rank
    cv: { create: false, review: chief },
  };
}

function defaultPermsFor(rank) {
  if (rank === CITIZEN_RANK) {
    return { actions: defaultActionsFor(rank), rooms: { rules: true, cv: true } };
  }
  const management = DEFAULT_MANAGEMENT_RANKS.includes(rank);
  const writeAdvanced = !["Deputy", "Deputy First Class"].includes(rank);
  return {
    actions: defaultActionsFor(rank),
    rooms: {
      dashboard: true, leaderboard: true, operations: true, wanted: true, tests: true, vacations: true, uniform: true, rules: true, cv: false,
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
  // Set when Discord returned to THIS browser but the login was started in another one (see startDiscordLogin)
  const [relayDone, setRelayDone] = useState(null);
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
    // Right after sign-in the first lookup can come back empty (the new session is not on the request yet),
    // which showed "Profile not found" until a refresh. Retry a few times before accepting "no profile".
    let data = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (res.error) console.error("profile error:", res.error);
      data = res.data ?? null;
      if (data) break;
      await new Promise((r) => setTimeout(r, 500));
    }
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
          startDiscordLogin({ forceWeb: true });
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
        if (!state) {
          setAuthError(GATE_MESSAGES.state_mismatch);
          setExchanging(false);
          return;
        }
        // The Discord app sent us to a different browser than the one where the login was started.
        // Hand the result to the tab that is waiting for it (it knows this state); this browser does not sign in.
        const { error: relayErr } = await supabase.functions.invoke("discord-auth", {
          body: { action: "relay_store", code, state, redirectUri: oauthRedirectUri() },
        });
        if (relayErr) {
          setAuthError("Sign-in failed. Please try again.");
          setExchanging(false);
          return;
        }
        setRelayDone({ state });
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

  // Keep the rank in step with Discord while the page is open. Discord cannot notify the site when a role changes,
  // so a server job (pg_cron -> discord-auth "sync_all", every 10 s) writes the new rank / name into the profile.
  //  - fast check: the open page reads its own profile row every 5 s (a plain database read, no function call)
  //  - slow check: every 2 min it also asks Discord through the function, only to sign out someone who lost every role
  const rankRef = useRef(null);
  const nameRef = useRef(null);
  rankRef.current = profile?.rank ?? null;
  nameRef.current = profile?.name ?? null;
  useEffect(() => {
    if (!userId) return undefined;
    let reading = false;
    const quickCheck = async () => {
      if (reading || document.hidden) return;
      reading = true;
      try {
        const { data } = await supabase.from("profiles").select("rank, name").eq("id", userId).maybeSingle();
        if (data && (data.rank !== rankRef.current || data.name !== nameRef.current)) loadProfile(userId);   // rooms and rights update at once
      } catch { /* ignore: next tick tries again */ } finally {
        reading = false;
      }
    };
    const quickTimer = setInterval(quickCheck, 5000);
    window.addEventListener("focus", quickCheck);
    return () => {
      clearInterval(quickTimer);
      window.removeEventListener("focus", quickCheck);
    };
  }, [userId, loadProfile]);

  useEffect(() => {
    if (!userId) return undefined;
    let running = false;
    let lastRun = Date.now();
    const check = async () => {
      if (running || document.hidden || Date.now() - lastRun < 20000) return;
      running = true;
      lastRun = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke("discord-auth", { body: { action: "sync" } });
        if (!error) {
          if (data?.rank && data.rank !== rankRef.current) loadProfile(userId);   // new rank: rooms and rights update at once
        } else {
          const info = await readFnError(error);
          if (info?.error === "no_role" || info?.error === "not_in_server") {     // role removed in Discord: sign out
            setAuthError(GATE_MESSAGES[info.error]);
            try { sessionStorage.setItem("gx_manual_login", "1"); } catch { /* ignore */ }
            await supabase.auth.signOut();
          }
          // any other error (network, server) is ignored on purpose
        }
      } finally {
        running = false;
      }
    };
    const timer = setInterval(check, 120000);
    const onVisible = () => { if (!document.hidden) check(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [userId, loadProfile]);

  const logout = async () => {
    try { sessionStorage.setItem("gx_manual_login", "1"); } catch { /* ignore */ }
    await supabase.auth.signOut();
    setView("dashboard");
    setViewedProfileId(null);
  };

  // "Sign in here instead": take the finished login for this state in this browser (returns an error text or null)
  const claimHere = async () => {
    const { data, error } = await supabase.functions.invoke("discord-auth", {
      body: { action: "relay_poll", state: relayDone?.state },
    });
    if (error) {
      const info = await readFnError(error);
      return GATE_MESSAGES[info?.error] || info?.message || "Could not sign in. Please try again.";
    }
    if (!data?.token_hash) return "Not available: the first tab already signed in, or the login expired. Try again.";
    const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: "magiclink" });
    if (otpErr) return "Sign-in failed. Please try again.";
    try { localStorage.setItem("gx_discord_ok", "1"); } catch { /* ignore */ }
    setRelayDone(null);
    return null;
  };

  if (relayDone) return <RelayDone onClaim={claimHere} />;

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
            <button style={{ ...styles.miniProfile, ...(profile.rank === CITIZEN_RANK ? { cursor: "default" } : {}) }} onClick={profile.rank === CITIZEN_RANK ? undefined : openOwnProfile}>
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
              {currentView === "rules" && "Rules"}
              {currentView === "cv" && "CV Sheriff"}
              {currentView === "activity" && "Activity Log"}
              {currentView === "permissions" && "Permissions"}
            </div>
          </div>

          <div key={currentView} className="gx-fade-up" style={{ flex: "1 0 auto", minHeight: 0, paddingBottom: 32 }}>
            {currentView === "dashboard" && canSeeRoom(profile.rank, "dashboard") && <Dashboard profile={profile} openOwnProfile={openOwnProfile} />}
            {currentView === "officers" && canSeeRoom(profile.rank, "officers") && <OfficersView showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "leaderboard" && canSeeRoom(profile.rank, "leaderboard") && <LeaderboardView me={profile} showToast={showToast} onOpenProfile={openProfile} />}

            {currentView === "profile" && <ProfileView profileId={viewedProfileId} me={profile} showToast={showToast} onDeleted={() => { setView("officers"); setViewedProfileId(null); }} />}
            {currentView === "operations" && canSeeRoom(profile.rank, "operations") && <OperationsView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "wanted" && canSeeRoom(profile.rank, "wanted") && <WantedView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "tests" && canSeeRoom(profile.rank, "tests") && <TestsView me={profile} showToast={showToast} onOpenProfile={openProfile} />}

            {currentView === "dispatch" && canSeeRoom(profile.rank, "dispatch") && <DispatchView me={profile} showToast={showToast} onOpenProfile={openProfile} />}
            {currentView === "vacations" && canSeeRoom(profile.rank, "vacations") && <VacationsView me={profile} management={management} showToast={showToast} />}
            {currentView === "weekly" && canSeeRoom(profile.rank, "weekly") && <WeeklyTableView me={profile} onOpenProfile={openProfile} />}
            {currentView === "uniform" && canSeeRoom(profile.rank, "uniform") && <UniformView me={profile} showToast={showToast} />}
            {currentView === "rules" && canSeeRoom(profile.rank, "rules") && <RulesView me={profile} showToast={showToast} />}
            {currentView === "cv" && canSeeRoom(profile.rank, "cv") && <CvView me={profile} showToast={showToast} />}
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

// On a computer the Discord desktop app is tried first (discord:// shows the Authorize screen inside the app).
// The app then sends the person back to their DEFAULT browser, which may be a different one than the browser
// where they clicked "Login". So this tab stays open and waits: whichever browser Discord returns to hands the
// result over through the discord-auth function (relay_store), and this tab collects it (relay_poll).
// If the app does not take focus within 4 seconds (not installed / blocked), it falls back to the normal
// browser page, which signs in on this same tab.
//   onWaiting(): the app was opened and we are waiting     onError(message): the login failed or timed out
//   forceWeb: skip the app and use the browser page
function startDiscordLogin({ onWaiting, onError, forceWeb = false } = {}) {
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

  // Browser version. Members who already approved the app skip Discord's consent screen.
  const webParams = new URLSearchParams(params);
  try { if (localStorage.getItem("gx_discord_ok") === "1") webParams.set("prompt", "none"); } catch { /* ignore */ }
  const webUrl = `https://discord.com/oauth2/authorize?${webParams.toString()}`;

  const isDesktop = !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (forceWeb || !isDesktop || !state) { window.location.href = webUrl; return; }

  onWaiting?.();
  waitForDiscordApp(state, webUrl, onError);
  window.location.href = `discord://-/oauth2/authorize?${params.toString()}`;
}

function waitForDiscordApp(state, webUrl, onError) {
  let stopped = false;
  let appOpened = false;
  const onLeave = () => { appOpened = true; };
  const onVisibility = () => { if (document.hidden) appOpened = true; };
  window.addEventListener("blur", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  const stop = () => {
    stopped = true;
    window.removeEventListener("blur", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    try { sessionStorage.removeItem("gx_oauth_state"); } catch { /* ignore */ }
  };

  // No sign that the app opened: use the browser page on this tab
  setTimeout(() => {
    window.removeEventListener("blur", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    if (!stopped && !appOpened) { stopped = true; window.location.href = webUrl; }
  }, 4000);

  (async () => {
    const deadline = Date.now() + 5 * 60 * 1000;
    while (!stopped && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 1500));
      if (stopped) return;
      const { data, error } = await supabase.functions.invoke("discord-auth", { body: { action: "relay_poll", state } });
      if (error) {
        const info = await readFnError(error);
        if (!info) continue;                       // network hiccup: keep waiting
        stop();
        onError?.(GATE_MESSAGES[info.error] || info.message || "Sign-in failed. Please try again.");
        return;
      }
      if (data?.token_hash) {
        stop();
        const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: "magiclink" });
        if (otpErr) { onError?.("Sign-in failed. Please try again."); return; }
        try { localStorage.setItem("gx_discord_ok", "1"); } catch { /* ignore */ }
        return;                                    // the session event takes over from here
      }
    }
    if (!stopped) { stop(); onError?.("Login timed out. Please try again."); }
  })();
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
  const [appWait, setAppWait] = useState(false);       // the Discord app was opened, waiting for the approval
  const [localError, setLocalError] = useState(null);  // login failed / timed out while waiting
  const begin = useCallback(() => {
    setLocalError(null);
    startDiscordLogin({
      onWaiting: () => setAppWait(true),
      onError: (msg) => { setAppWait(false); setLocalError(msg); },
    });
  }, []);
  useEffect(() => { if (autoStart) begin(); }, [autoStart, begin]);
  const shownError = localError || error;
  const waiting = !localError && (busy || autoStart || appWait);
  return (
    <div style={styles.loginPage}>
      <style>{FONTS}</style>
      <div style={styles.loginGrid} />
      <div className="gx-glass-card gx-fade-up" style={styles.loginCard}>
        <img src={badgeLogo} alt="GXPD Badge" className="gx-logo-badge" style={{ width: 64, height: 64, objectFit: "contain" }} />
        <div style={styles.loginTitle}>SHERIFF DEPARTMENT</div>
        {waiting ? (
          <>
            <div style={styles.loginSub}>
              {appWait ? "Approve the login in the Discord app, then come back to this tab. It signs you in by itself." : "Signing you in with Discord..."}
            </div>
            {appWait && (
              <button className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => startDiscordLogin({ forceWeb: true })}>
                Use the browser instead
              </button>
            )}
          </>
        ) : (
          <>
            {shownError && <div style={{ color: "#E0776A", fontSize: 13, margin: "10px 0", textAlign: "center" }}>{shownError}</div>}
            <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, width: "100%", justifyContent: "center", marginTop: 16, gap: 8 }} onClick={begin}>
              <DiscordIcon size={17} /> Login with Discord
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Shown in a browser that Discord returned to while the login was started in another one.
// The login result is already handed over to the first tab, which signs in by itself.
function RelayDone({ onClaim }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <div style={styles.loginPage}>
      <style>{FONTS}</style>
      <div style={styles.loginGrid} />
      <div className="gx-glass-card gx-fade-up" style={styles.loginCard}>
        <img src={badgeLogo} alt="GXPD Badge" className="gx-logo-badge" style={{ width: 64, height: 64, objectFit: "contain" }} />
        <div style={styles.loginTitle}>SHERIFF DEPARTMENT</div>
        <div style={styles.loginSub}>Discord login finished. Go back to the first tab where you started: it signs you in by itself. You can close this tab.</div>
        {msg && <div style={{ color: "#E0776A", fontSize: 13, margin: "10px 0", textAlign: "center" }}>{msg}</div>}
        <button
          className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, width: "100%", justifyContent: "center", marginTop: 16 }}
          disabled={busy}
          onClick={async () => { setBusy(true); setMsg(await onClaim()); setBusy(false); }}
        >
          {busy ? "..." : "Sign in here instead"}
        </button>
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
    supabase.from("profiles").select("id, name, badge, rank").neq("rank", CITIZEN_RANK).then(({ data }) => setAll(data || []));
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

// ---- Duty monitor: server-side stopwatch (14:00 -> 06:00 only, 8 hours max per shift) ----
function pad2(n) { return String(n).padStart(2, "0"); }
function fmtClock(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(t / 3600))}:${pad2(Math.floor((t % 3600) / 60))}:${pad2(t % 60)}`;
}

const DUTY_MAX_MS = 8 * 3600 * 1000;

function DutyTimer({ profile, onLogged }) {
  const [st, setSt] = useState(null);       // last duty_status() answer
  const [offset, setOffset] = useState(0);  // server clock - browser clock
  const [tick, setTick] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);     // { type: "error" | "success" | "info", text }
  const wasRunning = useRef(false);
  const stopping = useRef(false);
  const loggedCb = useRef(onLogged);
  loggedCb.current = onLogged;

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc("duty_status");
    if (error || !data) return;
    // the server closed our shift by itself (8 hours reached or 06:00): tell the officer
    if (wasRunning.current && !data.started_at && !stopping.current) {
      setMsg({ type: "info", text: "Your shift was closed automatically and saved to your time logs." });
      loggedCb.current && loggedCb.current();
    }
    wasRunning.current = !!data.started_at;
    setSt(data);
    setOffset(new Date(data.server_now).getTime() - Date.now());
  }, []);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 15000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const running = !!st?.started_at;

  // Re-check right when the shift ends (8h / 06:00) or when the 14:00 window opens
  useEffect(() => {
    const edge = running ? st?.ends_at : st?.changes_at;
    if (!edge) return;
    const wait = new Date(edge).getTime() - (Date.now() + offset) + 1500;
    if (wait <= 0 || wait > 2147483000) return;
    const t = setTimeout(refresh, wait);
    return () => clearTimeout(t);
  }, [running, st?.ends_at, st?.changes_at, offset, refresh]);

  const now = tick + offset;
  const startMs = running ? new Date(st.started_at).getTime() : 0;
  const endMs = running && st.ends_at ? new Date(st.ends_at).getTime() : null;
  const cap = running && endMs ? Math.min(endMs - startMs, DUTY_MAX_MS) : DUTY_MAX_MS;
  const elapsed = running ? Math.min(Math.max(0, now - startMs), cap) : 0;
  const remaining = running && endMs ? Math.max(0, endMs - now) : 0;
  const windowOpen = st ? (running ? true : st.window_open) : false;
  const opensIn = !running && st && !st.window_open && st.changes_at ? Math.max(0, new Date(st.changes_at).getTime() - now) : 0;
  const warn = running && remaining < 30 * 60 * 1000;

  const accent = running ? (warn ? "#FFB020" : "#3BA0FF") : windowOpen ? "#7FB8E8" : "#6C7480";
  const chip = running ? "ON DUTY" : windowOpen ? "READY" : "CLOSED";
  const roster = st?.on_duty_list || [];

  const start = async () => {
    setBusy(true); setMsg(null);
    const { error } = await supabase.rpc("duty_start");
    setBusy(false);
    if (error) {
      setMsg({ type: "error", text: error.message === "outside_hours" ? "Duty can only be started between 14:00 and 06:00." : "Could not start the timer." });
      refresh(); return;
    }
    refresh();
  };

  const stop = async () => {
    setBusy(true); setMsg(null); stopping.current = true;
    const { data, error } = await supabase.rpc("duty_stop");
    setBusy(false);
    if (error) { stopping.current = false; setMsg({ type: "error", text: "Could not stop the timer." }); return; }
    if (data?.logged) {
      setMsg({ type: "success", text: `Logged ${fmtHours(Number(data.duration_hours))} (${data.time_in} → ${data.time_out}).` });
      loggedCb.current && loggedCb.current();
    } else if (data?.too_short) {
      setMsg({ type: "error", text: "Session was too short to be logged." });
    }
    await refresh();
    stopping.current = false;
  };

  const msgColor = msg ? (msg.type === "error" ? "#FF6B5E" : msg.type === "info" ? "#FFB020" : "#3DDC97") : undefined;

  // circular gauge: one full turn = 8 hours
  const R = 92, C = 2 * Math.PI * R;
  const frac = Math.max(0, Math.min(1, elapsed / DUTY_MAX_MS));

  return (
    <div className="gx-glass-card" style={dm.card}>
      <span style={{ ...dm.corner, top: 6, left: 6, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }} />
      <span style={{ ...dm.corner, top: 6, right: 6, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }} />
      <span style={{ ...dm.corner, bottom: 6, left: 6, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }} />
      <span style={{ ...dm.corner, bottom: 6, right: 6, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }} />

      <div style={dm.head}>
        <div style={dm.headLeft}>
          <span className={running ? "gx-dm-led" : undefined} style={{ ...dm.led, background: accent }} />
          <span style={dm.title}>DUTY STATUS</span>
        </div>
        <span style={{ ...dm.chip, background: running ? accent : "transparent", color: running ? "#071018" : accent, borderColor: accent }}>{chip}</span>
      </div>

      <div className="gx-dm-grid">
        {/* ---------- gauge + controls ---------- */}
        <div style={dm.gaugeCol}>
          <div style={dm.gaugeWrap}>
            <svg viewBox="0 0 220 220" width="220" height="220" style={{ display: "block" }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={i} x1="110" y1="4" x2="110" y2="14" stroke="rgba(255,255,255,0.28)" strokeWidth="2"
                  transform={`rotate(${i * 45} 110 110)`} />
              ))}
              <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
              <circle cx="110" cy="110" r={R} fill="none" stroke={accent} strokeWidth="12" strokeLinecap="butt"
                strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90 110 110)"
                style={{ transition: "stroke-dasharray .9s linear, stroke .4s ease", filter: running ? `drop-shadow(0 0 6px ${accent}99)` : "none" }} />
            </svg>
            <div style={dm.gaugeCenter}>
              <div style={dm.gaugeLabel}>SHIFT TIME</div>
              <div style={{ ...dm.clock, color: running ? "#fff" : "rgba(255,255,255,0.45)" }}>{fmtClock(elapsed)}</div>
              <div style={dm.gaugeSub}>MAX 08:00:00</div>
            </div>
          </div>

          <div style={dm.readout}>
            {running ? (
              <>AUTO-STOP IN <b style={{ color: accent }}>{fmtClock(remaining)}</b></>
            ) : windowOpen ? (
              <>PRESS START WHEN YOU GO ON DUTY</>
            ) : (
              <>OPENS IN <b style={{ color: accent }}>{st ? fmtClock(opensIn) : "--:--:--"}</b> · 14:00 → 06:00</>
            )}
          </div>

          <button
            className="gx-btn"
            style={{ ...dm.btn, ...(running ? dm.btnStop : dm.btnStart), opacity: busy || (!running && !windowOpen) ? 0.4 : 1, cursor: busy || (!running && !windowOpen) ? "not-allowed" : "pointer" }}
            disabled={busy || (!running && !windowOpen)}
            onClick={running ? stop : start}
          >
            {running ? <Square size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
            {running ? "END SHIFT" : "START SHIFT"}
          </button>
          {msg && <div style={{ ...dm.msg, color: msgColor }}>{msg.text}</div>}
        </div>

        {/* ---------- who is on duty ---------- */}
        <div style={dm.rosterCol}>
          <div style={dm.countBox}>
            <div>
              <div style={dm.panelLabel}>ON DUTY NOW</div>
              <div style={dm.count}>{st ? st.on_duty : "–"}</div>
            </div>
            <Users size={34} color={accent} style={{ opacity: 0.85 }} />
          </div>
          <div style={dm.roster}>
            {!st ? (
              <div style={dm.rosterEmpty}>Loading…</div>
            ) : roster.length === 0 ? (
              <div style={dm.rosterEmpty}>Nobody is on duty right now</div>
            ) : roster.map((o) => (
              <div key={o.id} style={{ ...dm.rosterRow, borderLeftColor: o.id === profile.id ? "#FFB020" : "#3BA0FF" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={dm.rosterName}>{o.name}{o.id === profile.id ? " (you)" : ""}</div>
                  <div style={dm.rosterRank}>{o.rank}</div>
                </div>
                <div style={dm.rosterTime}>{fmtClock(Math.min(now - new Date(o.started_at).getTime(), DUTY_MAX_MS))}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DM_HEAD = "'Oswald', sans-serif";
const dm = {
  card: { position: "relative", background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 2px, transparent 2px, transparent 8px), linear-gradient(180deg, #14171c 0%, #0b0d10 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "20px 22px 22px", marginBottom: 20, boxShadow: "0 16px 36px -18px rgba(0,0,0,0.85)" },
  corner: { position: "absolute", width: 14, height: 14, pointerEvents: "none" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.08)", direction: "ltr" },
  headLeft: { display: "flex", alignItems: "center", gap: 10 },
  led: { width: 9, height: 9, borderRadius: "50%", display: "inline-block" },
  title: { fontFamily: DM_HEAD, fontSize: 14, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.85)" },
  chip: { fontFamily: DM_HEAD, fontSize: 12, fontWeight: 600, letterSpacing: 2, padding: "3px 12px", border: "1px solid", borderRadius: 2 },
  gaugeCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, direction: "ltr" },
  gaugeWrap: { position: "relative", width: 220, height: 220 },
  gaugeCenter: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 },
  gaugeLabel: { fontFamily: DM_HEAD, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.45)" },
  clock: { fontFamily: DM_HEAD, fontSize: 38, fontWeight: 600, letterSpacing: 1.5, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, transition: "color .3s ease" },
  gaugeSub: { fontFamily: DM_HEAD, fontSize: 10.5, letterSpacing: 2, color: "rgba(255,255,255,0.32)" },
  readout: { fontFamily: DM_HEAD, fontSize: 12.5, letterSpacing: 2, color: "rgba(255,255,255,0.6)", textAlign: "center", minHeight: 18 },
  btn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", maxWidth: 260, padding: "13px 20px", fontFamily: DM_HEAD, fontSize: 14, fontWeight: 600, letterSpacing: 3, border: "none", clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)", transition: "filter .2s ease, transform .2s ease" },
  btnStart: { background: "#3BA0FF", color: "#06121E" },
  btnStop: { background: "#E5483B", color: "#fff" },
  msg: { fontSize: 12.5, textAlign: "center" },
  rosterCol: { display: "flex", flexDirection: "column", gap: 12, minWidth: 0, direction: "ltr", textAlign: "left" },
  countBox: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 },
  panelLabel: { fontFamily: DM_HEAD, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.45)" },
  count: { fontFamily: DM_HEAD, fontSize: 56, fontWeight: 600, lineHeight: 1.05, color: "#fff", fontVariantNumeric: "tabular-nums" },
  roster: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 210, overflowY: "auto", paddingRight: 4 },
  rosterEmpty: { fontSize: 13, color: "rgba(255,255,255,0.4)", padding: "12px 2px" },
  rosterRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.035)", borderLeft: "3px solid #3BA0FF", borderRadius: 2 },
  rosterName: { fontSize: 13.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rosterRank: { fontFamily: DM_HEAD, fontSize: 11, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" },
  rosterTime: { fontFamily: DM_HEAD, fontSize: 15, letterSpacing: 1, color: "rgba(255,255,255,0.75)", fontVariantNumeric: "tabular-nums" },
};


function Dashboard({ profile, openOwnProfile }) {
  const [totalHours, setTotalHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [opsCount, setOpsCount] = useState(0);
  const [dispatchTotalHours, setDispatchTotalHours] = useState(0);
  const canSeeDispatch = canSeeRoom(profile.rank, "dispatch");

  const [reloadKey, setReloadKey] = useState(0);

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
  }, [profile.id, canSeeDispatch, reloadKey]);

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
      {profile.rank !== "Galaxy Citizen" && <DutyTimer profile={profile} onLogged={() => setReloadKey((k) => k + 1)} />}
      <div style={{ ...styles.statsRow, gridTemplateColumns: `repeat(${canSeeDispatch ? 4 : 3}, 1fr)` }}>
        <StatCard icon={Clock} label="Total Hours" value={fmtHours(totalHours)} accent />
        <StatCard icon={Shield} label="Number of Logs" value={logsCount} />
        <StatCard icon={Radio} label="Number of Operations" value={opsCount} />
        {canSeeDispatch && <StatCard icon={Headphones} label="Total Dispatch Hours" value={fmtHours(dispatchTotalHours)} />}
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
        {ALL_RANKS.map((r) => (
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
    supabase.from("profiles").select("*").neq("rank", CITIZEN_RANK).order("created_at", { ascending: true })
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
  const [savingLog, setSavingLog] = useState(false);
  const isOwn = profileId === me.id;
  const canEditLogs = can(me.rank, "duty", "edit_all");
  // typing hours by hand: officers add their own; editing an existing log follows the permissions room
  const showLogForm = editingLogId ? canEditLogs : (isOwn && me.rank !== "Galaxy Citizen");
  const canDeleteLogs = isOwn || can(me.rank, "duty", "delete_all");
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
    setSavingLog(true);
    const payload = { work_date: workDate, time_in: timeIn, time_out: timeOut, duration_hours: duration };
    let error;
    if (editingLogId) {
      ({ error } = await supabase.from("duty_logs").update(payload).eq("id", editingLogId));
    } else {
      ({ error } = await supabase.from("duty_logs").insert({ ...payload, officer_id: me.id }));
    }
    setSavingLog(false);
    if (error) { showToast("error", editingLogId ? "Failed to update log" : "Failed to submit log"); return; }
    showToast("success", editingLogId ? "Log updated" : `Log submitted — ${fmtHours(duration)}`);
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
    if (error) {
      let reason = "";
      try { reason = await error.context?.text?.(); } catch (_) { /* ignore */ }
      showToast("error", reason ? `Failed to delete account: ${reason}` : "Failed to delete account");
      return;
    }
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

      {showLogForm && (
        <div className="gx-glass-card" style={{ ...styles.sectionCard, marginTop: 16 }}>
          <div style={styles.sectionHeader}>{editingLogId ? "Edit Log" : "Add Time Manually"}</div>
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
              <button className="gx-btn gx-btn-gold" style={{ ...styles.btnGold, flex: 1, justifyContent: "center" }} disabled={savingLog}>
                {savingLog ? "..." : editingLogId ? "Save Changes" : "Submit Log"}
              </button>
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
              <LogRows list={logs} emptyMsg="No logs available yet" onEdit={canEditLogs ? startEditLog : undefined} onDelete={canDeleteLogs ? deleteLog : undefined} />
            ) : (
              <LogRows list={dispatchLogs} emptyMsg="No dispatch logs available yet" />
            )}
          </>
        ) : (
          <>
            <div style={styles.sectionHeader}>Time Logs</div>
            <LogRows list={logs} emptyMsg="No logs available yet" onEdit={canEditLogs ? startEditLog : undefined} onDelete={canDeleteLogs ? deleteLog : undefined} />
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
  const [lifted, setLifted] = useState(null);   // id of the card being moved
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
    const sorted = (data || []).slice().sort((a, b) => (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) || new Date(a.created_at) - new Date(b.created_at) || String(a.id).localeCompare(String(b.id)));
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
    if (e.button !== 0) return;   // a right-click only lifts a card, it never rotates the gallery
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

  // --- move a card: right-click lifts it, clicking another card drops it at that card's place ------------
  const canReorder = can(me.rank, "uniform", "reorder");
  useEffect(() => {
    if (!lifted) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setLifted(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lifted]);

  const dropAt = async (index) => {
    const from = items.findIndex((x) => x.id === lifted);
    setLifted(null);
    if (from < 0 || from === index) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setItems(next.map((x, i) => ({ ...x, sort_order: i + 1 })));   // show it at once, the server confirms below
    setCurrent(index);
    const { error } = await supabase.rpc("reorder_uniforms", { p_ids: next.map((x) => x.id) });
    if (error) { showToast("error", "Could not save the new order"); load(); return; }
    showToast("success", "Card moved");
  };

  const onCardClick = (i) => {
    if (dragged.current) return;
    if (!lifted) { go(i); return; }
    if (items[i]?.id === lifted) { setLifted(null); return; }
    dropAt(i);
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
      {lifted && (
        <div className="gx-uni-moving">
          <span>Moving <b>{items.find((x) => x.id === lifted)?.name || items.find((x) => x.id === lifted)?.rank}</b> — click the card whose place you want (use the mouse wheel or the dots to reach it).</span>
          <button type="button" className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, padding: "5px 12px" }} onClick={() => setLifted(null)}>Cancel</button>
        </div>
      )}
      <div className={`gx-uni${lifted ? " moving" : ""}`} ref={galleryRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { drag.current = { startX: null, moved: false, idx: null, onCode: false }; }}>
        {n === 0 && <div style={{ ...styles.emptyState, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>No uniform cards yet</div>}
        <div className="gx-uni-stage">
          {items.map((it, i) => {
            const o = i - current;
            const a = Math.abs(o);
            return (
              <div
                key={it.id}
                className={`gx-uni-item${a === 0 ? " active" : ""}${lifted === it.id ? " lifted" : ""}`}
                style={{
                  transform: `translateX(${o * step}px) translateZ(${-a * 90}px) rotateY(${-o * 16}deg) scale(${a === 0 ? 1.08 : 1})`,
                  zIndex: 50 - a,
                  opacity: a > 3 ? 0 : 1 - a * 0.12,
                  filter: a === 0 ? "none" : `brightness(${1 - a * 0.12})`,
                  pointerEvents: a > 3 ? "none" : "auto",
                }}
                onClick={() => onCardClick(i)}
                onContextMenu={(e) => {
                  if (!canReorder) return;
                  e.preventDefault();
                  setLifted((cur) => (cur === it.id ? null : it.id));
                }}
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

      {(canCreate || canEdit || canDelete || (canReorder && n > 1)) && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
          {canCreate && !formOpen && (
            <button type="button" className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={openAdd}><Plus size={15} /> Add card</button>
          )}
          {canEdit && (
            <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => openEdit(cur)}>✎ Edit {cur.name || cur.rank}</button>
          )}
          {canReorder && n > 1 && cur && !lifted && (
            <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => setLifted(cur.id)}>⇄ Move {cur.name || cur.rank}</button>
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

// ---------------------------------------------------------------------------
// Rules room: sealed chapters. Each chapter is closed (blurred teaser) until it is clicked, then its
// rules appear one after the other. Chapters live in the "rules_sections" table; who can add / edit /
// delete / reorder them is set per rank in the permissions room (room "rules").
// A chapter's text is written one entry per line:
//   ## Heading    > note    - bullet    Left :: a | b (row with chips)    ~ detail line    plain paragraph
// ---------------------------------------------------------------------------
const RULE_ICONS = { scale: Scale, gavel: Gavel, receipt: Receipt, radio: RadioTower, siren: Siren, shield: ShieldAlert, book: BookOpen, fingerprint: Fingerprint };
const RULE_ACCENTS = ["#F4C744", "#FF6B6B", "#38D6E8", "#A78BFA", "#34D399", "#F472B6", "#FB923C", "#60A5FA"];
const ruleAccent = (c) => (/^#[0-9a-fA-F]{6}$/.test(c || "") ? c : RULE_ACCENTS[0]);
const RULE_BODY_HELP = "## Heading   ·   > Note   ·   - Bullet   ·   Left text :: chip | chip   ·   ~ Small detail under the line above";

function parseRules(body) {
  const out = [];
  String(body || "").split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("## ")) out.push({ t: "h", text: line.slice(3).trim() });
    else if (line.startsWith("> ")) out.push({ t: "note", text: line.slice(2).trim() });
    else if (line.startsWith("~ ")) {
      const prev = out[out.length - 1];
      const text = line.slice(2).trim();
      if (prev && (prev.t === "row" || prev.t === "bullet")) prev.detail = prev.detail ? `${prev.detail} · ${text}` : text;
      else out.push({ t: "p", text });
    } else if (line.startsWith("- ")) out.push({ t: "bullet", text: line.slice(2).trim() });
    else if (line.includes("::")) {
      const i = line.indexOf("::");
      out.push({ t: "row", left: line.slice(0, i).trim(), right: line.slice(i + 2).split("|").map((s) => s.trim()).filter(Boolean) });
    } else out.push({ t: "p", text: line });
  });
  return out;
}

function RulesBody({ body }) {
  const nodes = useMemo(() => parseRules(body), [body]);
  if (nodes.length === 0) return <div className="gx-rl-empty">Nothing is written in this chapter yet.</div>;
  return (
    <div className="gx-rl-rows">
      {nodes.map((n, i) => {
        const st = { animationDelay: `${Math.min(i, 26) * 30}ms` };
        if (n.t === "h") {
          const m = n.text.match(/^(\d+)\.\s+(.*)$/);
          return <div key={i} className="gx-rl-h" style={st}>{m && <b>{m[1]}</b>}<span>{m ? m[2] : n.text}</span></div>;
        }
        if (n.t === "note") return <div key={i} className="gx-rl-note" style={st}><Sparkles size={17} /><span>{n.text}</span></div>;
        if (n.t === "p") return <div key={i} className="gx-rl-p" style={st}>{n.text}</div>;
        if (n.t === "bullet") {
          return (
            <div key={i} className="gx-rl-bullet" style={st}>
              <i />
              <span>{n.text}{n.detail && <span style={{ display: "block", fontSize: 12, color: "#9a9486", marginTop: 2 }}>{n.detail}</span>}</span>
            </div>
          );
        }
        const isCode = /^(10-\d+|code\s*\d+)$/i.test(n.left);
        if (isCode) {
          return (
            <div key={i} className="gx-rl-row code" style={st}>
              <span className="gx-rl-code">{n.left}</span>
              <span>{n.right.join(" · ")}</span>
            </div>
          );
        }
        return (
          <div key={i} className="gx-rl-row" style={st}>
            <span style={{ flex: "1 1 160px" }}>{n.left}</span>
            {n.right.length > 0 && (
              <span className="gx-rl-chips">
                {n.right.map((c, k) => <span key={k} className={`gx-rl-chip${c.includes("$") ? " money" : ""}`}>{c}</span>)}
              </span>
            )}
            {n.detail && <span className="gx-rl-detail">{n.detail}</span>}
          </div>
        );
      })}
    </div>
  );
}

function RulesView({ me, showToast }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("scale");
  const [accent, setAccent] = useState(RULE_ACCENTS[0]);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("staff");
  const [busy, setBusy] = useState(false);
  const cardRefs = useRef({});
  const formRef = useRef(null);
  const focusId = useRef(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("rules_sections").select("*");
    if (error) { console.error("load rules error:", error); setLoaded(true); return; }
    const sorted = (data || []).slice().sort((a, b) => (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) || new Date(a.created_at) - new Date(b.created_at) || String(a.id).localeCompare(String(b.id)));
    setItems(sorted);
    setLoaded(true);
    if (focusId.current) { setOpenId(focusId.current); focusId.current = null; }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("rules_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rules_sections" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const toggle = (id) => {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) setTimeout(() => cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 140);
  };

  const resetForm = () => { setTitle(""); setSubtitle(""); setIcon("scale"); setAccent(RULE_ACCENTS[0]); setBody(""); setVisibility("staff"); setEditingId(null); };
  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  const openAdd = () => { resetForm(); setFormOpen(true); scrollToForm(); };
  const openEdit = (it) => {
    setEditingId(it.id);
    setTitle(it.title || "");
    setSubtitle(it.subtitle || "");
    setIcon(RULE_ICONS[it.icon] ? it.icon : "scale");
    setAccent(ruleAccent(it.accent));
    setBody(it.body || "");
    setVisibility(it.visibility === "public" ? "public" : "staff");
    setFormOpen(true);
    scrollToForm();
  };
  const closeForm = () => { resetForm(); setFormOpen(false); };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { showToast("error", "Please write the chapter title"); return; }
    setBusy(true);
    const payload = { title: title.trim(), subtitle: subtitle.trim(), icon, accent, body, visibility };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("rules_sections").update(payload).eq("id", editingId));
      focusId.current = editingId;
    } else {
      const nextOrder = items.reduce((m, x) => Math.max(m, x.sort_order || 0), 0) + 1;
      const res = await supabase.from("rules_sections").insert({ ...payload, sort_order: nextOrder, created_by: me.id }).select("id").single();
      error = res.error;
      focusId.current = res.data?.id || null;
    }
    setBusy(false);
    if (error) { focusId.current = null; showToast("error", editingId ? "Failed to update the chapter" : "Failed to add the chapter"); return; }
    showToast("success", editingId ? "Chapter updated" : "Chapter added");
    closeForm();
    load();
  };

  const deleteItem = async (it) => {
    if (!window.confirm(`Delete the chapter "${it.title}"?`)) return;
    const { error } = await supabase.from("rules_sections").delete().eq("id", it.id);
    if (error) { showToast("error", "Failed to delete the chapter"); return; }
    if (openId === it.id) setOpenId(null);
    showToast("success", "Chapter deleted");
    load();
  };

  const move = async (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next.map((x, i) => ({ ...x, sort_order: i + 1 })));   // show it at once, the server confirms below
    const { error } = await supabase.rpc("reorder_rules", { p_ids: next.map((x) => x.id) });
    if (error) { showToast("error", "Could not save the new order"); load(); return; }
    setTimeout(() => cardRefs.current[next[to].id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  };

  const canCreate = can(me.rank, "rules", "create");
  const canReorder = can(me.rank, "rules", "reorder") && items.length > 1;
  const previewAccent = ruleAccent(accent);

  return (
    <div className="gx-rl">
      <div className="gx-rl-hero">
        <span className="gx-rl-kicker"><Sparkles size={13} /> Sheriff Department</span>
        <h2 className="gx-rl-h1">The Rules</h2>
        <p className="gx-rl-lede">Every chapter is sealed. Tap one to unseal it and read what is inside.</p>
        {canCreate && !formOpen && (
          <div className="gx-rl-add">
            <button type="button" className="gx-btn gx-btn-gold" style={styles.btnGold} onClick={openAdd}><Plus size={15} /> Add chapter</button>
          </div>
        )}
      </div>

      {formOpen && (
        <div ref={formRef} className="gx-glass-card gx-rl-form" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>{editingId ? "Edit Chapter" : "Add Chapter"}</div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 4, direction: "ltr", textAlign: "left" }}>
            <label style={styles.label}>Title</label>
            <input style={styles.input} placeholder="Miranda Rights" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} />
            <label style={styles.label}>Short line under the title</label>
            <input style={styles.input} placeholder="The words every arrest begins with" maxLength={90} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            <label style={styles.label}>Icon</label>
            <div className="gx-rl-pick">
              {Object.entries(RULE_ICONS).map(([k, Ic]) => (
                <button key={k} type="button" title={k} className={icon === k ? "on" : ""} onClick={() => setIcon(k)}><Ic size={18} /></button>
              ))}
            </div>
            <label style={styles.label}>Color</label>
            <div className="gx-rl-pick">
              {RULE_ACCENTS.map((c) => (
                <button key={c} type="button" title={c} className={`sw${accent === c ? " on" : ""}`} style={{ background: c, borderColor: c }} onClick={() => setAccent(c)} />
              ))}
            </div>
            <label style={styles.label}>Who can read this chapter</label>
            <select style={styles.input} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="staff">Staff only (officers)</option>
              <option value="public">Public (also Galaxy Citizen / applicants)</option>
            </select>
            <label style={styles.label}>Rules (one entry per line)</label>
            <textarea
              style={{ ...styles.input, minHeight: 280, resize: "vertical", fontFamily: "Consolas, monospace", lineHeight: 1.6, direction: "ltr", textAlign: "left" }}
              placeholder={"- You have the right to remain silent.\n> Do you understand your rights?"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="gx-rl-help">{RULE_BODY_HELP}</div>
            {body.trim() && (
              <div className="gx-rl-prev" style={{ "--ac": previewAccent }}>
                <RulesBody body={body} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : editingId ? "Save Changes" : "Add"}</button>
              <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loaded && items.length === 0 && <div style={styles.emptyState}>No rules yet</div>}

      <div className="gx-rl-grid">
        {items.map((it, i) => {
          const open = openId === it.id;
          const Icon = RULE_ICONS[it.icon] || Scale;
          const count = parseRules(it.body).filter((x) => x.t !== "h").length;
          const canEdit = canEditItem(me, "rules", it.created_by);
          const canDelete = canDeleteItem(me, "rules", it.created_by);
          return (
            <div key={it.id} ref={(el) => { cardRefs.current[it.id] = el; }} className={`gx-rl-card${open ? " open" : ""}`} style={{ "--ac": ruleAccent(it.accent), animationDelay: `${i * 70}ms` }}>
              <div
                className="gx-rl-top"
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => toggle(it.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(it.id); } }}
              >
                <span className="gx-rl-num">{String(i + 1).padStart(2, "0")}</span>
                <div className="gx-rl-icon"><Icon size={25} strokeWidth={1.8} /></div>
                <div className="gx-rl-tt">
                  <div className="gx-rl-title">{it.title}</div>
                  <div className="gx-rl-sub">{it.subtitle}</div>
                </div>
                <div className="gx-rl-peek" aria-hidden="true"><span /><span /><span /></div>
                <div className="gx-rl-foot">
                  <span className="gx-rl-count">{count} {count === 1 ? "entry" : "entries"}{canCreate || canEdit ? (it.visibility === "public" ? " · Public" : " · Staff only") : ""}</span>
                  <span className="gx-rl-hint">{open ? <><Unlock size={14} /> Unsealed — tap to close</> : <><Lock size={14} /> Tap to reveal</>}</span>
                </div>
              </div>
              {open && (
                <div className="gx-rl-panel">
                  {(canEdit || canDelete || canReorder) && (
                    <div className="gx-rl-bar">
                      {canEdit && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => openEdit(it)}>✎ Edit</button>}
                      {canReorder && i > 0 && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => move(i, -1)}>↑ Move up</button>}
                      {canReorder && i < items.length - 1 && <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} onClick={() => move(i, 1)}>↓ Move down</button>}
                      {canDelete && <button type="button" className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, color: "#E0776A" }} onClick={() => deleteItem(it)}>✕ Delete</button>}
                    </div>
                  )}
                  <RulesBody body={it.body} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CV Sheriff: citizens (rank "Galaxy Citizen") apply to the department; people with the
// "review" permission accept or reject. The database enforces everything (see 20261025_cv_sheriff.sql);
// the status can only change through the review-cv edge function.
// ---------------------------------------------------------------------------
const CV_COOLDOWN_DAYS = 7;   // display only: keep equal to cv_cooldown() in the database
const CV_STATUS = {
  pending: { label: "PENDING", color: "#B7791F" },
  accepted: { label: "ACCEPTED", color: "#2F855A" },
  rejected: { label: "REJECTED", color: "#C53030" },
};
const cvCode = (id) => "CV-" + String(id || "").slice(0, 8).toUpperCase();
const cvDate = (ts) => (ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const cvAgainDate = (cv) => new Date(new Date(cv.reviewed_at || cv.created_at).getTime() + CV_COOLDOWN_DAYS * 86400000);

function CvSheet({ cv, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const st = CV_STATUS[cv.status] || CV_STATUS.pending;
  const again = cv.status === "rejected" ? cvAgainDate(cv) : null;
  const rows = [
    ["Name RP", cv.name_rp], ["Age IRL", cv.age_irl], ["Age RP", cv.age_rp], ["Sex", cv.sex === "female" ? "Female" : "Male"],
    ["Experience", cv.experience], ["Availability", cv.availability], ["Discord ID", cv.discord_id], ["Submitted", cvDate(cv.created_at)],
  ];
  return (
    <div className="gx-cv-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gx-cv-paper" role="dialog" aria-label="CV Sheriff file">
        <button type="button" className="gx-cv-x" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <div className="gx-cv-ph">
          <div className="dept">Sheriff Department</div>
          <div className="ttl">CV Sheriff</div>
          <div className="no">Application file No. {cvCode(cv.id)}</div>
        </div>
        <div className="gx-cv-stamp" style={{ color: st.color }}>{st.label}</div>
        {rows.map(([k, v]) => (
          <div className="gx-cv-f" key={k}><div className="k">{k}</div><div className="v">{String(v ?? "-")}</div></div>
        ))}
        <div className="gx-cv-f"><div className="k">Status</div><div className="v" style={{ color: st.color }}>{st.label}{cv.reviewed_at ? ` · ${cvDate(cv.reviewed_at)}` : ""}</div></div>
        {cv.status === "rejected" && (
          <div className="gx-cv-reason">
            <b>Reason for rejection</b>
            {cv.reject_reason}
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {again > new Date() ? <>You may apply again on <b style={{ display: "inline", color: "#1d1a14", letterSpacing: 0 }}>{cvDate(again)}</b>.</> : "You may apply again now."}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function CvView({ me, showToast }) {
  const reviewer = can(me.rank, "cv", "review");
  const applicant = can(me.rank, "cv", "create") && !reviewer;   // a reviewer (e.g. the Chef Sheriff) does not apply
  if (!reviewer && !applicant) return <div style={styles.content}><div style={styles.emptyState}>Nothing to show here</div></div>;
  return (
    <div className="gx-cv">
      <div className="gx-cv-hero">
        <span className="gx-rl-kicker"><Sparkles size={13} /> Sheriff Department</span>
        <h2>CV Sheriff</h2>
        <p>{reviewer ? "Applications waiting for a decision" : "Apply to join the Sheriff Department"}</p>
      </div>
      {reviewer && <CvReviewBoard me={me} showToast={showToast} />}
      {applicant && <CvApplicantPanel me={me} showToast={showToast} />}
    </div>
  );
}

function CvApplicantPanel({ me, showToast }) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name_rp: "", age_irl: "", age_rp: "", sex: "male", experience: "", availability: "" });

  const load = useCallback(async () => {
    const [list, st] = await Promise.all([
      supabase.from("cv_applications").select("*").order("created_at", { ascending: false }),
      supabase.rpc("cv_apply_status"),
    ]);
    if (!list.error) setItems(list.data || []);
    if (!st.error) setState(st.data);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("cv_applicant_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "cv_applications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const irl = Number(f.age_irl), rp = Number(f.age_rp);
    if (f.name_rp.trim().length < 2) { showToast("error", "Write your RP name"); return; }
    if (!Number.isInteger(irl) || irl < 10 || irl > 99) { showToast("error", "Age IRL must be a number between 10 and 99"); return; }
    if (!Number.isInteger(rp) || rp < 10 || rp > 99) { showToast("error", "Age RP must be a number between 10 and 99"); return; }
    if (!f.experience.trim()) { showToast("error", "Write your experience"); return; }
    if (!f.availability.trim()) { showToast("error", "Write your availability"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("submit_cv", {
      p_name_rp: f.name_rp, p_age_irl: irl, p_age_rp: rp, p_sex: f.sex, p_experience: f.experience, p_availability: f.availability,
    });
    setBusy(false);
    if (error) {
      console.error("submit cv error:", error);
      showToast("error", String(error.message || "").startsWith("cannot apply") ? "You cannot send a CV right now" : "Could not send the CV. Check the fields and try again");
      load();
      return;
    }
    setF({ name_rp: "", age_irl: "", age_rp: "", sex: "male", experience: "", availability: "" });
    showToast("success", "CV sent");
    load();
  };

  const remove = async (cv) => {
    if (!window.confirm("Delete this request?")) return;
    const { error } = await supabase.rpc("delete_my_cv", { p_id: cv.id });
    if (error) { showToast("error", "Could not delete the request"); return; }
    if (openId === cv.id) setOpenId(null);
    showToast("success", "Request deleted");
    load();
  };

  const open = items.find((x) => x.id === openId);
  const reason = state?.reason;
  return (
    <>
      {state?.can_apply && (
        <div className="gx-glass-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>Your CV</div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="gx-cv-grid">
              <div><label style={styles.label}>Name RP</label><input style={styles.input} placeholder="islam chawi" maxLength={60} value={f.name_rp} onChange={set("name_rp")} /></div>
              <div><label style={styles.label}>Discord ID</label><input style={{ ...styles.input, opacity: .7 }} value={me.discord_id || ""} readOnly disabled /></div>
              <div><label style={styles.label}>Age IRL</label><input style={styles.input} inputMode="numeric" placeholder="20" maxLength={2} value={f.age_irl} onChange={set("age_irl")} /></div>
              <div><label style={styles.label}>Age RP</label><input style={styles.input} inputMode="numeric" placeholder="21" maxLength={2} value={f.age_rp} onChange={set("age_rp")} /></div>
              <div><label style={styles.label}>Sex</label>
                <select style={styles.input} value={f.sex} onChange={set("sex")}><option value="male">Male</option><option value="female">Female</option></select>
              </div>
              <div><label style={styles.label}>Availability</label><input style={styles.input} placeholder="5h" maxLength={100} value={f.availability} onChange={set("availability")} /></div>
              <div className="full"><label style={styles.label}>Experience</label>
                <textarea style={{ ...styles.input, minHeight: 110, resize: "vertical" }} placeholder="Experience - Responsable - respectful" maxLength={1500} value={f.experience} onChange={set("experience")} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}><button className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy}>{busy ? "..." : "Send CV"}</button></div>
          </form>
        </div>
      )}
      {state && !state.can_apply && reason === "pending" && <div className="gx-cv-note">Your CV is waiting for a decision. You will see the result here.</div>}
      {state && !state.can_apply && reason === "cooldown" && <div className="gx-cv-note bad">You can send a new CV on <b>{cvDate(state.next_apply_at)}</b>.</div>}
      {state && !state.can_apply && reason === "accepted" && <div className="gx-cv-note good">Your CV was accepted. The next step is announced in Discord.</div>}
      {state && !state.can_apply && reason === "no_discord" && <div className="gx-cv-note bad">Your account is not linked to Discord. Sign out and sign in with Discord again.</div>}

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((cv) => {
            const st = CV_STATUS[cv.status] || CV_STATUS.pending;
            return (
              <div className="gx-cv-row" key={cv.id}>
                <div className="t"><b>CV Sheriff</b><span>{cvCode(cv.id)} · {cvDate(cv.created_at)}</span></div>
                <span className="gx-cv-pill" style={{ color: st.color }}>{st.label}</span>
                <button type="button" className="gx-cv-eye" title="Open the file" aria-label="Open the file" onClick={() => setOpenId(cv.id)}><Eye size={18} /></button>
                {cv.status !== "accepted" && (
                  <button type="button" className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, color: "#E0776A" }} onClick={() => remove(cv)}>Delete</button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {open && <CvSheet cv={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function CvReviewBoard({ me, showToast }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [openId, setOpenId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("cv_applications").select("*").order("created_at", { ascending: false });
    if (!error) setItems(data || []);
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("cv_review_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "cv_applications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // reviewers who also hold the citizen "create" switch: their own file is listed in their own panel, not here
  const shown = items.filter((x) => x.applicant_id !== me.id && (filter === "all" || x.status === filter));
  const open = items.find((x) => x.id === openId);
  const closeSheet = () => { setOpenId(null); setRejecting(false); setReason(""); };

  const decide = async (decision) => {
    if (!open || busy) return;
    if (decision === "reject" && reason.trim().length < 3) { showToast("error", "Write the rejection reason"); return; }
    setBusy(true);
    const { error } = await supabase.functions.invoke("review-cv", { body: { id: open.id, decision, reason: reason.trim() } });
    setBusy(false);
    if (error) {
      const info = await readFnError(error);
      showToast("error", info?.message || "Could not save the decision");
      load();
      return;
    }
    showToast("success", decision === "accept" ? "Accepted. The Discord role was given" : "Rejected");
    closeSheet();
    load();
  };

  return (
    <>
      <div style={styles.filterRow}>
        {["pending", "accepted", "rejected", "all"].map((s) => (
          <button key={s} className="gx-btn gx-filter-btn" style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : CV_STATUS[s].label.charAt(0) + CV_STATUS[s].label.slice(1).toLowerCase()}
            {" "}({items.filter((x) => x.applicant_id !== me.id && (s === "all" || x.status === s)).length})
          </button>
        ))}
      </div>
      {loaded && shown.length === 0 && <div style={styles.emptyState}>No applications here</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map((cv) => {
          const st = CV_STATUS[cv.status] || CV_STATUS.pending;
          return (
            <div className="gx-cv-row" key={cv.id}>
              <div className="t"><b>{cv.name_rp}</b><span>{cvCode(cv.id)} · {cvDate(cv.created_at)} · {cv.age_irl} IRL / {cv.age_rp} RP</span></div>
              <span className="gx-cv-pill" style={{ color: st.color }}>{st.label}</span>
              <button type="button" className="gx-cv-eye" title="Open the file" aria-label="Open the file" onClick={() => setOpenId(cv.id)}><Eye size={18} /></button>
            </div>
          );
        })}
      </div>
      {open && (
        <CvSheet cv={open} onClose={closeSheet}>
          {open.status === "pending" && (
            <>
              {rejecting && (
                <div style={{ marginTop: 14 }}>
                  <label style={{ ...styles.label, color: "#5a4a22" }}>Reason for rejection (the applicant will read it)</label>
                  <textarea style={{ ...styles.input, minHeight: 80, resize: "vertical" }} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
              )}
              <div className="gx-cv-actions">
                {!rejecting ? (
                  <>
                    <button type="button" className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy} onClick={() => decide("accept")}>{busy ? "..." : "Accept"}</button>
                    <button type="button" className="gx-btn gx-btn-ghost" style={{ ...styles.btnGhost, color: "#9b2c2c" }} disabled={busy} onClick={() => setRejecting(true)}>Reject</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="gx-btn gx-btn-gold" style={styles.btnGold} disabled={busy} onClick={() => decide("reject")}>{busy ? "..." : "Confirm rejection"}</button>
                    <button type="button" className="gx-btn gx-btn-ghost" style={styles.btnGhost} disabled={busy} onClick={() => { setRejecting(false); setReason(""); }}>Back</button>
                  </>
                )}
              </div>
            </>
          )}
        </CvSheet>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard: a podium chosen BY HAND. Nothing is counted or calculated.
// Whoever has the permission room "leaderboard" -> "manage" puts officers on the places; everybody sees them.
// The data comes from get_leaderboard() (so ranks that cannot read other profiles still see the podium).
// ---------------------------------------------------------------------------
const LB_PLACES = [1, 2, 3];
const LB_ACCENT = { 1: "244,199,68", 2: "199,194,181", 3: "184,131,74" };   // gold, silver, bronze
const LB_ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd" };

// A card that leans towards the pointer; its layers sit at different depths so it feels solid
function TiltCard({ place, linkable, onOpen, children }) {
  const ref = useRef(null);
  const calm = useRef(false);
  useEffect(() => {
    calm.current = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const move = (e) => {
    const el = ref.current;
    if (!el || calm.current) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.style.setProperty("--ry", `${((x - 0.5) * 24).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * 20).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.classList.add("is-live");
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.classList.remove("is-live");
  };

  return (
    <div
      ref={ref}
      className={`gx-lb-card${linkable ? " is-link" : ""}`}
      style={{ "--accent-rgb": LB_ACCENT[place] }}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
      onClick={linkable ? onOpen : undefined}
      onKeyDown={linkable ? (e) => { if (e.key === "Enter") onOpen(); } : undefined}
      tabIndex={linkable ? 0 : undefined}
      role={linkable ? "button" : undefined}
    >
      {children}
      <div className="gx-lb-glare" />
    </div>
  );
}

function PodiumBoard({ board, title, data, editing, linkable, onOpenProfile, onPick, onClear }) {
  return (
    <section className="gx-lb-board">
      <div className="gx-lb-title">{title}</div>
      <div className="gx-lb-stage">
        {LB_PLACES.map((place) => {
          const o = data[place];
          const big = place === 1;
          return (
            <div key={place} className="gx-lb-slot" data-place={place}>
              {o ? (
                <TiltCard place={place} linkable={linkable} onOpen={() => onOpenProfile && onOpenProfile(o.officer_id)}>
                  <div className="gx-lb-place">{place}</div>
                  <Medal className="gx-lb-medal" size={big ? 36 : 28} color={`rgb(${LB_ACCENT[place]})`} />
                  <div className="gx-lb-avatar"><Avatar url={o.avatar_url} name={o.name} size={big ? 92 : 72} /></div>
                  <div className="gx-lb-name">{o.name}</div>
                  <div className="gx-lb-rank">{o.rank}</div>
                  {o.badge && <div className="gx-lb-badge">#{o.badge}</div>}
                </TiltCard>
              ) : (
                <div className="gx-lb-card gx-lb-empty" style={{ "--accent-rgb": LB_ACCENT[place] }}>
                  <div className="gx-lb-place">{place}</div>
                  <div className="gx-lb-empty-text">Not chosen yet</div>
                </div>
              )}
              {editing && (
                <div className="gx-lb-actions">
                  <button type="button" style={styles.btnGold} onClick={() => onPick(board, place)}>{o ? "Change" : <><Plus size={14} /> Choose</>}</button>
                  {o && <button type="button" style={styles.btnGhost} onClick={() => onClear(board, place)}>Remove</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// The list a permitted officer picks from
function PodiumPicker({ board, place, taken, onClose, onChoose }) {
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    supabase.rpc("leaderboard_candidates").then(({ data, error }) => {
      if (!alive) return;
      if (error) console.error("leaderboard candidates error:", error);
      setList(error ? [] : data || []);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const shown = (list || []).filter((o) => !needle || `${o.name} ${o.badge || ""} ${o.rank}`.toLowerCase().includes(needle));

  return (
    <div className="gx-lb-modal-bg" onClick={onClose}>
      <div className="gx-lb-modal gx-glass-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="gx-lb-modal-head">
          <div>
            <div className="gx-lb-modal-title">{LB_ORDINAL[place]} place</div>
            <div className="gx-lb-modal-sub">{board === "overall" ? "Overall Rankings (All Time)" : "Top Sheriff Week"}</div>
          </div>
          <button type="button" style={styles.iconBtnSmall} onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>
        <div style={{ ...styles.searchBox, marginBottom: 10 }}>
          <Search size={15} color="#8A8579" />
          <input autoFocus style={styles.searchInput} placeholder="Search by name, badge or rank" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="gx-lb-modal-list">
          {list === null && <div style={styles.emptyState}>Loading…</div>}
          {list !== null && shown.length === 0 && <div style={styles.emptyState}>No officer found</div>}
          {shown.map((o) => (
            <button type="button" key={o.id} className="gx-lb-pick" onClick={() => onChoose(o.id)}>
              <Avatar url={o.avatar_url} name={o.name} size={36} />
              <span className="gx-lb-pick-text">
                <span className="gx-lb-pick-name">{o.name}</span>
                <span className="gx-lb-pick-rank">{o.rank}{o.badge ? ` · #${o.badge}` : ""}</span>
              </span>
              {taken[o.id] && <span className="gx-lb-pick-tag">{taken[o.id] === place ? "Here now" : `Now ${LB_ORDINAL[taken[o.id]]}`}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ me, showToast, onOpenProfile }) {
  const [picks, setPicks] = useState({ overall: {}, week: {} });
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(null);   // { board, place }
  const canManage = can(me.rank, "leaderboard", "manage");
  const linkable = canSeeRoom(me.rank, "officers");   // opening someone's profile needs the officers room

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_leaderboard");
    if (error) { console.error("leaderboard error:", error); return; }
    const next = { overall: {}, week: {} };
    (data || []).forEach((r) => { if (next[r.board]) next[r.board][r.place] = r; });
    setPicks((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);

  // A small database read: the podium shows what was chosen within seconds, with no refresh
  useEffect(() => {
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, 15000);
    window.addEventListener("focus", load);
    return () => { clearInterval(timer); window.removeEventListener("focus", load); };
  }, [load]);

  const save = async (board, place, officerId) => {
    const { error } = await supabase.rpc("set_leaderboard_pick", { p_board: board, p_place: place, p_officer: officerId });
    if (error) {
      console.error("set leaderboard pick error:", error);
      showToast("error", "Could not save the podium");
      return;
    }
    showToast("success", officerId ? "Podium updated" : "Place cleared");
    load();
  };

  const takenFor = (board) => {
    const map = {};
    Object.values(picks[board] || {}).forEach((r) => { map[r.officer_id] = r.place; });
    return map;
  };

  return (
    <div style={styles.content} className="gx-lb">
      {canManage && (
        <div className="gx-lb-top">
          <div className="gx-lb-hint">{editing ? "Choose who stands on each place. Everybody sees the change within seconds." : ""}</div>
          <button type="button" style={editing ? styles.btnGold : styles.btnGhost} onClick={() => setEditing((v) => !v)}>
            {editing ? "Done" : "Edit podium"}
          </button>
        </div>
      )}

      <PodiumBoard board="overall" title="Overall Rankings (All Time)" data={picks.overall} editing={editing}
        linkable={linkable} onOpenProfile={onOpenProfile} onPick={(board, place) => setPicking({ board, place })} onClear={(board, place) => save(board, place, null)} />
      <PodiumBoard board="week" title="Top Sheriff Week" data={picks.week} editing={editing}
        linkable={linkable} onOpenProfile={onOpenProfile} onPick={(board, place) => setPicking({ board, place })} onClear={(board, place) => save(board, place, null)} />

      {picking && (
        <PodiumPicker board={picking.board} place={picking.place} taken={takenFor(picking.board)}
          onClose={() => setPicking(null)}
          onChoose={async (officerId) => { const p = picking; setPicking(null); await save(p.board, p.place, officerId); }} />
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
      const { data: officers } = await supabase.from("profiles").select("*").neq("rank", CITIZEN_RANK);
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
};
