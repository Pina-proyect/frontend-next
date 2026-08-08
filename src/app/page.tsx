import Link from "next/link";
import { PublicHeader } from "@/components/public-header";

export default function Home() {
  return (
    <>
      <PublicHeader />

      <main className="pt-24 min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-[1.1]">
                Empoderando a los <span className="text-primary">Creadores</span> del Mañana.
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Bienvenido al estudio digital donde la elegancia se encuentra con la ejecución. Una plataforma diseñada para artistas que exigen lo mejor de sus herramientas.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-primary/20 transition-all">
                    Empezar Ahora
                  </button>
                </Link>
                <Link href="/explore">
                  <button className="glass-panel border border-outline-variant/20 text-primary px-8 py-4 rounded-xl font-semibold hover:bg-surface-container-low transition-all">
                    Ver Galería
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl rotate-3 translate-x-12">
                <img className="w-full h-full object-cover" alt="Artista digital trabajando" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH_RLcn7w_n6oAcho-I4fbkch7aaVDJfC-jOMzgWVY4mEFhl-ZevUiamYzQdpTG0Z1E40OMGcU9Qc43cFaP_2w0yBtQUyEVvERr0s7tsqlnYsGF0Zr_qXMpLGYbVzNAzVQzQvH5wSyNDLZmTaAdORi2qwdhkYMOwktnOKVsKzFBSEWkXOOXclEPE5pQnPHCiQjj3ZVDzmid-8w-aRnGyWc2cwf35cBZkCmRnjXdC12O-j0Y1DQmzBQZsM3Kh0FA1nK71ALaBJ6_gdz"/>
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 aspect-square rounded-2xl overflow-hidden shadow-xl -rotate-6 glass-panel p-2">
                <img className="w-full h-full object-cover rounded-xl" alt="Paleta de pintura al óleo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC1KpXzqVywbiGZUBN_E69cDJk-3iaJq5csKdjSIdqnu26qsaPdpF0gnJoBaTZBj1DNByOmhuiS9bUPoblFxAofaM-1sBWQvSbI5wdrHafQVg7T2hj08AVe-ra9Z2KJXfVrXqSzD2A2eGJqIzBcEBeluJv9LdwsO-ewCqX6f55vCGQRUmAJ7Dohrilz7pwnlB8ztSGprsmo32dkMSXcvyJn54Nwe1Vin-6e8kEZXuHwszXZagtyqXe5XQkexeqca0HzOLazVfYYCP1"/>
              </div>
            </div>
          </div>
          
          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary-fixed blur-[120px] rounded-full"></div>
          </div>
        </section>

        {/* Monetization with Elegance (Bento Grid) */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-4 text-on-surface">Monetización con Elegancia</h2>
              <p className="text-on-secondary-container max-w-2xl">Transforma tu pasión en una carrera sostenible con herramientas diseñadas para no interferir en tu proceso creativo.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Card */}
              <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-6">payments</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">Ingresos Transparentes</h3>
                  <p className="text-on-surface-variant leading-relaxed max-w-md">Sin cargos ocultos. Nuestra estructura de comisiones está diseñada para que el artista conserve la mayor parte de su valor.</p>
                </div>
                <div className="mt-12 h-48 bg-surface-container rounded-lg flex items-end p-6 gap-2 overflow-hidden">
                  <div className="w-full bg-primary/20 h-[40%] rounded-t-lg"></div>
                  <div className="w-full bg-primary/40 h-[60%] rounded-t-lg"></div>
                  <div className="w-full bg-primary/30 h-[50%] rounded-t-lg"></div>
                  <div className="w-full bg-primary/60 h-[85%] rounded-t-lg"></div>
                  <div className="w-full bg-primary/50 h-[70%] rounded-t-lg"></div>
                  <div className="w-full bg-primary h-full rounded-t-lg"></div>
                </div>
              </div>
              
              {/* Small Vertical Card */}
              <div className="bg-primary text-on-primary p-10 rounded-xl flex flex-col justify-between">
                <span className="material-symbols-outlined text-4xl mb-6">workspace_premium</span>
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Acceso Exclusivo</h3>
                  <p className="text-on-primary/80">Crea niveles de membresía que tus fans adorarán. Desde contenido detrás de escena hasta mentorías 1:1.</p>
                </div>
              </div>
              
              {/* Small Card 1 */}
              <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">brush</span>
                <h3 className="font-headline text-xl font-bold mb-3">Tu Marca, Tu Estilo</h3>
                <p className="text-on-surface-variant text-sm">Personaliza tu perfil hasta el último detalle para que coincida con tu estética personal.</p>
              </div>
              
              {/* Small Card 2 */}
              <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-primary-container text-4xl mb-6">auto_awesome</span>
                <h3 className="font-headline text-xl font-bold mb-3">IA para el Bien</h3>
                <p className="text-on-surface-variant text-sm">Herramientas de IA que ayudan a organizar tu flujo de trabajo, no a reemplazar tu creatividad.</p>
              </div>
              
              {/* Medium Card */}
              <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-secondary text-4xl mb-6">shield_with_heart</span>
                <h3 className="font-headline text-xl font-bold mb-3">Protección Total</h3>
                <p className="text-on-surface-variant text-sm">Sistemas avanzados de marca de agua y protección de derechos de autor integrados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Community Section */}
        <section className="py-24 px-8 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <img className="w-full aspect-[3/4] object-cover rounded-xl" alt="Retrato de un artista ceramista" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ddUKSCZ0E3fWkkKFO6zydtSEpHr2Qw07crwkR6vhD0q6116g85vsfEH7mueHlgtUCgiNp3kFzN1lLokSzm-uJrvp1Tm6Mzkk0gNppEVffiYfTnU83X3oaPQMAJD9PCDrUonPaCQRjW4ScueBB7y3aRWG9656RYfwLi0fpXjLW8Q2Q7k8mYHrJLW2oIyMOBlfx4yAXcEig22vCP9Yb48UE6PEO7Tg-uF4n5NwHICIgnjL6kY7Y4M3Rq0olxCrayIRUIGZEfaQeExo"/>
                <img className="w-full aspect-square object-cover rounded-xl" alt="Diseñador de moda" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXQUurC2hpzvTZZfi07EvTZZ6Rlw-Dl929LLhHFgQaJY8XjS3zeOLpmAZW8kSiIWeh9FKK6w7JV-FLD8v3Z7wOz02NLiX6CoVwLJ726fa6_hO2zPlQHg5gfoYeJpt4ivjzcLZlMlQPi0paxquFtOS1BSSKwyNfa7_U3EiolCkOugR9V6m_4Vurm6BrUv6xkiXf1bugGd3kzUnFVKCesvQR9SYQmlPDxLrI3l6pVtRACyee-DVYkZ0Ahqig8AHKpAakQv5YVzqI1gQx"/>
              </div>
              <div className="space-y-4">
                <img className="w-full aspect-square object-cover rounded-xl" alt="Productor de música electrónica" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnAbMBRW1IUyAE28MMivUEZ9LyUYUfnGAql7Ulwe93s-8GkaSnMb0w_AAOb1qHaIFGHqF9N0alTASlDsZ2I2RDV3OOzvOtkxh3FoTQSiw6hdVa8fcjaRDi4nNbcVSwQqaUd7XChptLFLWsQQcnGnD8yFncO5-n_JZID5nqltXbDXWiacgrQ2MHl2kez36VCkIVWe-KvluqqKhUcz-0oaf0AbYrznTnWeQ1fasgrxd4VbgW8Wngu2-CEoUg0Ayi3sDVrlC-gINqpIAF"/>
                <img className="w-full aspect-[3/4] object-cover rounded-xl" alt="Fotógrafo callejero" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtA0hChM7oapnxZyk_8plC1vJ2lpAOjMOqNWxC7OdRQtMKlXx14_IP5jE8o1yBtACtNqJO1xzqxGuxBwQy3DCLz-1z_t_6IY3NpGpXFFfPeBga8euFSKgMUVm7toe0PUbxERtuQj99ShTlvWFAtprYF-WsSe6c2Wvu_oVcHvTG1CYM1efYt35Qu9Klid2FRmgEMFqkkcdz2gN52RJ02S8A1YTwatezhXLY8x5SGETyn1tYCKMeNDIOb82r0vdLS_6dXJD-5QaaRH5E"/>
              </div>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6 text-on-surface">Comunidad de Creadores</h2>
              <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                No eres solo un usuario, eres parte de un colectivo. Pina reúne a mentes brillantes de todo el mundo para colaborar, aprender y crecer juntos.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-primary-fixed p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">groups</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Círculos de Crítica</h4>
                    <p className="text-on-secondary-container text-sm">Recibe feedback constructivo de tus pares en un entorno seguro y profesional.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-tertiary-fixed p-2 rounded-lg">
                    <span className="material-symbols-outlined text-tertiary">rocket_launch</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Lanzamientos Conjuntos</h4>
                    <p className="text-on-secondary-container text-sm">Colabora en proyectos masivos y llega a nuevas audiencias globales.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Join the Estudio (Final CTA) */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-[2rem] p-12 md:p-24 text-center text-on-primary relative overflow-hidden shadow-2xl">
            {/* Abstract Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter mb-8 relative z-10">Únete al Estudio</h2>
            <p className="text-xl text-on-primary-container max-w-2xl mx-auto mb-12 relative z-10">
              Tu mejor trabajo está por venir. Registra tu interés hoy y sé de los primeros en experimentar el futuro de la economía creativa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <input className="bg-white/10 border border-white/20 text-white placeholder:text-white/60 px-8 py-4 rounded-xl w-full sm:w-80 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all font-body" placeholder="Tu correo electrónico" type="email" />
              <Link href="/login">
                <button className="bg-white text-primary px-10 py-4 rounded-xl font-bold hover:bg-surface-bright transition-all shadow-xl h-full w-full">
                  Solicitar Acceso
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-surface-container-low dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold text-on-surface dark:text-white mb-4">Pina</div>
              <p className="text-on-secondary-container text-sm leading-relaxed">
                El primer estudio digital diseñado específicamente para la elegancia creativa y la independencia del artista.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-4">Legal</h4>
              <ul className="space-y-3 font-body text-sm">
                <li><Link href="#" className="text-on-secondary-container hover:underline opacity-80 hover:opacity-100">Términos</Link></li>
                <li><Link href="#" className="text-on-secondary-container hover:underline opacity-80 hover:opacity-100">Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-4">Empresa</h4>
              <ul className="space-y-3 font-body text-sm">
                <li><Link href="#" className="text-on-secondary-container hover:underline opacity-80 hover:opacity-100">Careers</Link></li>
                <li><Link href="#" className="text-on-secondary-container hover:underline opacity-80 hover:opacity-100">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-4">Social</h4>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-on-secondary-container cursor-pointer hover:text-primary">language</span>
                <span className="material-symbols-outlined text-on-secondary-container cursor-pointer hover:text-primary">camera</span>
                <span className="material-symbols-outlined text-on-secondary-container cursor-pointer hover:text-primary">play_circle</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 text-on-secondary-container w-full text-xs">
            <div>© 2024 Pina Digital Estudio. Todos los derechos reservados.</div>
            <div className="flex gap-8">
              <span>Hecho con elegancia</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Font Injection for Material Symbols */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
      `}} />
    </>
  );
}