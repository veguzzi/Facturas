"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Field, Input } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/generar-v2";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos"
            : error.message
        );
      } else {
        router.push(next);
        router.refresh();
      }
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else if (signUpData.session) {
        // Email confirmation disabled — user is logged in immediately
        router.push(next);
        router.refresh();
      } else {
        setSuccess(
          "Cuenta creada. Revisa tu correo para confirmarla, luego inicia sesión."
        );
        setMode("login");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold"
          >
            <ReceiptText className="h-6 w-6 text-primary" />
            Factura<span className="-ml-1.5 text-primary">CO</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Accede a tu historial de facturas"
              : "Guarda tus facturas en la nube, gratis"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Nombre completo">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </Field>
            )}
            <Field label="Correo electrónico">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </Field>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Cargando…"
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Puedes usar FacturaCO sin cuenta — el registro solo sirve para guardar
          tu historial en la nube.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
