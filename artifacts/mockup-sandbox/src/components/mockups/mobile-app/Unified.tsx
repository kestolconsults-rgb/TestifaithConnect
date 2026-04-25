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
  Lock,
  Feather,
  Sparkles,
  HelpCircle,
  Globe,
  Play,
  Filter,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Tab = "home" | "community" | "bible" | "profile";

export function Unified() {
  const [dark, setDark] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const t = dark
    ? {
        bg: "#09090b",
        bgCard: "#121214",
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
        barText: "#71717a",
        activeTab: "#ef4444",
        featuredAccent: "linear-gradient(90deg,rgba(239,68,68,0.15),#ef4444,rgba(239,68,68,0.15))",
        featuredBg: "#18181b",
        featuredBorder: "rgba(63,63,70,0.5)",
        cardBorder: "rgba(63,63,70,0.4)",
        badgeBg: "rgba(239,68,68,0.1)",
        badgeText: "#f87171",
        badgeBorder: "rgba(239,68,68,0.2)",
        statusText: "#71717a",
        avatarBg: "#3f3f46",
        avatarText: "#d4d4d8",
        sectionHead: "#fff",
        titleColor: "#fafafa",
        privateBg: "rgba(59,130,246,0.06)",
        privateBorder: "rgba(59,130,246,0.18)",
        privateLock: "#60a5fa",
        divider: "#27272a",
        fabScrim: "rgba(0,0,0,0.75)",
        inputBg: "#18181b",
        inputBorder: "#27272a",
        chipBg: "#1c1c1f",
        chipBorder: "#3f3f46",
        chipActive: "#ef4444",
        chipActiveText: "#fff",
        chipText: "#a1a1aa",
        videoBg: "#1c1c1f",
        videoOverlay: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
      }
    : {
        bg: "#FAFAF8",
        bgCard: "#ffffff",
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
        barText: "#94a3b8",
        activeTab: "#ef4444",
        featuredAccent: "linear-gradient(90deg,rgba(239,68,68,0.1),#ef4444,rgba(239,68,68,0.1))",
        featuredBg: "#fff7ed",
        featuredBorder: "#fed7aa",
        cardBorder: "#f1f5f9",
        badgeBg: "rgba(239,68,68,0.08)",
        badgeText: "#ef4444",
        badgeBorder: "rgba(239,68,68,0.15)",
        statusText: "#64748b",
        avatarBg: "#e2e8f0",
        avatarText: "#475569",
        sectionHead: "#0f172a",
        titleColor: "#0f172a",
        privateBg: "#eff6ff",
        privateBorder: "#bfdbfe",
        privateLock: "#3b82f6",
        divider: "#f1f5f9",
        fabScrim: "rgba(0,0,0,0.4)",
        inputBg: "#fff",
        inputBorder: "#e2e8f0",
        chipBg: "#f1f5f9",
        chipBorder: "#e2e8f0",
        chipActive: "#ef4444",
        chipActiveText: "#fff",
        chipText: "#64748b",
        videoBg: "#e2e8f0",
        videoOverlay: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
      };

  const categories = ["All", "Healing", "Finance", "Marriage", "Breakthrough", "Deliverance", "Fruitfulness"];

  const fabActions = [
    { icon: <Feather className="w-5 h-5" />, label: "Journal Your Faith", sublabel: "Log what God has done", color: "#ef4444" },
    { icon: <Sparkles className="w-5 h-5" />, label: "Get Encouraged", sublabel: "Receive a word for today", color: "#f59e0b" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Ask a Question", sublabel: "Seek clarity in faith", color: "#8b5cf6" },
  ];

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
          {activeTab === "community" ? (
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-500" />
                <span className="font-['League_Spartan'] text-xl font-bold" style={{ color: t.text }}>Community</span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>Stories from the body of Christ</p>
            </div>
          ) : (
            <img
              src={dark ? "/__mockup/images/logo-dark.png" : "/__mockup/images/logo-light.png"}
              alt="Testifaith"
              style={{ height: dark ? "44px" : "56px", width: "auto" }}
            />
          )}
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
          >
            {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* ── HOME TAB ─────────────────────────────── */}
      {activeTab === "home" && (
        <div className="flex-1 overflow-y-auto pb-28 px-5 space-y-5 hide-scrollbar">

          {/* Daily Declaration */}
          <div className="rounded-2xl p-4 relative overflow-hidden border" style={{ background: t.bgDecl, borderColor: t.declBorder }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BookOpen size={56} style={{ color: t.declVerse }} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-block mb-3" style={{ background: t.declTag, color: t.declTagText }}>
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
            <h2 className="font-['League_Spartan'] text-base font-semibold mb-2.5" style={{ color: t.sectionHead }}>Testimony of the Day</h2>
            <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ background: t.featuredBg, borderColor: t.featuredBorder }}>
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: t.featuredAccent }} />
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" style={{ background: t.badgeBg, color: t.badgeText, borderColor: t.badgeBorder }}>Healing</span>
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: dark ? "rgba(63,63,70,0.4)" : "#fef2f2", color: dark ? "#d4d4d8" : "#ef4444" }}>
                  <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                  <span className="text-xs font-semibold">1.2k Amen</span>
                </button>
              </div>
            </div>
          </section>

          {/* God's Faithfulness — private */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: t.privateLock }} />
                <h2 className="font-['League_Spartan'] text-base font-semibold" style={{ color: t.sectionHead }}>God's Faithfulness in the Past</h2>
              </div>
              <button className="text-xs font-medium" style={{ color: t.privateLock }}>See all</button>
            </div>
            <p className="text-xs -mt-2" style={{ color: t.textMuted }}>Your private faith journal — only visible to you</p>

            <div className="rounded-2xl p-4 border" style={{ background: t.privateBg, borderColor: t.privateBorder }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: dark ? "rgba(59,130,246,0.15)" : "#dbeafe", color: dark ? "#93c5fd" : "#1d4ed8" }}>Breakthrough</span>
                <span className="text-[10px]" style={{ color: t.textMuted }}>Mar 3, 2025</span>
              </div>
              <p className="font-['League_Spartan'] text-sm font-bold mb-1" style={{ color: t.titleColor }}>The job offer I prayed 8 months for</p>
              <p className="text-xs leading-relaxed" style={{ color: t.textCard }}>Lord, I remember the day you said "wait." Today the call came. You are never late.</p>
            </div>

            <div className="rounded-2xl p-4 border" style={{ background: t.privateBg, borderColor: t.privateBorder }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: dark ? "rgba(59,130,246,0.15)" : "#dbeafe", color: dark ? "#93c5fd" : "#1d4ed8" }}>Healing</span>
                <span className="text-[10px]" style={{ color: t.textMuted }}>Jan 18, 2025</span>
              </div>
              <p className="font-['League_Spartan'] text-sm font-bold mb-1" style={{ color: t.titleColor }}>Mum's recovery — the miracle I journaled</p>
              <p className="text-xs leading-relaxed" style={{ color: t.textCard }}>Six months of prayer. Doctors were baffled. I knew it was God. This one's just between me and Him.</p>
            </div>
          </section>
        </div>
      )}

      {/* ── COMMUNITY TAB ────────────────────────── */}
      {activeTab === "community" && (
        <div className="flex-1 overflow-y-auto pb-28 px-5 space-y-4 hide-scrollbar">

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: t.textMuted }} />
            <span className="text-sm" style={{ color: t.textMuted }}>Search testimonies…</span>
            <div className="ml-auto">
              <Filter className="w-4 h-4" style={{ color: t.textMuted }} />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all"
                style={{
                  background: selectedCategory === cat ? t.chipActive : t.chipBg,
                  borderColor: selectedCategory === cat ? t.chipActive : t.chipBorder,
                  color: selectedCategory === cat ? t.chipActiveText : t.chipText,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Testimony */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-['League_Spartan'] text-base font-semibold" style={{ color: t.sectionHead }}>Video Testimonies</h2>
              <button className="text-xs font-medium text-red-500">See all</button>
            </div>

            {/* Video Card 1 */}
            <div className="rounded-2xl overflow-hidden border mb-3 relative" style={{ borderColor: t.cardBorder }}>
              <div className="relative h-40 flex items-center justify-center" style={{ background: dark ? "#1c1c1f" : "#cbd5e1" }}>
                <div className="absolute inset-0" style={{ background: t.videoOverlay }} />
                <div className="w-14 h-14 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(239,68,68,0.9)" }}>
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
                <div className="absolute bottom-3 left-4 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(239,68,68,0.85)" }}>Healing</span>
                </div>
                <div className="absolute bottom-3 right-4 z-10 text-white text-xs font-medium">2:47</div>
              </div>
              <div className="p-3" style={{ background: t.bgCard }}>
                <p className="font-['League_Spartan'] text-sm font-bold mb-1" style={{ color: t.titleColor }}>My cancer healing testimony</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback style={{ background: t.avatarBg, color: t.avatarText, fontSize: "9px" }}>SJ</AvatarFallback>
                    </Avatar>
                    <span className="text-xs" style={{ color: t.textSub }}>Sarah Jenkins</span>
                  </div>
                  <button className="flex items-center gap-1" style={{ color: t.barText }}>
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs">1.2k</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Text Testimonies */}
          <section className="space-y-3">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-['League_Spartan'] text-base font-semibold" style={{ color: t.sectionHead }}>Read Testimonies</h2>
              <button className="text-xs font-medium text-red-500">See all</button>
            </div>

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
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: dark ? "rgba(59,130,246,0.12)" : "#eff6ff", color: dark ? "#93c5fd" : "#2563eb" }}>Finance</span>
              </div>
              <p className="font-['League_Spartan'] text-sm font-bold mb-1.5" style={{ color: t.titleColor }}>Unexpected check in the mail!</p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: t.textCard }}>
                We were short on rent and had prayed as a family. A check arrived for the exact amount we needed. God is so faithful!
              </p>
              <div className="flex gap-4 pt-2.5 border-t" style={{ borderColor: t.divider }}>
                <button className="flex items-center gap-1.5" style={{ color: t.barText }}><Heart className="w-4 h-4" /><span className="text-xs">342</span></button>
                <button className="flex items-center gap-1.5" style={{ color: t.barText }}><MessageCircle className="w-4 h-4" /><span className="text-xs">24</span></button>
              </div>
            </div>

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
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: dark ? "rgba(34,197,94,0.12)" : "#f0fdf4", color: dark ? "#86efac" : "#16a34a" }}>Healing</span>
              </div>
              <p className="font-['League_Spartan'] text-sm font-bold mb-1.5" style={{ color: t.titleColor }}>Clear scans after 6 months</p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: t.textCard }}>
                Just back from the oncologist — scans completely clear. The doctors call it remarkable, but we know who the Great Physician is.
              </p>
              <div className="flex gap-4 pt-2.5 border-t" style={{ borderColor: t.divider }}>
                <button className="flex items-center gap-1.5" style={{ color: t.barText }}><Heart className="w-4 h-4" /><span className="text-xs">891</span></button>
                <button className="flex items-center gap-1.5" style={{ color: t.barText }}><MessageCircle className="w-4 h-4" /><span className="text-xs">56</span></button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── BIBLE TAB placeholder ─────────────────── */}
      {activeTab === "bible" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
          <BookOpen className="w-12 h-12" style={{ color: t.textMuted }} />
          <p className="font-['League_Spartan'] text-xl font-semibold text-center" style={{ color: t.sectionHead }}>Bible</p>
          <p className="text-sm text-center" style={{ color: t.textMuted }}>Read, search and study Scripture alongside your testimonies</p>
        </div>
      )}

      {/* ── PROFILE TAB placeholder ───────────────── */}
      {activeTab === "profile" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
          <User className="w-12 h-12" style={{ color: t.textMuted }} />
          <p className="font-['League_Spartan'] text-xl font-semibold text-center" style={{ color: t.sectionHead }}>Profile</p>
          <p className="text-sm text-center" style={{ color: t.textMuted }}>Your faith journey, stats, and settings all in one place</p>
        </div>
      )}

      {/* FAB Scrim */}
      {fabOpen && (
        <div className="absolute inset-0 z-30" style={{ background: t.fabScrim, backdropFilter: "blur(2px)" }} onClick={() => setFabOpen(false)} />
      )}

      {/* FAB Action Menu */}
      {fabOpen && (
        <div className="absolute bottom-32 left-0 right-0 px-5 z-40 flex flex-col gap-3">
          {fabActions.map((action) => (
            <div
              key={action.label}
              className="flex items-center gap-4 rounded-2xl p-4 border"
              style={{ background: dark ? "#18181b" : "#fff", borderColor: dark ? "rgba(63,63,70,0.6)" : "#e2e8f0" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: action.color + "1a", color: action.color }}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: t.text }}>{action.label}</p>
                <p className="text-xs" style={{ color: t.textSub }}>{action.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Tab Bar */}
      <div
        className="absolute bottom-0 w-full backdrop-blur-md border-t pb-8 pt-3 px-6 z-20"
        style={{ background: t.bgBar, borderColor: dark ? "rgba(63,63,70,0.5)" : "#f1f5f9" }}
      >
        <div className="flex justify-between items-center">
          <button onClick={() => { setActiveTab("home"); setFabOpen(false); }} className="flex flex-col items-center gap-1 p-1" style={{ color: activeTab === "home" ? t.activeTab : t.barText }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button onClick={() => { setActiveTab("community"); setFabOpen(false); }} className="flex flex-col items-center gap-1 p-1" style={{ color: activeTab === "community" ? t.activeTab : t.barText }}>
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Community</span>
          </button>
          <div className="relative -top-5">
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white border-4 shadow-lg transition-transform"
              style={{
                background: fabOpen ? "#dc2626" : "#ef4444",
                borderColor: t.bg,
                boxShadow: "0 8px 20px -4px rgba(239,68,68,0.45)",
                transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          <button onClick={() => { setActiveTab("bible"); setFabOpen(false); }} className="flex flex-col items-center gap-1 p-1" style={{ color: activeTab === "bible" ? t.activeTab : t.barText }}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Bible</span>
          </button>
          <button onClick={() => { setActiveTab("profile"); setFabOpen(false); }} className="flex flex-col items-center gap-1 p-1" style={{ color: activeTab === "profile" ? t.activeTab : t.barText }}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
