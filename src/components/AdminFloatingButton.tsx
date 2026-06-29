"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard } from "lucide-react";

export default function AdminFloatingButton() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setHasSession(true);
        }
      } catch (err) {
        console.error("Error checking session for admin button:", err);
      }
    };

    checkSession();
  }, []);

  if (!hasSession) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <a
        href="http://localhost:3000/dashboard"
        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-full border border-slate-800 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <LayoutDashboard className="h-4 w-4 text-blue-500" />
        Panel de Control
      </a>
    </div>
  );
}
