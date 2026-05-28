"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore, clearAuthSession, type User } from "@/store/use-auth-store";
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
    { name: "Estadísticas", href: "#", icon: "insights" },
    { name: "Bóveda", href: "#", icon: "lock" },
    { name: "Suscriptores", href: "#", icon: "group" },
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
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [loading, setLoading] = useState(!storedUser);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  // Verificación de sesión
  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        const me = await http<User>("/auth/me");
        if (mounted) {
          setProfile(me);
          setLoading(false);
        }
      } catch (error) {
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
  }, [storedUser, router, toast]);

  // Listener para abrir el modal de publicación de forma global desde el dashboard u otras páginas
  useEffect(() => {
    const handleOpen = () => setIsNewPostModalOpen(true);
    window.addEventListener("open-new-post-modal", handleOpen);
    return () => window.removeEventListener("open-new-post-modal", handleOpen);
  }, []);

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
          <button 
            onClick={() => setIsNewPostModalOpen(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)] hover:opacity-90 active:scale-95 transition-all w-full"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nueva Publicación</span>
          </button>
          
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
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-xl">mail</span>
              </button>
              <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
              
              {/* Profile Snippet */}
              {/* Profile Snippet (Informativo y Estático) */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-on-surface leading-none truncate max-w-[120px]">{profile?.fullName}</p>
                  <p className="text-[10px] font-headline font-semibold text-on-surface-variant uppercase tracking-wider mt-1 truncate max-w-[120px]">
                    @{profile?.slug || "creadora"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center ring-2 ring-primary/20 text-primary uppercase font-bold overflow-hidden shadow-sm">
                  {profile?.fullName?.charAt(0) || "U"}
                </div>
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

      <NewPostModal isOpen={isNewPostModalOpen} onClose={() => setIsNewPostModalOpen(false)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             MODAL NUEVA PUBLICACIÓN                        */
/* -------------------------------------------------------------------------- */
interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Efecto para limpiar URLs creadas y prevenir fugas de memoria
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Resetear formulario
  const handleClose = () => {
    setTitle("");
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setProgress(0);
    setUploading(false);
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/") && !selectedFile.type.startsWith("video/")) {
      toast({ variant: "destructive", title: "Archivo inválido", description: "Por favor, selecciona una imagen o un video." });
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Rellenar título por defecto con el nombre del archivo sin extensión
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
    setTitle((prev) => prev || nameWithoutExt);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePublish = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Falta el archivo", description: "Por favor, arrastra o selecciona un archivo para publicar." });
      return;
    }
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Título requerido", description: "Por favor, escribe un título para tu publicación." });
      return;
    }

    setUploading(true);
    setProgress(15);

    // Simulación interactiva de barra de progreso con fetch
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85) return prev + Math.floor(Math.random() * 10) + 2;
        return prev;
      });
    }, 300);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());

    try {
      await http("/media/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      // Esperar un instante para que el creador vea el 100% y luego cerrar
      setTimeout(() => {
        toast({ title: "Publicado con éxito", description: "Tu nuevo contenido ha sido añadido a tu estudio." });
        // Disparar evento para actualizar el feed de contenido en tiempo real
        window.dispatchEvent(new Event("content-updated"));
        handleClose();
      }, 500);

    } catch (error: any) {
      clearInterval(interval);
      setProgress(0);
      setUploading(false);
      toast({ variant: "destructive", title: "Error en la subida", description: error?.message || "No se pudo publicar tu archivo." });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="bg-surface-container-high text-on-surface rounded-[2rem] p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 scale-in transition-all relative border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-headline font-black tracking-tight">Nueva Publicación</h3>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors active:scale-95"
            onClick={handleClose}
            disabled={uploading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Zona de Drop o Previsualización */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && !uploading && fileInputRef.current?.click()}
          className={`relative h-56 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            file ? "bg-black overflow-hidden" : "bg-surface-container-low cursor-pointer hover:bg-surface-container-lowest"
          } ${dragActive ? "scale-[1.02] bg-primary/5" : ""}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={onFileInputChange} 
            accept="image/*,video/*"
            disabled={uploading}
          />

          {file ? (
            <>
              {/* Previsualización del archivo */}
              {file.type.startsWith("video/") ? (
                <video src={previewUrl || ""} className="w-full h-full object-cover opacity-80" muted playsInline autoPlay loop />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl || ""} alt="Preview" className="w-full h-full object-cover" />
              )}
              
              {/* Botón para remover archivo */}
              {!uploading && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm font-bold">delete</span>
                </button>
              )}
              
              {/* Marca indicando formato */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <span className="material-symbols-outlined text-xs">
                  {file.type.startsWith("video/") ? "play_circle" : "image"}
                </span>
                <span>{file.type.startsWith("video/") ? "Video" : "Imagen"}</span>
              </div>
            </>
          ) : (
            <div className="text-center p-6 space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <p className="font-headline font-bold text-sm text-on-surface">Arrastra un archivo o haz clic</p>
              <p className="text-[10px] text-on-surface-variant font-medium">Formatos soportados: Imágenes y Videos</p>
            </div>
          )}
        </div>

        {/* Campo de Entrada de Título */}
        <div className="space-y-2">
          <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">
            Título de la publicación
          </label>
          <input 
            type="text"
            placeholder="Ej. Mi nueva ilustración digital..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-lowest transition-all outline-none"
          />
        </div>

        {/* Estado de Progreso de Subida */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>Publicando en tu estudio...</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Acciones del Modal */}
        <div className="flex gap-4 pt-2">
          <button 
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 py-3 px-6 rounded-xl font-headline font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-surface-container-low hover:bg-surface-container-lowest active:scale-95 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handlePublish}
            disabled={uploading || !file || !title.trim()}
            className="flex-grow py-3 px-8 rounded-xl font-headline font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-br from-primary to-primary-container shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {uploading ? "Subiendo..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
