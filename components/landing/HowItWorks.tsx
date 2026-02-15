import { Users, Landmark, Vote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const steps = [
    {
        number: "01",
        icon: Users,
        title: "Crea un Grupo",
        description: "Ingresa a tus miembros y establece las reglas de gobernanza del treasury compartido.",
        accentColor: "primary" as const,
    },
    {
        number: "02",
        icon: Landmark,
        title: "Fondea el Treasury",
        description: "Inicia una ronda de aportes. Cada contribución queda registrada de forma transparente.",
        accentColor: "secondary" as const,
    },
    {
        number: "03",
        icon: Vote,
        title: "Vota y Paga",
        description: "Crea propuestas de gasto y apruébalas democráticamente. Sin intermediarios.",
        accentColor: "primary" as const,
    },
];

const HowItWorks = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="como-funciona" className="relative py-24 px-4 md:px-6">
            <div ref={ref} className="container mx-auto max-w-5xl">
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <span className="mb-3 inline-block text-sm font-medium text-primary">Simple y seguro</span>
                    <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                        ¿Cómo <span className="gradient-text">funciona</span>?
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className={`glass-card gradient-border p-8 transition-all duration-700 hover:scale-[1.02] hover:glow-purple ${
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                            }`}
                            style={{ transitionDelay: `${i * 150}ms` }}
                        >
              <span className="font-display text-5xl font-bold gradient-text opacity-30">
                {step.number}
              </span>
                            <div className={`mt-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                                step.accentColor === "primary" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                            }`}>
                                <step.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                                {step.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
