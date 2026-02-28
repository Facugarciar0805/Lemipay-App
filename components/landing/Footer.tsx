"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al suscribirse.");
        return;
      }
      toast.success("¡Gracias! Te avisaremos de las novedades.");
      setEmail("");
    } catch {
      toast.error("Error al suscribirse. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      label: "X (Twitter)",
      href: "https://x.com/lemipayglobal",
      icon: XIcon,
    },
  ];

  return (
    <footer id="newsletter" className="border-t border-border/30 py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/images/lemipay-logo.jpeg" alt="Lemipay" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-bold text-foreground">
              Lemi<span className="gradient-text">pay</span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </a>
              <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border/30 pt-8 md:flex-row">
          <div className="w-full max-w-md">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Suscríbete a nuestro Newsletter
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Recibe las últimas novedades sobre Lemipay y el ecosistema de pagos grupales.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-10 flex-1 bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="h-10 px-6 font-medium"
              >
                {isSubmitting ? "Enviando…" : "Suscribirse"}
              </Button>
            </form>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <p className="text-center text-xs text-muted-foreground md:text-right">
              Powered by <span className="font-medium text-foreground/70">Stellar Soroban</span>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground md:text-right">
              © {new Date().getFullYear()} Lemipay. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
