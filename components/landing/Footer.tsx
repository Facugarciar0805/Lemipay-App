
const Footer = () => {
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

                    <p className="text-xs text-muted-foreground">
                        Powered by <span className="font-medium text-foreground/70">Stellar Soroban</span>
                    </p>

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
        </footer>
    );
};

export default Footer;
