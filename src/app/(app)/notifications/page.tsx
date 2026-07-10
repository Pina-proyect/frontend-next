"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { http } from "@/lib/http-client";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifs = async () => {
      try {
        const data = await http<NotificationItem[]>("/notifications");
        if (mounted) setNotifications(data || []);
      } catch (e) {
        console.error("Error fetching notifications:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchNotifs();
    return () => { mounted = false; };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await http(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Error marking as read:", e);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Notificaciones</h1>
          <p className="text-on-surface-variant font-body mt-1">Mantente al día con tu actividad en el estudio.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border-dashed border-2 border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4" style={{fontVariationSettings: "'FILL' 1"}}>notifications_none</span>
          <h3 className="text-xl font-headline font-bold">Sin novedades</h3>
          <p className="text-on-surface-variant max-w-xs mt-2">
            Aún no tienes notificaciones. Cuando tus seguidores interactúen con tu contenido, aparecerán aquí.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3.5 rounded-xl font-headline font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Volver al Panel
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`rounded-2xl p-5 transition-all cursor-pointer ${
                n.read
                  ? "bg-surface-container-low border border-outline-variant/10"
                  : "bg-surface-container-high ring-1 ring-primary/10 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    <h4 className="font-headline font-bold text-sm text-on-surface truncate">{n.title}</h4>
                  </div>
                  {n.message && (
                    <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant/50 mt-2 font-medium">
                    {new Date(n.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {n.link && (
                  <Link href={n.link} className="text-primary text-xs font-bold hover:underline flex-shrink-0">
                    Ver
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
