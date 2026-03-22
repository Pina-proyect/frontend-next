import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http-client";

interface CreatorProfile {
  id: string;
  fullName: string;
  email: string;
  slug: string;
  bio: string | null;
  provider: string;
  photoPath: string | null;
  createdAt: string;
}

async function getCreatorProfile(slug: string): Promise<CreatorProfile | null> {
  try {
    const profile = await http<CreatorProfile>(`/users/profile/${slug}`);
    return profile;
  } catch (error) {
    console.error("Error al obtener perfil del creador:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
} 

export default async function CreatorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);  
  const profile = await getCreatorProfile(decodedSlug);
  
  

  if (!profile) {
    return <div>Usuario no encontrado</div>;
  }

  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(profile.createdAt).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header con información principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6">
            <Avatar className="w-28 h-28">
              {profile.photoPath && (
                <AvatarImage 
                  src={profile.photoPath} 
                  alt={profile.fullName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {profile.fullName}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-1">
            @{profile.slug}
          </p>
          
          <p className="text-sm text-muted-foreground">
            Se unió en {joinDate}
          </p>
        </div>

        <Separator className="my-8" />

        {/* Contenido principal */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Biografía */}
          <div className="md:col-span-2">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Acerca de mí</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="text-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Esta creadora aún no ha agregado una biografía.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método de registro</p>
                  <p className="text-foreground capitalize">
                    {profile.provider === "credentials" ? "Email" : profile.provider}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Miembro desde</p>
                  <p className="text-foreground">{joinDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA para contactar */}
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground mb-4">
                  ¿Te interesa colaborar con {profile.fullName}?
                </p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Enviar mensaje
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata dinámica para SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getCreatorProfile(decodedSlug);

  if (!profile) {
    return {
      title: "Perfil no encontrado",
      description: "El perfil que estás buscando no existe.",
    };
  }

  return {
    title: `${profile.fullName} (@${profile.slug}) - PINA`,
    description: profile.bio || `Perfil de ${profile.fullName} en PINA.`,
    openGraph: {
      title: `${profile.fullName} (@${profile.slug})`,
      description: profile.bio || `Perfil de ${profile.fullName}`,
      type: "profile",
    },
  };
}