import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          {/* Logo o Marca */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
            <span className="text-3xl font-bold text-primary">P</span>
          </div>
          
          {/* Título Principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
            Bienvenida a PINA
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tu espacio de contenido exclusivo
          </p>
          
          {/* Botón de Acción */}
          <div className="pt-8">
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Entrar con Google
              </Button>
            </Link>
          </div>
          
          {/* Características */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary text-xl">🎨</span>
              </div>
              <h3 className="font-semibold text-lg">Contenido Exclusivo</h3>
              <p className="text-muted-foreground text-sm">Accede a contenido único de tus creadoras favoritas</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary text-xl">💬</span>
              </div>
              <h3 className="font-semibold text-lg">Comunidad</h3>
              <p className="text-muted-foreground text-sm">Interactúa directamente con creadoras y otros fans</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary text-xl">🚀</span>
              </div>
              <h3 className="font-semibold text-lg">Acceso Directo</h3>
              <p className="text-muted-foreground text-sm">Conecta con Google de forma rápida y segura</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-16 text-center">
            <p className="text-muted-foreground text-sm">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}