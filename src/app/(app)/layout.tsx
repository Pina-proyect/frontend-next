"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore, clearAuthSession, getAuthToken, type User } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";
import { http } from "@/lib/http-client";

function SidebarNavigation({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "monetization";
  const user = useAuthStore((s) => s.user);

  const [profileExpanded, setProfileExpanded] = useState(() => {
    return pathname === "/settings" && activeTab === "profile";
  });

  const navLinks = [
    { name: "Panel", href: "/dashboard", icon: "grid_view" },
    { name: "Contenido", href: "/content", icon: "video_library" },
    { name: "Mis Packs", href: "/packs", icon: "package_2" },
    { name: "Explorar", href: "/explore", icon: "search" },
    { name: "Monetización", href: "/settings?tab=monetization", icon: "payments" },
    {
      name: "Perfil Público",
      icon: "account_circle",
      subItems: [
        { name: "Editar Ajustes", href: "/settings?tab=profile", icon: "edit" },
        { name: "Ver Vista Pública", href: user?.slug ? `/${user.slug}` : "#", icon: "open_in_new", isExternal: true },
      ]
    },
    { name: "Cuenta y Seguridad", href: "/settings?tab=security", icon: "settings" },
  ];

  return (
    <nav className="flex flex-col gap-1 flex-grow">
      {navLinks.map((link) => {
        if (link.subItems) {
          return (
            <div key={link.name} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="rounded-lg font-semibold flex items-center justify-between px-4 py-3 transition-all duration-300 text-on-surface-variant hover:text-on-surface w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="font-headline uppercase tracking-widest text-[10px] font-bold">{link.name}</span>
                </div>
                <span className="material-symbols-outlined text-xs">
                  {profileExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>

              {profileExpanded && (
                <div className="flex flex-col gap-1 pl-6">
                  {link.subItems.map((sub) => {
                    const isSubActive = sub.href.includes("?tab=")
                      ? pathname === "/settings" && sub.href.endsWith(`?tab=${activeTab}`)
                      : pathname === sub.href;

                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        target={sub.isExternal ? "_blank" : undefined}
                        className={`rounded-lg font-semibold flex items-center gap-2 px-4 py-2 transition-all duration-300 ${
                          isSubActive
                            ? "bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/10"
                            : "text-on-surface-variant hover:translate-x-1 hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm" style={isSubActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{sub.icon}</span>
                        <span className="font-body text-[11px] font-semibold">{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const isActive = link.href.includes("?tab=")
          ? pathname === "/settings" && link.href.endsWith(`?tab=${activeTab}`)
          : pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`rounded-lg font-semibold flex items-center gap-3 px-4 py-3 transition-all duration-300 ${
              isActive
                ? "bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/10"
                : "text-on-surface-variant hover:translate-x-1 hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{link.icon}</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const storedUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [loading, setLoading] = useState(!storedUser);
  // Verificación de sesión
  useEffect(() => {
    console.log("🔍 AppLayout - storedUser:", storedUser, "accessToken:", accessToken?.substring(0,20), "refreshToken:", !!refreshToken, "loading:", loading);
    let mounted = true;
    const verify = async () => {
      console.log("🔍 AppLayout - verify() called, token from store:", getAuthToken()?.substring(0,20));
      try {
        const me = await http<User>("/auth/me");
        if (mounted) {
          console.log("🔍 AppLayout - verify() succeded, user:", me.email);
          setProfile(me);
          setLoading(false);
        }
      } catch (error) {
        console.error("🔍 AppLayout - verify() FAILED:", error);
        if (mounted) {
          toast({ variant: "destructive", title: "Aviso", description: "Tu sesión ha expirado" });
          router.replace("/login");
        }
      }
    };

    if (!storedUser) {
      verify();
    } else {
      setLoading(false);
    }
    
    return () => { mounted = false; };
  }, [storedUser, accessToken, refreshToken, router, toast]);

  const handleLogout = () => {
    clearAuthSession();
    toast({ title: "Hasta pronto", description: "Has salido de tu Estudio" });
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
           <p className="text-on-surface-variant font-label text-sm animate-pulse">Cargando tu Estudio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* SideNavBar (Desktop) */}
      <aside className="bg-surface-container-high h-screen w-64 hidden lg:flex flex-col sticky top-0 border-r border-outline-variant/10">
        <div className="flex flex-col p-6 gap-8 h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>diamond</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface font-headline tracking-tight">Pina</h1>
              <p className="font-headline uppercase tracking-widest text-[10px] font-bold text-on-surface-variant">Estudio Creativo</p>
            </div>
          </div>
          
          {/* New Post CTA */}
          <Link 
            href="/content"
            className="bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)] hover:opacity-90 active:scale-95 transition-all w-full"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nueva Publicación</span>
          </Link>
          
          {/* Navigation */}
          <Suspense fallback={
            <nav className="flex flex-col gap-1 flex-grow opacity-55">
              <div className="h-10 bg-surface-container-low rounded-lg animate-pulse mb-1" />
              <div className="h-10 bg-surface-container-low rounded-lg animate-pulse mb-1" />
              <div className="h-10 bg-surface-container-low rounded-lg animate-pulse mb-1" />
            </nav>
          }>
            <SidebarNavigation pathname={pathname} />
          </Suspense>
          
          {/* Footer Nav */}
          <div className="mt-auto border-t border-outline-variant/20 pt-6 flex flex-col gap-1">
            <button className="text-on-surface-variant hover:translate-x-1 hover:text-on-surface flex items-center gap-3 px-4 py-2 transition-transform duration-300 w-full text-left">
              <span className="material-symbols-outlined text-sm">help_outline</span>
              <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Ayuda</span>
            </button>
            <button onClick={handleLogout} className="text-on-surface-variant hover:translate-x-1 hover:text-error flex items-center gap-3 px-4 py-2 transition-transform duration-300 w-full text-left">
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="bg-surface/70 backdrop-blur-xl w-full top-0 sticky z-50 shadow-[0_4px_24px_-4px_rgba(67,82,165,0.04)]">
          <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto border-b border-outline-variant/10">
            <div className="flex items-center gap-8 flex-grow">
              <span className="text-2xl font-black tracking-tighter text-on-surface lg:hidden">Pina</span>
              <div className="relative w-full max-w-md hidden md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input className="w-full bg-surface-container-high border-none rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none" placeholder="Buscar creadores, contenido o estadísticas..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-4">
              
              {/* Profile Snippet */}
              {/* Profile Snippet (Informativo y Estático) */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-on-surface leading-none truncate max-w-[120px]">{profile?.fullName}</p>
                  <p className="text-[10px] font-headline font-semibold text-on-surface-variant uppercase tracking-wider mt-1 truncate max-w-[120px]">
                    @{profile?.slug || profile?.fullName?.split(" ")[0]?.toLowerCase() || "creadora"}
                  </p>
                </div>
                {profile?.photoPath ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm ring-2 ring-primary/20">
                    <img src={profile.photoPath} alt={profile.fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center ring-2 ring-primary/20 text-primary uppercase font-bold overflow-hidden shadow-sm">
                    {profile?.fullName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {children}
        
        {/* Bottom spacing for mobile nav */}
        <div className="h-24 lg:hidden"></div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 w-full z-[100] lg:hidden bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-4px_24px_rgba(67,82,165,0.1)]">
        <div className="flex justify-around items-center px-2 py-3 pb-safe-8">
          <Link href="/dashboard" className={`flex flex-col items-center justify-center min-w-[64px] ${pathname === '/dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>grid_view</span>
            <span className="font-headline text-[9px] font-bold tracking-tight mt-1 uppercase">Panel</span>
          </Link>
          <Link href="/content" className={`flex flex-col items-center justify-center min-w-[64px] ${pathname === '/content' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={pathname === '/content' ? {fontVariationSettings: "'FILL' 1"} : {}}>video_library</span>
            <span className="font-headline text-[9px] font-bold tracking-tight mt-1 uppercase">Videos</span>
          </Link>
          <Link href="/explore" className={`flex flex-col items-center justify-center min-w-[64px] ${pathname === '/explore' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={pathname === '/explore' ? {fontVariationSettings: "'FILL' 1"} : {}}>search</span>
            <span className="font-headline text-[9px] font-bold tracking-tight mt-1 uppercase">Explorar</span>
          </Link>
          <Link href="/packs" className={`flex flex-col items-center justify-center min-w-[64px] ${pathname === '/packs' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={pathname === '/packs' ? {fontVariationSettings: "'FILL' 1"} : {}}>package_2</span>
            <span className="font-headline text-[9px] font-bold tracking-tight mt-1 uppercase">Packs</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center min-w-[64px] text-on-surface-variant active:text-error">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-headline text-[9px] font-bold tracking-tight mt-1 uppercase">Salir</span>
          </button>
        </div>
      </nav>

      {/* Inject Material Symbols Globally for (app) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
      `}} />

    </div>
  );
}
