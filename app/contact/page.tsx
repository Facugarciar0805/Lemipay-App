"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare, MapPin, ArrowRight, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al enviar el mensaje.");
        return;
      }

      toast.success("¡Mensaje enviado con éxito! Te responderemos pronto.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <img
              src="/images/lemipay-logo.jpeg"
              alt="Lemipay"
              className="h-9 w-9 rounded-lg"
            />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Lemi<span className="gradient-text">pay</span>
            </span>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-[20%] left-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Soporte y Feedback
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Estamos aquí <br />
                  <span className="gradient-text">para ayudarte</span>
                </h1>
                <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
                  ¿Tienes alguna duda sobre cómo funciona Lemipay, sugerencias para mejorar o quieres reportar un problema? Escríbenos, nuestro equipo te leerá.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary border border-border/50">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Correo</h3>
                    <p className="text-sm text-muted-foreground">soporte@lemipay.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary border border-border/50">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ubicación</h3>
                    <p className="text-sm text-muted-foreground">Global (Remote)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="relative">
              {/* Card glowing effect */}
              <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent opacity-50 blur-lg" />
              
              <div className="relative rounded-3xl border border-border/50 bg-card/50 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
                <h2 className="mb-6 text-2xl font-bold text-foreground">Envíanos un mensaje</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Nombre <span className="text-muted-foreground font-normal">(Opcional)</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej. Juan Pérez"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo Electrónico *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                      className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Mensaje *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Cuéntanos en qué te podemos ayudar..."
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                      rows={5}
                      className="resize-none bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 gap-2 text-base font-medium shadow-lg transition-all hover:translate-y-[-2px] hover:shadow-primary/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensaje
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
