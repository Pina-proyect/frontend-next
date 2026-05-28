"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore, setAuthSession, getRefreshToken } from "@/store/use-auth-store";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "monetization";
  const connectionStatus = searchParams.get("connected");

  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  // Monetization State
  const [mpAccessToken, setMpAccessToken] = useState(user?.mpAccessToken || "");
  const [pinaPrice, setPinaPrice] = useState(user?.pinaPrice || 1000);
  const [donationGoalTitle, setDonationGoalTitle] = useState(user?.donationGoalTitle || "");
  const [donationGoalAmount, setDonationGoalAmount] = useState(user?.donationGoalAmount || 0);

  // Profile State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [slug, setSlug] = useState(user?.slug || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [niche, setNiche] = useState(user?.niche || "other");
  const [gender, setGender] = useState(user?.gender || "creadora");
  const [instagram, setInstagram] = useState(user?.instagram || false);
  const [tiktok, setTiktok] = useState(user?.tiktok || false);
  const [youtube, setYoutube] = useState(user?.youtube || false);

  // Security State
  const [phone, setPhone] = useState(user?.phone || "");

  // Mostrar avisos tras redirección OAuth de Mercado Pago
  useEffect(() => {
    if (connectionStatus === "success") {
      toast({
        title: "Mercado Pago conectado",
        description: "Tu cuenta ha sido enlazada con éxito para recibir apoyos.",
      });
    } else if (connectionStatus === "error") {
      const errorMessage = searchParams.get("message") || "No se pudo completar la conexión.";
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: errorMessage,
      });
    }
  }, [connectionStatus, toast, searchParams]);

  const handleSaveMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await http<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          mpAccessToken, // Se mantiene en el payload por compatibilidad
          pinaPrice: Number(pinaPrice),
          donationGoalTitle,
          donationGoalAmount: Number(donationGoalAmount),
        }),
      });

      // Update the global store
      setAuthSession({
        accessToken: accessToken!,
        refreshToken: getRefreshToken()!,
        user: { ...user!, ...updatedUser },
      });

      toast({
        title: "Configuración guardada",
        description: "Tus opciones de monetización han sido actualizadas con éxito.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar la configuración.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await http<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          slug,
          bio,
          niche,
          gender,
          instagram,
          tiktok,
          youtube,
        }),
      });

      setAuthSession({
        accessToken: accessToken!,
        refreshToken: getRefreshToken()!,
        user: { ...user!, ...updatedUser },
      });

      toast({
        title: "Perfil actualizado",
        description: "Los datos de tu perfil público han sido guardados con éxito.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar perfil",
        description: error.message || "Ocurrió un error al guardar.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await http<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          phone,
        }),
      });

      setAuthSession({
        accessToken: accessToken!,
        refreshToken: getRefreshToken()!,
        user: { ...user!, ...updatedUser },
      });

      toast({
        title: "Seguridad actualizada",
        description: "La información de tu cuenta ha sido guardada con éxito.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMp = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
    window.location.href = `${backendUrl}/payments/mercadopago/auth?creatorId=${user?.id}`;
  };

  const handleDisconnectMp = async () => {
    setDisconnecting(true);
    try {
      await http<any>("/payments/mercadopago/disconnect", {
        method: "POST",
      });

      // Limpiamos los tokens locales del store
      setAuthSession({
        accessToken: accessToken!,
        refreshToken: getRefreshToken()!,
        user: { 
          ...user!, 
          mpAccessToken: null, 
          mpPublicKey: null 
        },
      });

      setMpAccessToken("");

      toast({
        title: "Cuenta desvinculada",
        description: "Tu cuenta de Mercado Pago ha sido desvinculada correctamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al desvincular la cuenta.",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-screen-xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          {activeTab === "monetization" && "Monetización y Donaciones"}
          {activeTab === "profile" && "Perfil Público"}
          {activeTab === "security" && "Cuenta y Seguridad"}
        </h2>
        <p className="text-on-surface-variant font-body mt-1">
          {activeTab === "monetization" && "Gestiona cómo tus seguidores te apoyan económicamente."}
          {activeTab === "profile" && "Gestiona cómo se muestra tu estudio digital al público."}
          {activeTab === "security" && "Administra las credenciales y la seguridad de tu acceso."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Content */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {activeTab === "monetization" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Dóname una Piña</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Configura tus cobros directamente con Mercado Pago.</p>
                </div>
              </div>

              {/* Estado de Conexión de Cuenta */}
              {user?.mpAccessToken ? (
                <div className="p-4 bg-green-500/10 rounded-2xl flex items-center justify-between border-none mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Cuenta vinculada con éxito</p>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Tus donaciones se acreditarán directamente. Clave pública: {user.mpPublicKey || "Enlazada"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectMp}
                    disabled={disconnecting}
                    className="text-xs font-headline font-bold text-error hover:underline"
                  >
                    {disconnecting ? "Desvinculando..." : "Desvincular"}
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col items-center text-center gap-4 border-none mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Vincula tu cuenta de Mercado Pago</p>
                    <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                      Conecta tu cuenta de Mercado Pago/Mercado Libre mediante autorización segura para habilitar los apoyos públicos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectMp}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-headline font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                    Conectar con Mercado Pago
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveMonetization} className="space-y-6">
                
                {/* Input de Access Token manual (oculto visualmente pero mantenido en el código por compatibilidad) */}
                <div className="hidden">
                  <label className="block text-sm font-bold text-on-surface mb-2">Access Token de MercadoPago</label>
                  <input 
                    type="password" 
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder="APP_USR-XXXXXXXXX-XXXXX-XXXXXXXXX-XXXXXXXXX"
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Valor de 1 Piña (ARS)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                      <input 
                        type="number" 
                        min="100"
                        value={pinaPrice}
                        onChange={(e) => setPinaPrice(Number(e.target.value))}
                        className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/20">
                  <h4 className="text-md font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">flag</span>
                    Objetivo de Recaudación (Opcional)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Título del Objetivo</label>
                      <input 
                        type="text" 
                        value={donationGoalTitle}
                        onChange={(e) => setDonationGoalTitle(e.target.value)}
                        placeholder="Ej. Nueva PC para Stream"
                        className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Monto a alcanzar (ARS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                        <input 
                          type="number" 
                          value={donationGoalAmount}
                          onChange={(e) => setDonationGoalAmount(Number(e.target.value))}
                          className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_8px_16px_-4px_rgba(67,82,165,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">account_circle</span>
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Perfil Público</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Gestiona cómo se muestra tu estudio digital al público.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Género / Denominación - Regla No-Line */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Identificación en la plataforma
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setGender("creadora")}
                      className={`flex-1 py-3 px-6 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center ${
                        gender === "creadora"
                          ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                      }`}
                    >
                      Creadora
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("creador")}
                      className={`flex-1 py-3 px-6 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center ${
                        gender === "creador"
                          ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                      }`}
                    >
                      Creador
                    </button>
                  </div>
                </div>

                {/* Nombre y Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre Completo</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre de Usuario / Slug</label>
                    <input 
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Nicho */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nicho Creativo</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="photography">Fotografía</option>
                    <option value="film">Cine / Video</option>
                    <option value="digital-art">Arte Digital</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                {/* Biografía */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Biografía Corta</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={160}
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                {/* Redes Sociales - Regla No-Line */}
                <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                  <h4 className="text-sm font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">link</span>
                    Redes Sociales Conectadas
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">photo_camera</span>
                        <span className="text-sm font-bold">Instagram</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInstagram(!instagram)}
                        className={`py-2 px-4 rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 ${
                          instagram
                            ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-sm"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-lowest"
                        }`}
                      >
                        {instagram ? "Conectado" : "Desconectado"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">movie</span>
                        <span className="text-sm font-bold">TikTok</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTiktok(!tiktok)}
                        className={`py-2 px-4 rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 ${
                          tiktok
                            ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-sm"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-lowest"
                        }`}
                      >
                        {tiktok ? "Conectado" : "Desconectado"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">play_circle</span>
                        <span className="text-sm font-bold">YouTube</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setYoutube(!youtube)}
                        className={`py-2 px-4 rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 ${
                          youtube
                            ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-sm"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-lowest"
                        }`}
                      >
                        {youtube ? "Conectado" : "Desconectado"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_8px_16px_-4px_rgba(67,82,165,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar Perfil
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Cuenta y Seguridad</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Administra las credenciales y la seguridad de tu acceso.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSecurity} className="space-y-6">
                {/* Email (Lectura) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface-variant/70 cursor-not-allowed outline-none font-medium"
                  />
                </div>

                {/* Teléfono (Editable) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Teléfono Móvil</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 XXXX XXXX"
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                  />
                </div>

                {/* Informativos de verificación DNI - Regla No-Line */}
                <div className="pt-4 border-t border-outline-variant/10 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Datos de Verificación</label>
                  <div className="p-4 bg-surface-container-high rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface-variant">Estado de Verificación:</span>
                    <span className="capitalize font-bold text-primary">{user?.verificationStatus}</span>
                  </div>
                  <div className="p-4 bg-surface-container-high rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface-variant">Proveedor de Acceso:</span>
                    <span className="capitalize font-bold text-on-surface">{user?.provider}</span>
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_8px_16px_-4px_rgba(67,82,165,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar Cuenta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 lg:p-10 max-w-screen-xl mx-auto w-full flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
           <p className="text-on-surface-variant font-label text-sm animate-pulse">Cargando Ajustes...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
