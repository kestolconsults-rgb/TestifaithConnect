import React from "react";
import { 
  Heart, 
  Search, 
  Plus, 
  Bell, 
  User, 
  MessageCircle,
  Wifi,
  Battery,
  Signal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Serene() {
  return (
    <div className="w-[390px] h-[844px] bg-[#09090b] text-zinc-50 overflow-hidden flex flex-col font-sans relative shadow-2xl rounded-[3rem] border-8 border-zinc-900 mx-auto">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2 text-xs font-medium text-zinc-400 z-10">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 pt-4 pb-4 bg-gradient-to-b from-[#09090b] to-transparent z-10">
        <h1 className="font-['League_Spartan'] text-3xl font-bold tracking-tight text-white mb-0.5">
          Testifaith
        </h1>
        <p className="text-zinc-400 text-sm">Share what God has done</p>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 space-y-6 hide-scrollbar">
        
        {/* Today's Highlight */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-['League_Spartan'] text-lg text-white font-medium">Testimony of the Day</h2>
          </div>
          <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20"></div>
            
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 border font-medium">
                Healing
              </Badge>
              <span className="text-xs text-zinc-500">2h ago</span>
            </div>
            
            <p className="text-lg leading-relaxed text-zinc-200 mb-6 font-serif italic">
              "Three weeks ago, doctors said there was no hope. Last Tuesday, I walked out of that hospital healed. The tumor is completely gone."
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border border-zinc-800">
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-zinc-300">Sarah Jenkins</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-zinc-400">
                <button className="flex items-center gap-1 hover:text-red-400 transition-colors bg-zinc-800/50 px-3 py-1.5 rounded-full">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                  <span className="text-sm font-medium text-zinc-300">1.2k</span>
                  <span className="text-xs ml-1">Amen</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-['League_Spartan'] text-lg text-white font-medium">Recent Testimonies</h2>
          </div>

          {/* Card 1 */}
          <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/40">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[10px]">MD</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-zinc-400">Marcus D.</span>
              </div>
              <span className="text-xs text-zinc-600">5h ago</span>
            </div>
            
            <Badge variant="outline" className="mb-2.5 text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-400">
              Breakthrough
            </Badge>
            
            <p className="text-sm text-zinc-300 leading-snug mb-4">
              After 18 months of applying, I finally got the exact role I've been praying for. God's timing is truly perfect!
            </p>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs">342</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">24</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/40">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[10px]">ET</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-zinc-400">Elena T.</span>
              </div>
              <span className="text-xs text-zinc-600">12h ago</span>
            </div>
            
            <Badge variant="outline" className="mb-2.5 text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-400">
              Marriage
            </Badge>
            
            <p className="text-sm text-zinc-300 leading-snug mb-4">
              We were on the brink of divorce. Through prayer and counseling, our marriage is stronger than ever. Restoration is real.
            </p>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs">891</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">56</span>
              </button>
            </div>
          </div>
          
        </section>
      </div>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-t border-zinc-800/50 pb-8 pt-3 px-6 z-20">
        <div className="flex justify-between items-center relative">
          <button className="flex flex-col items-center gap-1 p-2 text-red-500">
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          {/* Elevated Post Button */}
          <div className="relative -top-6">
            <button className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 border-4 border-[#0a0a0c] text-white hover:bg-red-600 transition-colors transform active:scale-95">
              <Plus className="w-7 h-7" />
            </button>
          </div>
          
          <button className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-medium">Alerts</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
