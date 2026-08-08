"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { http } from "@/lib/http-client";
import { getAuthToken, updateAuthUser, type User } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

/* -------------------------------------------------------------------------- */
/*                                   STEP 1: NICHE                            */
/* -------------------------------------------------------------------------- */
function Step1ChooseNiche() {
  const { niche, setNiche, nextStep } = useOnboardingStore();

  const handleSelect = (selected: string) => {
    setNiche(selected);
  };

  return (
    <div className="max-w-4xl w-full mx-auto fade-in animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-6">
            Bienvenido a tu <span className="text-primary italic">Estudio.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Personalicemos tu espacio de trabajo. ¿Qué describe mejor tu enfoque creativo? Puedes cambiar esto más adelante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        {/* Photography */}
        <div className="md:col-span-8 group cursor-pointer" onClick={() => handleSelect("photography")}>
          <div className={`relative overflow-hidden h-64 rounded-xl transition-all hover:-translate-y-1 ${niche === "photography" ? "ring-4 ring-primary shadow-2xl" : "shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)]"}`}>
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
              <img className="w-full h-full object-cover" alt="Photography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGWSW_875fTAe1DDr_SZxsw6F40qEQwgP6Qtl7ItjoBnirsTTUKfs56VXUNa6cWZiUgAv6OdJO7-ykCJ5As8DNflbQSRZ8b3egD8hThcQONp0L-vD_vZxL2-e0O-8JD_aBWzBuZYTF5op6S_H1582LffYFIASp5qSOJ8ATB5JT9sOAKar3VifinjF1GlaxfrGTYwFBFOZ0k4NiA47m8Gav8rcYXr8zgENX2p4onSgqrfNtwXFFVJBj2cOfrRvQaBybL1oQ9HHcohG2" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-8 z-10">
              <span className="material-symbols-outlined text-white text-3xl mb-2">photo_camera</span>
              <h3 className="text-2xl font-headline font-bold text-white tracking-tight">Fotografía</h3>
              <p className="text-white/80 text-sm">Narrativa visual a través del lente.</p>
            </div>
          </div>
        </div>

        {/* Film Card */}
        <div className="md:col-span-4 group cursor-pointer" onClick={() => handleSelect("film")}>
          <div className={`relative overflow-hidden h-64 rounded-xl transition-all hover:-translate-y-1 ${niche === "film" ? "ring-4 ring-primary shadow-2xl" : "shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)]"}`}>
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
              <img className="w-full h-full object-cover" alt="Film" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6YsuXzOnuqmiOywpkOKV-thraCSTTJ6y5xBbk6AHXYHcE9M325YUF_FGWymz4RmsI6vQQAUuQJ2bH0JZ1C0UOuw5z1uxu8ApvJ0u90Pfzb2JANix_QvtT43NecjXtwewctPFcILe7f75MfOEaal1lHG3JXNlEPvT_ePJeuiLV7m9eeGMc6NzgY2o93r83gjWHVJSMQbk6zslVqh3FgrXub1l55lrTdSZmdgXpRU7zioN_9i9JamIhUdNtlPLGGGqMxEyM2fgShr0x" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 z-10">
              <span className="material-symbols-outlined text-white text-3xl mb-2">movie</span>
              <h3 className="text-xl font-headline font-bold text-white tracking-tight">Cine</h3>
              <p className="text-white/80 text-xs">Cinematografía y Movimiento.</p>
            </div>
          </div>
        </div>

        {/* Digital Art Card */}
        <div className="md:col-span-4 group cursor-pointer" onClick={() => handleSelect("digital-art")}>
          <div className={`relative overflow-hidden h-64 rounded-xl transition-all hover:-translate-y-1 ${niche === "digital-art" ? "ring-4 ring-primary shadow-2xl" : "shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)]"}`}>
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
              <img className="w-full h-full object-cover" alt="Digital Art" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiKbL72mFFGnwYsAbsWHjfUvFpfbScmVjrKsFCV52cUBPPjKb8VtdqgDT30A-e3-NeuE5alK1F_tGcL1OR0fIAnK7Eo2VguwJv7ir0buo7sMJru92ER5S4-wggNx60GZAyd0I7QlYaOAYM-kPCiMFBG5e4fDisdKokT7CBdI620OGJ3RQS0lLa-bP2PPKPr3E2m9G-8D2eO5dhYgkaO-t4WrRpZSQCE-7IscqBxPQg8mWXjR3o-K59mt17LwtzQCfWv__2FrsIln0E" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 z-10">
              <span className="material-symbols-outlined text-white text-3xl mb-2">brush</span>
              <h3 className="text-xl font-headline font-bold text-white tracking-tight">Arte Digital</h3>
              <p className="text-white/80 text-xs">Ilustración y Diseño 3D.</p>
            </div>
          </div>
        </div>

        {/* Something Else */}
        <div className="md:col-span-8 group cursor-pointer" onClick={() => { if (!niche.startsWith("custom:")) handleSelect("custom:"); }}>
          <div className={`relative overflow-hidden h-64 rounded-xl border transition-all hover:-translate-y-1 flex items-center justify-center bg-surface-container-low ${niche.startsWith("custom:") ? "border-primary ring-2 ring-primary bg-primary/5" : "border-outline-variant/15 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)]"}`}>
            <div className="text-center p-8 w-full max-w-sm">
              {niche.startsWith("custom:") ? (
                <div className="w-full">
                  <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-4">¿Cuál es tu nicho?</h3>
                  <input type="text" autoFocus className="w-full px-4 py-4 bg-surface-container-highest rounded-xl border border-outline-variant/30 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Ej: Finanzas, Juegos..." value={niche.replace("custom:", "")} onChange={(e) => setNiche("custom:" + e.target.value)} onClick={(e) => e.stopPropagation()} />
                </div>
              ) : (
                <>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-surface-container-highest text-primary`}>
                    <span className="material-symbols-outlined text-3xl">add</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">¿Algo más?</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Escribe tu propio nicho creativo.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant/15">
        <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">info</span>
            <p className="text-sm">Definir tu nicho nos ayuda a sugerir las herramientas adecuadas para tu flujo de trabajo.</p>
        </div>
        <button 
           onClick={nextStep}
           disabled={!niche}
           className="w-full md:w-auto px-10 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
            Siguiente Paso
            <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STEP 2: PROFILE                          */
/* -------------------------------------------------------------------------- */

const formSchemaProfile = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(30, "El slug no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z0-9-ñÑ]+$/, "El slug solo puede contener letras, números, guiones y la letra ñ"),
  bio: z
    .string()
    .max(160, "Máximo 160 caracteres")
    .optional(),
  gender: z.string(),
  country: z.string().optional(),
});

function Step2ProfileSetup() {
  const router = useRouter();
  const { toast } = useToast();
  const { slug, bio, gender, country, profileImage, setProfileInfo, prevStep } = useOnboardingStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(profileImage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchemaProfile>>({
    resolver: zodResolver(formSchemaProfile),
    defaultValues: { slug, bio, gender, country },
  });

  const onSubmit = async (values: z.infer<typeof formSchemaProfile>) => {
    const formattedSlug = values.slug.toLowerCase().trim().replace(/\s+/g, "-");
    setProfileInfo(formattedSlug, values.bio || "", values.gender, values.country || "", imagePreview);

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({ variant: "destructive", title: "Error", description: "No autenticado" });
        router.push("/login");
        return;
      }

      const updatedUser = await http<User>("/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          slug: formattedSlug,
          bio: values.bio || "",
          niche: useOnboardingStore.getState().niche,
          gender: values.gender,
          country: values.country || "",
          profileImageBase64: imagePreview,
        }),
      });
      updateAuthUser(updatedUser);

      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar tu perfil";
      toast({ variant: "destructive", title: "Oops!", description: message });
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full fade-in animate-in slide-in-from-right-4 duration-500">
      <div className="w-full max-w-lg space-y-10">
        <header className="space-y-2">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Define tu Estilo</h2>
            <p className="text-on-surface-variant text-lg">¿Cómo quieres que te vea el mundo?</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center md:items-start gap-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full border-2 border-primary/20 p-1 bg-surface-container-lowest transition-all hover:border-primary">
                        <div className="w-full h-full rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center relative">
                            {imagePreview ? (
                              <img alt="Profile" className="absolute inset-0 w-full h-full object-cover" src={imagePreview} />
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-outline text-4xl group-hover:scale-110 transition-transform duration-300">add_a_photo</span>
                                <img alt="Profile setup" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi09b7xuQkPb_XCJ6mC5uwZiJRj3vRJ-TtwKUbbF1vNd7AhBbpT2g4JLg7E3J8P1-0yXFTtSB_luhAqw8dDd3vtQvnOdvt4TMtrBDYqLL4LwU7OiELGObgYQB_abkaLix4DnASLq6ZsRwJF4TLuPwxSIGU5m1YtqhJHpS_J-AvxAg5EkKoKYr7d4aMpRJR9sk18IoxOGpoR0qVqSSRrZ0afUB2bGL2h-tYsyVPoiCsFNI1F4OA8TSPURc5vo0w0XJbZnCRcf0ETL6D" />
                              </>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] border-4 border-surface group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <span className="block text-sm font-semibold text-on-surface">Foto de Perfil</span>
                    <span className="block text-xs text-on-surface-variant mt-1">Recomendado: JPEG o PNG cuadrado, mín. 400x400px</span>
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
               <FormField control={form.control} name="gender" render={({ field }) => (
                 <FormItem className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Tipo de Identificación / Rol
                    </label>
                    <FormControl>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => field.onChange("creadora")}
                          className={`flex-1 py-4 px-6 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center ${
                            field.value === "creadora"
                              ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                          }`}
                        >
                          Creadora
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("creador")}
                          className={`flex-1 py-4 px-6 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center ${
                            field.value === "creador"
                              ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                          }`}
                        >
                          Creador
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                 </FormItem>
               )} />

               <FormField control={form.control} name="slug" render={({ field }) => (
                 <FormItem className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Nombre de usuario único (ej: mi-nombre)
                    </label>
                    <FormControl>
                      <input 
                         className="w-full px-5 py-4 bg-surface-container-highest rounded-xl border-none text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none" 
                         placeholder="e.g. elena-rodriguez" 
                         type="text" 
                         {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                 </FormItem>
               )} />

               <FormField control={form.control} name="country" render={({ field }) => (
                 <FormItem className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Ubicación / País
                    </label>
                    <FormControl>
                      <input 
                         className="w-full px-5 py-4 bg-surface-container-highest rounded-xl border-none text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none" 
                         placeholder="Ej: Argentina, España, México..." 
                         type="text" 
                         {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                 </FormItem>
               )} />

               <FormField control={form.control} name="bio" render={({ field }) => (
                 <FormItem className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Biografía Corta
                    </label>
                    <FormControl>
                        <textarea 
                           className="w-full px-5 py-4 bg-surface-container-highest rounded-xl border-none text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none resize-none" 
                           placeholder="Cuéntanos sobre tu arte..." 
                           rows={4}
                           {...field}
                        />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage className="text-xs" />
                      <p className="text-[0.7rem] text-on-surface-variant px-1 ml-auto">Máximo 160 caracteres</p>
                    </div>
                 </FormItem>
               )} />
            </div>

            {/* CTA */}
            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm tracking-wide shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
                    {isSubmitting ? "Guardando..." : "Ya casi estamos"}
                </button>
                <button type="button" onClick={prevStep} className="w-full sm:w-auto px-8 py-4 text-on-surface-variant font-medium text-sm hover:text-on-surface transition-colors">
                    Atrás
                </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       STEP 3: SOCIALS (PRESERVED — ver #30)                */
/* -------------------------------------------------------------------------- */
/* Este componente se conserva en el código pero fue extraído del stepper     */
/* del onboarding por decisión de producto (issue #30).                       */
/*                                                                            */
/* Estado: NO se muestra en el flujo actual de onboarding.                    */
/* Futuro: se integrará en el dashboard o se re-sumará al onboarding cuando   */
/*         exista el backend de conexiones OAuth (Instagram, TikTok, YouTube).*/
/*                                                                            */
/* El handler `handleLaunch` (PATCH /auth/profile + updateAuthUser +          */
/* redirect a /dashboard) está intacto y es reusable.                         */
/* -------------------------------------------------------------------------- */
// Conservado a propósito para su futura re-integración (issue #30).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Step3ConnectSocials() {
  const router = useRouter();
  const { toast } = useToast();
  const { connectedSocials, toggleSocial, slug, bio, prevStep, country, profileImage } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({ variant: "destructive", title: "Error", description: "No autenticado" });
        router.push("/login");
        return;
      }

      const updatedUser = await http<User>("/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          slug, 
          bio, 
          niche: useOnboardingStore.getState().niche,
          gender: useOnboardingStore.getState().gender,
          country,
          profileImageBase64: profileImage,
          instagram: connectedSocials.instagram,
          tiktok: connectedSocials.tiktok,
          youtube: connectedSocials.youtube
        }),
      });
      updateAuthUser(updatedUser);

      setShowAnimation(true);
      setTimeout(() => {
        router.push(`/dashboard`);
      }, 2500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear tu estudio";
      toast({ variant: "destructive", title: "Oops!", description: message });
      setIsSubmitting(false);
    }
  };

  if (showAnimation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full h-full fade-in animate-in duration-1000">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-white text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          </div>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">¡Tu estudio está listo!</h2>
        <p className="text-on-surface-variant">Preparando tu espacio creativo...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto fade-in animate-in slide-in-from-right-4 duration-500">
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-12 gap-8 text-center md:text-left">
            <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
                    Conecta y Lanza
                </h1>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                    Sincroniza tu pulso creativo. Conecta tus plataformas sociales principales para desbloquear análisis en tiempo real y flujos de trabajo automatizados en tu nuevo Estudio.
                </p>
            </div>
            <div className="hidden md:block">
                <div className="w-32 h-32 bg-primary-fixed rounded-full flex items-center justify-center overflow-hidden">
                    <img alt="Abstract Art" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwQUjLkYaMg90QHb_g-2lsq5gyHdupNk_f0NtPF0OqeB1vcQraZKhSZYWqG2bEsNUDIVGK0j7xwrWi7i-J_st099IyM4GwkXxwX5LrI1tn7pFjaVglj04ar8MyZL-3OgroI7FLCAhjVu8j4mVxm_tu2Pf7IrRzVowJPLR8A9ppw6Ybycu8WFyfWKpIMSiV95j8kLsM-tJlVphskZYleQcBbsT1WHz_VBbxla6gEYK9rszDJi24Yg3QxXv4fpGxsM_7ImXYPKOoiPE" />
                </div>
            </div>
        </div>

        {/* Social Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            {/* Instagram Card */}
            <div className={`md:col-span-8 glass-panel border rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] flex flex-col justify-between group transition-colors ${connectedSocials.instagram ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/15'}`}>
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-headline font-bold">Instagram</h3>
                            <p className="text-sm text-on-surface-variant">Análisis de Reels y Feed</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={connectedSocials.instagram} onChange={() => toggleSocial("instagram")} />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {connectedSocials.instagram ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                            <span className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Status</span>
                            <span className="text-primary font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                Conectado
                            </span>
                        </div>
                        <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                            <span className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Audience</span>
                            <span className="font-headline font-bold text-lg">Mocked Value</span>
                        </div>
                        <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                            <span className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Username</span>
                            <span className="text-on-surface font-medium">@{slug || "user"}</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-sm text-on-surface-variant">Activa para conectar tu cuenta.</div>
                )}
            </div>

            {/* YouTube Card */}
            <div className={`md:col-span-4 glass-panel border rounded-xl p-8 flex flex-col group transition-colors ${connectedSocials.youtube ? 'border-primary/50' : 'border-outline-variant/15'}`}>
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">smart_display</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={connectedSocials.youtube} onChange={() => toggleSocial("youtube")} />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <h3 className="text-xl font-headline font-bold mb-1">YouTube</h3>
                <p className="text-sm text-on-surface-variant mb-6">Rendimiento de Videos y Shorts</p>
            </div>

            {/* TikTok Card */}
            <div className={`md:col-span-5 glass-panel border rounded-xl p-8 flex flex-col group transition-colors ${connectedSocials.tiktok ? 'border-primary/50' : 'border-outline-variant/15'}`}>
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">music_note</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={connectedSocials.tiktok} onChange={() => toggleSocial("tiktok")} />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <h3 className="text-xl font-headline font-bold mb-1">TikTok</h3>
                <p className="text-sm text-on-surface-variant mb-6">Seguimiento de contenido viral</p>
            </div>

            {/* Success Visualizer */}
            <div className="md:col-span-7 glass-panel bg-primary/5 border border-primary/10 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)]">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-primary/30 rounded-full"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>rocket_launch</span>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-headline font-bold text-primary mb-2">Sistemas Listos</h4>
                    <p className="text-sm text-on-surface-variant leading-snug">
                        Tu espacio de trabajo está configurado. Estás a 1 clic de tu Estudio.
                    </p>
                </div>
            </div>
        </div>

        {/* Action Footer */}
        <div className="w-full mt-16 flex flex-col items-center gap-6">
            <button 
               onClick={handleLaunch} 
               disabled={isSubmitting}
               className="bg-gradient-to-br from-primary to-primary-container text-white px-12 py-5 rounded-xl font-headline font-extrabold text-lg shadow-[0_20px_50px_rgba(67,82,165,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group disabled:opacity-50 disabled:pointer-events-none"
            >
                {isSubmitting ? "Lanzando..." : "Lanzar Estudio"}
                {!isSubmitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
            <div className="flex gap-4">
              <button onClick={prevStep} className="text-sm text-outline font-medium hover:text-primary transition-colors">Go Back</button>
            </div>
        </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   MAIN SHELL                               */
/* -------------------------------------------------------------------------- */
export default function OnboardingPage() {
  const { currentStep } = useOnboardingStore();

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden min-h-screen relative">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
            <span className="text-2xl font-headline font-extrabold tracking-tighter text-on-surface">Pina</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex items-center gap-2">
                <div className={`w-8 h-1.5 rounded-full transition-colors duration-500 delay-100 ${currentStep >= 1 ? "bg-gradient-to-br from-primary to-primary-container" : "bg-surface-container-highest"}`}></div>
                <div className={`w-8 h-1.5 rounded-full transition-colors duration-500 delay-200 ${currentStep >= 2 ? "bg-gradient-to-br from-primary to-primary-container" : "bg-surface-container-highest"}`}></div>
            </div>
            <span className="text-[0.75rem] font-semibold text-primary tracking-wider uppercase ml-2 hidden sm:block">Paso {currentStep} de 2</span>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      {/* Decorative globally shared asymmetric backgrounds */}
      {currentStep === 1 && (
        <>
            <div className="fixed -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none transition-opacity duration-1000"></div>
            <div className="fixed bottom-0 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/5 blur-[160px] pointer-events-none transition-opacity duration-1000"></div>
        </>
      )}

      {/* Main Content Area */}
      <main className="min-h-screen pt-32 pb-16 px-6 flex flex-col items-center">
        {currentStep === 1 && <Step1ChooseNiche />}

        {/* Step 2 uses a split layout */}
        {currentStep === 2 && (
            <div className="fixed inset-0 pt-20 flex z-10 w-full animate-in fade-in duration-500">
                <aside className="hidden md:flex md:w-5/12 lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-surface-container-high transition-transform">
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-tertiary-fixed/10 blur-3xl"></div>
                    <div className="relative z-10 max-w-md">
                        <div className="mb-12">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[0.65rem] font-bold tracking-widest uppercase mb-6">Paso 02 — Identidad</span>
                            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
                                Diseña tu firma <span className="text-primary italic">creativa</span>.
                            </h1>
                            <p className="text-on-surface-variant text-lg leading-relaxed">
                                Tu perfil es la puerta de entrada a tu estudio digital. Configura un nombre y una apariencia que resuenen con tu marca profesional.
                            </p>
                        </div>
                    </div>
                </aside>
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex items-center bg-surface">
                    <Step2ProfileSetup />
                </div>
            </div>
        )}
      </main>
      
      {/* Font Injection for Material Symbols */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0');
      `}} />
    </div>
  );
}