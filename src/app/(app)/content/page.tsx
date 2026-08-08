"use client";

import React, { useState, useEffect } from "react";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Media {
  id: string;
  title: string;
  url: string;
  type: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export default function ContentPage() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetchMedia();

    const handleUpdate = () => {
      fetchMedia();
    };

    window.addEventListener("content-updated", handleUpdate);
    return () => {
      window.removeEventListener("content-updated", handleUpdate);
    };
  }, []);

  const fetchMedia = async () => {
    try {
      const data = await http<Media[]>("/media/my-content");
      setMediaList(data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);

    try {
      await http("/media/upload", {
        method: "POST",
        body: formData,
        // No enviamos Content-Type para que el navegador ponga el boundary de FormData
      });

      toast({ title: "Éxito", description: "Archivo subido correctamente al estudio." });
      fetchMedia();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir el archivo." });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás segura de que deseas eliminar este contenido?")) return;

    try {
      await http("/media/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      toast({ title: "Eliminado", description: "El archivo ha sido borrado con éxito." });
      fetchMedia();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el archivo." });
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Tu Contenido</h1>
          <p className="text-on-surface-variant font-body mt-1">Gestiona tus videos, imágenes y recursos premium.</p>
        </div>
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="video/*,image/*"
          />
          <Button
            asChild
            className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-6 rounded-xl font-headline font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined">{uploading ? "sync" : "cloud_upload"}</span>
              {uploading ? "Subiendo..." : "Subir Nuevo"}
            </label>
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-surface-container-high animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border-dashed border-2 border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">video_library</span>
          <h3 className="text-xl font-headline font-bold">Tu estudio está vacío</h3>
          <p className="text-on-surface-variant max-w-xs mt-2">Comienza a subir contenido para que tus suscriptores puedan disfrutarlo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaList.map((item) => (
            <div key={item.id} className="group glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
              <div 
                className="aspect-video bg-black relative cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 group-hover:from-black/40 transition-all">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white text-sm">
                        {item.type === "video" ? "play_circle" : "image"}
                      </span>
                      <p className="text-white text-xs font-bold truncate max-w-[150px]">{item.title}</p>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-4xl bg-black/20 rounded-full p-2 backdrop-blur-sm">visibility</span>
                   </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-surface-container-lowest">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-error/20 text-error hover:bg-error/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Modal de Visualización */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setSelectedMedia(null)}
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          
          <div 
            className="max-w-full max-h-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "video" ? (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" 
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" 
              />
            )}
            <div className="text-center">
              <h3 className="text-white font-headline text-xl font-bold">{selectedMedia.title}</h3>
              <p className="text-white/60 text-sm">{selectedMedia.mimetype} • {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
