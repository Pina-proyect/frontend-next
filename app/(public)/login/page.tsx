"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Componentes Shadcn/UI (Ya deben estar instalados)
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Lógica de Negocio
import { http } from "@/lib/http-client"
import { setAuthSession, type User } from "@/store/use-auth-store"

// Esquema de validación con Zod
const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

// Tipos del DTO de respuesta del Backend
interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await http<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      })
      setAuthSession(response)
      router.push("/dashboard") // Redirigir
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error?.message || "Credenciales incorrectas",
      })
    }
  }

  const handleGoogleLogin = () => {
    // Redirige al endpoint del backend que inicia el flujo OAuth
    // Usar ruta relativa para aprovechar rewrites y cookies HttpOnly en dev.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "/api/pina"
    window.location.href = `${backendUrl}/auth/google`
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales o usa un proveedor</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* BOTÓN DE GOOGLE (incluye ícono SVG y explicación breve) */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          // Comentario: usamos variant="outline" para respetar el estilo neutral;
          // el borde utiliza el token `border` y en hover mantiene buen contraste.
        >
          {/* Ícono oficial de Google estilizado para 16px (accesible) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="mr-2 size-4"
          >
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.076 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.843 1.154 7.961 3.039l5.657-5.657C33.826 6.053 29.143 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.493 0 19.191-8.032 19.191-20 0-1.341-.139-2.651-.401-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.194 16.316 18.776 14 24 14c3.059 0 5.843 1.154 7.961 3.039l5.657-5.657C33.826 6.053 29.143 4 24 4 16.318 4 9.544 8.338 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.18 0 9.9-1.977 13.426-5.197l-6.2-5.233C29.206 35.135 26.735 36 24 36c-5.202 0-9.612-3.317-11.273-7.952l-6.5 5.02C6.941 39.556 14.85 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.79 2.236-2.286 4.154-4.177 5.47l6.2 5.233C39.045 36.851 42 31.492 42 24c0-1.341-.139-2.651-.401-3.917z"/>
          </svg>
          Iniciar sesión con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>

        {/* FORMULARIO CONVENCIONAL */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="creadora@pina.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="underline">
            Regístrate
          </Link>
        </div>
        {/* Aviso de privacidad y cookies para OAuth */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestra política de privacidad y el uso de cookies necesarias para autenticación.
          {" "}
          <Link href="/privacy" className="underline">Más información</Link>
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/diagnostics/dev-login" className="underline">
              Entrar con usuario de prueba (dev)
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}