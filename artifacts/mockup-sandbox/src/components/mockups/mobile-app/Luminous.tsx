import React from "react";
import { 
  Bell, 
  Search, 
  Plus, 
  Heart, 
  User, 
  MessageCircle, 
  BookOpen, 
  Wifi, 
  Battery, 
  Signal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Luminous() {
  return (
    <div className="w-[390px] h-[844px] bg-[#FAFAF8] overflow-hidden relative flex flex-col text-slate-800 font-sans shadow-2xl rounded-[40px] border-[8px] border-black box-content">
      {/* Status Bar */}
      <div className="h-12 w-full flex justify-between items-center px-6 pt-2 pb-1 text-[15px] font-medium z-10 bg-[#FAFAF8]">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal size={16} className="fill-slate-800" />
          <Wifi size={16} />
          <Battery size={20} className="fill-slate-800" />
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4 bg-[#FAFAF8]">
        <div className="flex justify-between items-center mb-1">
          <h1 className="font-['League_Spartan'] text-2xl font-bold text-red-500 tracking-tight">Testifaith</h1>
          <button className="relative p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
        <p className="text-slate-500 text-sm font-medium">Good morning, Sarah ✨</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5 space-y-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Daily Declaration */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-200/50 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">Daily Declaration</span>
            </div>
            <p className="text-slate-800 font-['League_Spartan'] text-xl leading-tight mb-3">
              "I am healed by His stripes. Sickness has no place in my body, for I am a temple of the Holy Spirit."
            </p>
            <p className="text-amber-700/80 text-sm font-medium">— Isaiah 53:5</p>
          </div>
        </div>

        {/* Feed Header */}
        <div className="flex items-center justify-between mt-2">
          <h2 className="font-['League_Spartan'] text-xl font-semibold text-slate-800">Recent Testimonies</h2>
          <button className="text-red-500 text-sm font-medium">View all</button>
        </div>

        {/* Feed Cards */}
        <div className="space-y-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-slate-100 shadow-sm">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">MK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Marcus K.</p>
                  <p className="text-slate-400 text-xs">2 hours ago</p>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wide">Finance</span>
            </div>
            <h3 className="font-['League_Spartan'] text-lg font-bold text-slate-900 mb-2 leading-tight">Unexpected check in the mail!</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
              We were short on rent this month and I was honestly starting to panic. We prayed together as a family on Tuesday. Today, a check arrived from an overpayment on a medical bill from two years ago—for the EXACT amount we needed. God is so faithful!
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span className="text-sm font-medium">124 Amens</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">12 Encouragements</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-slate-100 shadow-sm">
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">EJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Elena J.</p>
                  <p className="text-slate-400 text-xs">5 hours ago</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wide">Healing</span>
            </div>
            <h3 className="font-['League_Spartan'] text-lg font-bold text-slate-900 mb-2 leading-tight">Clear Scans After 6 Months</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
              Just got back from the oncologist. The scans are completely clear! The doctors are calling it remarkable, but we know who the Great Physician is. Thank you to everyone in this community who has been praying with us since March.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span className="text-sm font-medium">892 Amens</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">45 Encouragements</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-between px-6 pb-6 pt-2 rounded-b-[32px]">
        
        <button className="flex flex-col items-center gap-1 relative w-12">
          <div className="text-red-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="text-[10px] font-medium text-red-500">Home</span>
          <div className="absolute -top-3 w-1 h-1 bg-red-500 rounded-full"></div>
        </button>

        <button className="flex flex-col items-center gap-1 w-12 text-slate-400">
          <Search size={24} />
          <span className="text-[10px] font-medium">Explore</span>
        </button>

        {/* Center Post Button */}
        <div className="relative -top-5">
          <button className="w-14 h-14 bg-red-500 rounded-full shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)] flex items-center justify-center text-white hover:bg-red-600 transition-transform active:scale-95 border-4 border-[#FAFAF8]">
            <Plus size={28} />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 w-12 text-slate-400">
          <BookOpen size={24} />
          <span className="text-[10px] font-medium">Bible</span>
        </button>

        <button className="flex flex-col items-center gap-1 w-12 text-slate-400">
          <User size={24} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
