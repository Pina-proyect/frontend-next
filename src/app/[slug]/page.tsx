import { http } from "@/lib/http-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Metadata } from "next";
import DonationBox from "./donation-box";

const getGenderedNiche = (gender: string, niche: string | null) => {
  const prefix = gender === "creador" ? "Creador" : "Creadora";
  if (!niche) return `${prefix} Digital`;
  switch (niche) {
    case "photography": return `${prefix} de Fotografía`;
    case "film": return `${prefix} de Cine y Video`;
    case "digital-art": return `${prefix} de Arte Digital`;
    default: return `${prefix} ${niche}`;
  }
};

async function getCreatorProfile(slug: string): Promise<any | null> {
  const backend = (process.env.BACKEND_URL || "http://localhost:4011").replace(/\/$/, "");
  const url = `${backend}/api/pina/users/profile/${slug}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
}

async function getCreatorPacks(slug: string): Promise<any[]> {
  const backend = (process.env.BACKEND_URL || "http://localhost:4011").replace(/\/$/, "");
  const url = `${backend}/api/pina/packs/public/${slug}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error al obtener packs:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

import CreatorContent from "./creator-content";

export default async function CreatorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getCreatorProfile(decodedSlug);
  const packs = profile ? await getCreatorPacks(decodedSlug) : [];

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Perfil no encontrado</h1>
          <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(profile.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-20">
      {/* Dynamic Header / Banner */}
      <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/30 via-tertiary-container/20 to-surface"></div>
        {/* Abstract pattern decoration */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        
        {/* Floating Glass Navigation (Small) */}
        <nav className="absolute top-8 left-0 right-0 z-30 px-8 flex justify-between items-center">
            <Link href="/" className="glass-panel px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Explorar</span>
            </Link>
            <div className="flex gap-4">
                <button className="glass-panel p-2 rounded-full hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined text-xl">share</span>
                </button>
            </div>
        </nav>
      </section>

      {/* Profile Info Overlay Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8 mb-12">
            {/* Avatar with Premium Border */}
            <div className="relative">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-surface p-1.5 shadow-2xl overflow-hidden ring-4 ring-white/10">
                    <Avatar className="w-full h-full rounded-[2.2rem]">
                        <AvatarImage src={profile.photoPath || ""} className="object-cover" />
                        <AvatarFallback className="bg-primary text-white text-4xl font-headline font-bold">{initials}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-2xl shadow-lg border-4 border-surface">
                   <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                </div>
            </div>

            {/* Title Info */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-12">
                <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
                    <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface">
                        {profile.fullName}
                    </h1>
                    <span className="text-primary font-headline font-bold text-lg md:mb-1 uppercase tracking-widest opacity-80">
                        {getGenderedNiche(profile.gender || "creadora", profile.niche)}
                    </span>
                </div>
                <p className="text-on-surface-variant text-lg font-medium">@{profile.slug}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                    <span className="bg-surface/50 text-on-surface-variant px-8 py-3.5 rounded-xl font-headline font-bold text-sm">
                        Siguiendo
                    </span>
                    {profile.instagram || profile.tiktok || profile.youtube ? (
                        <span className="glass-panel border-outline-variant/20 px-8 py-3.5 rounded-xl font-headline font-bold text-sm text-on-surface-variant">
                            Disponible en redes
                        </span>
                    ) : null}
                </div>
            </div>
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Main Bio Card */}
            <div className="md:col-span-8 glass-panel border border-outline-variant/15 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Mi Historia</h3>
                <p className="text-on-surface text-xl md:text-2xl font-medium leading-relaxed mb-8">
                   {profile.bio || "Explorando los límites de la creatividad digital y compartiendo el proceso con el mundo."}
                </p>
                <div className="flex flex-wrap gap-8 items-center border-t border-outline-variant/10 pt-8">
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">En Pina desde</span>
                        <span className="text-on-surface font-headline font-bold">{joinDate}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Localidad</span>
                        <span className="text-on-surface font-headline font-bold">Barcelona, ES</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Estilo</span>
                        <span className="text-on-surface font-headline font-bold capitalize">{profile.niche || "Contemporáneo"}</span>
                    </div>
                </div>
            </div>

            {/* Sidebar Cards */}
            <div className="md:col-span-4 space-y-6">
                {/* Social Connect Bento Block */}
                <div className="glass-panel border-outline-variant/15 rounded-3xl p-8 shadow-sm">
                    <h3 className="font-headline text-[10px] font-bold uppercase tracking-widest text-primary mb-6">Presencia Digital</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {profile.instagram && (
                            <Link href="#" className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] to-[#bc1888] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-xl">camera</span>
                                    </div>
                                    <span className="font-headline font-bold text-sm">Instagram</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                            </Link>
                        )}
                        {profile.tiktok && (
                            <Link href="#" className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-xl">music_note</span>
                                    </div>
                                    <span className="font-headline font-bold text-sm">TikTok</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                            </Link>
                        )}
                        {profile.youtube && (
                            <Link href="#" className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-xl">smart_display</span>
                                    </div>
                                    <span className="font-headline font-bold text-sm">YouTube</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                            </Link>
                        )}
                        {!profile.instagram && !profile.tiktok && !profile.youtube && (
                            <p className="text-xs text-on-surface-variant italic">Este estudio aún es exclusivamente privado.</p>
                        )}
                    </div>
                </div>

                {/* Caja de Donaciones con Mercado Pago */}
                <DonationBox 
                  creatorId={profile.id} 
                  creatorName={profile.fullName} 
                  pinaPrice={profile.pinaPrice || 1000} 
                />
            </div>
        </div>

        {/* Content Section */}
        <CreatorContent packs={packs} creatorSlug={decodedSlug} />
      </div>

      {/* Material Icons and Fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getCreatorProfile(decodedSlug);

  if (!profile) {
    return {
      title: "Perfil no encontrado - PINA",
    };
  }

  return {
    title: `${profile.fullName} | Estudio en PINA`,
    description: profile.bio || `Visita el estudio digital de ${profile.fullName} en PINA.`,
    openGraph: {
      type: "profile",
      title: profile.fullName,
      description: profile.bio || `Creadora en PINA`,
    }
  };
}