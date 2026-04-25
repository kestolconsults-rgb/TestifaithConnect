import React, { useState } from "react";
import {
  Heart,
  Search,
  Plus,
  Bell,
  User,
  MessageCircle,
  BookOpen,
  Wifi,
  Battery,
  Signal,
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Unified() {
  const [dark, setDark] = useState(true);

  const t = dark
    ? {
        bg: "#09090b",
        bgCard: "#121214",
        bgCardAlt: "#0f0f11",
        bgFeatured: "#18181b",
        bgBar: "rgba(10,10,12,0.92)",
        bgDecl: "rgba(120,53,15,0.18)",
        declBorder: "rgba(180,83,9,0.25)",
        declTag: "rgba(180,83,9,0.25)",
        declTagText: "#fbbf24",
        declTitle: "#fde68a",
        declVerse: "#d97706",
        text: "#fafafa",
        textSub: "#a1a1aa",
        textMuted: "#52525b",
        textCard: "#d4d4d8",
        bar: "#27272a",
        barText: "#71717a",
        activeTab: "#ef4444",
        featuredAccent: "linear-gradient(90deg,rgba(239,68,68,0.15),#ef4444,rgba(239,68,68,0.15))",
        featuredBg: "#18181b",
        featuredBorder: "rgba(63,63,70,0.5)",
        cardBorder: "rgba(63,63,70,0.4)",
        badgeBg: "rgba(239,68,68,0.1)",
        badgeText: "#f87171",
        badgeBorder: "rgba(239,68,68,0.2)",
        postBorder: "#0a0a0c",
        statusText: "#71717a",
        avatarBg: "#3f3f46",
        avatarText: "#d4d4d8",
        sectionHead: "#fff",
        titleColor: "#fafafa",
      }
    : {
        bg: "#FAFAF8",
        bgCard: "#ffffff",
        bgCardAlt: "#ffffff",
        bgFeatured: "#fff7ed",
        bgBar: "rgba(255,255,255,0.92)",
        bgDecl: "#fffbeb",
        declBorder: "#fde68a",
        declTag: "#fde68a",
        declTagText: "#92400e",
        declTitle: "#1c1917",
        declVerse: "#b45309",
        text: "#0f172a",
        textSub: "#64748b",
        textMuted: "#94a3b8",
        textCard: "#334155",
        bar: "#f1f5f9",
        barText: "#94a3b8",
        activeTab: "#ef4444",
        featuredAccent: "linear-gradient(90deg,rgba(239,68,68,0.1),#ef4444,rgba(239,68,68,0.1))",
        featuredBg: "#fff7ed",
        featuredBorder: "#fed7aa",
        cardBorder: "#f1f5f9",
        badgeBg: "rgba(239,68,68,0.08)",
        badgeText: "#ef4444",
        badgeBorder: "rgba(239,68,68,0.15)",
        postBorder: "#FAFAF8",
        statusText: "#64748b",
        avatarBg: "#e2e8f0",
        avatarText: "#475569",
        sectionHead: "#0f172a",
        titleColor: "#0f172a",
      };

  return (
    <div
      className="w-[390px] h-[844px] overflow-hidden flex flex-col relative shadow-2xl rounded-[3rem] border-[8px] border-black mx-auto"
      style={{ background: t.bg, color: t.text, fontFamily: "sans-serif" }}
    >
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 text-xs font-medium" style={{ color: t.statusText }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-1 pb-3">
        <div>
          <img
            src={dark ? "/__mockup/images/logo-dark.png" : "/__mockup/images/logo-light.png"}
            alt="Testifaith"
            style={{ height: dark ? "44px" : "56px", width: "auto" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full border"
            style={{ borderColor: dark ? "#27272a" : "#e2e8f0", background: dark ? "#18181b" : "#fff" }}
          >
            <Bell className="w-5 h-5" style={{ color: t.textSub }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2" style={{ borderColor: t.bg }} />
          </button>
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-all"
            style={{ borderColor: dark ? "#27272a" : "#e2e8f0", background: dark ? "#18181b" : "#fff" }}
            title="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5 space-y-5 hide-scrollbar">

        {/* Daily Declaration */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden border"
          style={{ background: t.bgDecl, borderColor: t.declBorder }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen size={56} style={{ color: t.declVerse }} />
          </div>
          <div className="relative z-10">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-block mb-3"
              style={{ background: t.declTag, color: t.declTagText }}
            >
              Daily Declaration
            </span>
            <p className="font-['League_Spartan'] text-[17px] leading-snug mb-2 font-semibold" style={{ color: t.declTitle }}>
              "I am healed by His stripes. Sickness has no place in my body, for I am a temple of the Holy Spirit."
            </p>
            <p className="text-xs font-medium" style={{ color: t.declVerse }}>— Isaiah 53:5</p>
          </div>
        </div>

        {/* Testimony of the Day */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-['League_Spartan'] text-base font-semibold" style={{ color: t.sectionHead }}>Testimony of the Day</h2>
          </div>
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ background: t.featuredBg, borderColor: t.featuredBorder }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: t.featuredAccent }} />
            <div className="flex justify-between items-start mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{ background: t.badgeBg, color: t.badgeText, borderColor: t.badgeBorder }}
              >
                Healing
              </span>
              <span className="text-xs" style={{ color: t.textMuted }}>2h ago</span>
            </div>
            <p className="text-base leading-relaxed italic mb-4 font-serif" style={{ color: dark ? "#e4e4e7" : "#1c1917" }}>
              "Three weeks ago, doctors said there was no hope. Last Tuesday, I walked out of that hospital healed. The tumor is completely gone."
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8" style={{ border: `1px solid ${t.cardBorder}` }}>
                  <AvatarFallback style={{ background: t.avatarBg, color: t.avatarText, fontSize: "10px" }}>SJ</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium" style={{ color: t.textCard }}>Sarah Jenkins</span>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: dark ? "rgba(63,63,70,0.4)" : "#fef2f2", color: dark ? "#d4d4d8" : "#ef4444" }}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                <span className="text-xs font-semibold">1.2k Amen</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['League_Spartan'] text-base font-semibold" style={{ color: t.sectionHead }}>Recent Testimonies</h2>
            <button className="text-xs font-medium text-red-500">View all</button>
          </div>

          {/* Card 1 */}
          <div className="rounded-2xl p-4 border" style={{ background: t.bgCard, borderColor: t.cardBorder }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9">
                  <AvatarFallback style={{ background: dark ? "#3f3f46" : "#d1fae5", color: dark ? "#d4d4d8" : "#065f46", fontWeight: 700, fontSize: "11px" }}>MK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold" style={{ color: t.text }}>Marcus K.</p>
                  <p className="text-[10px]" style={{ color: t.textMuted }}>5h ago</p>
                </div>
              </div>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ background: dark ? "rgba(59,130,246,0.12)" : "#eff6ff", color: dark ? "#93c5fd" : "#2563eb" }}
              >
                Finance
              </span>
            </div>
            <p className="font-['League_Spartan'] text-sm font-bold mb-1.5" style={{ color: t.titleColor }}>Unexpected check in the mail!</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: t.textCard }}>
              We were short on rent and had prayed as a family. A check arrived for the exact amount we needed. God is so faithful!
            </p>
            <div className="flex gap-4 pt-2.5 border-t" style={{ borderColor: dark ? "#27272a" : "#f1f5f9" }}>
              <button className="flex items-center gap-1.5" style={{ color: t.barText }}>
                <Heart className="w-4 h-4" />
                <span className="text-xs">342</span>
              </button>
              <button className="flex items-center gap-1.5" style={{ color: t.barText }}>
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">24</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-4 border" style={{ background: t.bgCard, borderColor: t.cardBorder }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9">
                  <AvatarFallback style={{ background: dark ? "#3f3f46" : "#f3e8ff", color: dark ? "#d4d4d8" : "#7e22ce", fontWeight: 700, fontSize: "11px" }}>EJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold" style={{ color: t.text }}>Elena J.</p>
                  <p className="text-[10px]" style={{ color: t.textMuted }}>12h ago</p>
                </div>
              </div>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ background: dark ? "rgba(34,197,94,0.12)" : "#f0fdf4", color: dark ? "#86efac" : "#16a34a" }}
              >
                Healing
              </span>
            </div>
            <p className="font-['League_Spartan'] text-sm font-bold mb-1.5" style={{ color: t.titleColor }}>Clear scans after 6 months</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: t.textCard }}>
              Just back from the oncologist — scans completely clear. The doctors call it remarkable, but we know who the Great Physician is.
            </p>
            <div className="flex gap-4 pt-2.5 border-t" style={{ borderColor: dark ? "#27272a" : "#f1f5f9" }}>
              <button className="flex items-center gap-1.5" style={{ color: t.barText }}>
                <Heart className="w-4 h-4" />
                <span className="text-xs">891</span>
              </button>
              <button className="flex items-center gap-1.5" style={{ color: t.barText }}>
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">56</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Tab Bar */}
      <div
        className="absolute bottom-0 w-full backdrop-blur-md border-t pb-8 pt-3 px-6 z-20"
        style={{ background: t.bgBar, borderColor: dark ? "rgba(63,63,70,0.5)" : "#f1f5f9" }}
      >
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 p-1" style={{ color: t.activeTab }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-1" style={{ color: t.barText }}>
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <div className="relative -top-5">
            <button
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white border-4 shadow-lg"
              style={{ borderColor: t.bg, boxShadow: "0 8px 20px -4px rgba(239,68,68,0.45)" }}
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          <button className="flex flex-col items-center gap-1 p-1" style={{ color: t.barText }}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Bible</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-1" style={{ color: t.barText }}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
