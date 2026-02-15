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
  const socialLinks = [
    {
      label: "X (Twitter)",
      href: "https://x.com/lemipayglobal",
      icon: XIcon,
    },
  ];

  return (
    <footer className="border-t border-border/30 py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/images/lemipay-logo.jpeg" alt="Lemipay" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-bold text-foreground">
              Lemi<span className="gradient-text">pay</span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground md:text-left">
          Powered by <span className="font-medium text-foreground/70">Stellar Soroban</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
