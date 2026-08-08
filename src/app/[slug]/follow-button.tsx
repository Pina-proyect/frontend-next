"use client";

import React, { useState, useEffect } from "react";
import { http } from "@/lib/http-client";
import { useAuthStore } from "@/store/use-auth-store";

interface FollowButtonProps {
  creatorId: string;
}

export default function FollowButton({ creatorId }: FollowButtonProps) {
  const user = useAuthStore((s) => s.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    let mounted = true;
    const checkStatus = async () => {
      try {
        const data = await http<{ isFollowing: boolean }>(`/creators/${creatorId}/follow-status`);
        if (mounted) setIsFollowing(data.isFollowing);
      } catch { /* ignore */ }
      finally { if (mounted) setChecking(false); }
    };
    checkStatus();
    return () => { mounted = false; };
  }, [creatorId, user]);

  const handleToggle = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        await http(`/creators/${creatorId}/follow`, { method: "DELETE" });
        setIsFollowing(false);
      } else {
        await http(`/creators/${creatorId}/follow`, { method: "POST" });
        setIsFollowing(true);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <button
        onClick={handleToggle}
        className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3.5 rounded-xl font-headline font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
      >
        Seguir Estudio
      </button>
    );
  }

  if (checking) {
    return (
      <span className="bg-surface/50 text-on-surface-variant/60 px-8 py-3.5 rounded-xl font-headline font-bold text-sm italic">
        <span className="material-symbols-outlined animate-spin text-sm align-middle mr-2">progress_activity</span>
        Cargando...
      </span>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-8 py-3.5 rounded-xl font-headline font-bold text-sm transition-all active:scale-95 ${
        isFollowing
          ? "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/20 hover:bg-error/10 hover:text-error hover:ring-error/30"
          : "bg-gradient-to-br from-primary to-primary-container text-white shadow-lg hover:scale-[1.02]"
      }`}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
      ) : isFollowing ? (
        "Dejar de Seguir"
      ) : (
        "Seguir Estudio"
      )}
    </button>
  );
}
