"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { setAuthSession, type User } from "@/store/use-auth-store";
import { http } from "@/lib/http-client";

// Usuario de prueba para simular login
const TEST_USER: User = {
  id: "test-user-123",
  email: "test@pina.com",
  fullName: "Usuario de Prueba",
  provider: "credentials",
  tokenVersion: 0,
  slug: null, // Importante: sin slug para forzar onboarding
  bio: null,
};

export default function TestOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"login" | "onboarding" | "profile">("login");
  const [testSlug, setTestSlug] = useState("");
  const [testBio, setTestBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<User | null>(null);

  const handleSimulateLogin = async () => {
    setIsLoading(true);
    try {
      // Simular login exitoso
      const mockTokens = {
        accessToken: "mock-access-token-123",
        refreshToken: "mock-refresh-token-123",
        user: TEST_USER,
      };

      setAuthSession(mockTokens);
      toast({
        title: "✅ Login simulado exitoso",
        description: "Usuario autenticado sin slug, debería ir a onboarding",
      });

      // Simular redirección como en el callback real
      const hasSlug = !!TEST_USER?.slug?.trim();
      if (!hasSlug) {
        setCurrentStep("onboarding");
      } else {
        setCurrentStep("profile");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error en login simulado",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!testSlug.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Slug requerido",
        description: "Por favor ingresa un slug",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular llamada a API para crear perfil
      const updatedUser = {
        ...TEST_USER,
        slug: testSlug.toLowerCase(),
        bio: testBio.trim() || null,
      };

      // Actualizar el store con el nuevo perfil
      setAuthSession({
        accessToken: "mock-access-token-123",
        refreshToken: "mock-refresh-token-123",
        user: updatedUser,
      });

      setCreatedProfile(updatedUser);
      setCurrentStep("profile");

      toast({
        title: "🎉 Perfil creado exitosamente",
        description: `Tu perfil está disponible en pina.app/${testSlug}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error al crear perfil",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (createdProfile?.slug) {
      router.push(`/${createdProfile.slug}`);
    }
  };

  const resetTest = () => {
    setCurrentStep("login");
    setTestSlug("");
    setTestBio("");
    setCreatedProfile(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">🧪 Test de Flujo de Onboarding</CardTitle>
            <CardDescription>
              Simula el flujo completo: Login → Onboarding → Perfil Público
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStep === "login" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  1. Login
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStep === "onboarding" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  2. Onboarding
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStep === "profile" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  3. Perfil
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetTest}>
                Reiniciar Test
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Paso 1: Login */}
            {currentStep === "login" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">📋 Datos de Usuario de Prueba:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Email: {TEST_USER.email}</li>
                    <li>• Nombre: {TEST_USER.fullName}</li>
                    <li>• Slug actual: {TEST_USER.slug || "❌ No tiene"}</li>
                    <li>• Bio actual: {TEST_USER.bio || "❌ No tiene"}</li>
                  </ul>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSimulateLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "🔄 Simulando login..." : "🔐 Simular Login con Google"}
                </Button>
              </div>
            )}

            {/* Paso 2: Onboarding */}
            {currentStep === "onboarding" && (
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border border-success rounded-lg">
                  <p className="text-success-foreground font-medium">✅ Login exitoso!</p>
                  <p className="text-sm text-success-foreground">El usuario no tiene slug, por lo tanto debe completar onboarding.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slug">URL de Perfil</Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        pina.app/
                      </span>
                      <Input
                        id="slug"
                        placeholder="tu-nombre"
                        value={testSlug}
                        onChange={(e) => setTestSlug(e.target.value)}
                        className="rounded-l-none"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografía (opcional)</Label>
                    <textarea
                      id="bio"
                      placeholder="Cuéntanos sobre ti..."
                      value={testBio}
                      onChange={(e) => setTestBio(e.target.value)}
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCreateProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? "🔄 Creando perfil..." : "✨ Crear Perfil"}
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: Perfil Creado */}
            {currentStep === "profile" && createdProfile && (
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border border-success rounded-lg">
                  <p className="text-success-foreground font-medium">🎉 Perfil creado exitosamente!</p>
                  <p className="text-sm text-success-foreground">
                    Tu perfil está disponible en: <strong>pina.app/{createdProfile.slug}</strong>
                  </p>
                </div>
                
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>📋 Resumen del Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Nombre:</strong> {createdProfile.fullName}</div>
                    <div><strong>Slug:</strong> @{createdProfile.slug}</div>
                    <div><strong>Email:</strong> {createdProfile.email}</div>
                    {createdProfile.bio && (
                      <div><strong>Biografía:</strong> {createdProfile.bio}</div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleViewProfile}
                  >
                    👀 Ver Perfil Público
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={resetTest}
                  >
                    🔄 Reiniciar Test
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Paso actual:</strong> {currentStep}</div>
              <div><strong>Estado de carga:</strong> {isLoading ? "Cargando..." : "Listo"}</div>
              {createdProfile && (
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Perfil creado:</strong>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(createdProfile, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}