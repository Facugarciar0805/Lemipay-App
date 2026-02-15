"use client"

import { Users, Landmark, Vote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const steps = [
    {
        number: "01",
        icon: Users,
        title: "Crea un Grupo",
        description: "Ingresa a tus miembros y establece las reglas de gobernanza de la tesorería compartido.",
    },
    {
        number: "02",
        icon: Landmark,
        title: "Fondea la Tesorería",
        description: "Inicia una ronda de aportes. Cada contribución queda registrada de forma transparente.",
    },
    {
        number: "03",
        icon: Vote,
        title: "Vota y Paga",
        description: "Crea propuestas de gasto y apruébalas democráticamente. Sin intermediarios.",
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
                    {steps.map((step, i) => {
                        // Lógica de alternancia: 
                        // i=0 (Paso 01): Verde | i=1 (Paso 02): Violeta | i=2 (Paso 03): Verde
                        const isEvenStep = (i + 1) % 2 === 0;
                        const colorClass = isEvenStep ? "text-brand-purple" : "text-primary";
                        const bgClass = isEvenStep ? "bg-brand-purple/15" : "bg-primary/15";

                        return (
                            <div
                                key={step.number}
                                className={`glass-card gradient-border p-8 transition-all duration-700 hover:scale-[1.02] ${
                                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                }`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                {/* El número ahora usa el color alternado con opacidad */}
                                <span className={`font-display text-5xl font-bold opacity-30 ${colorClass}`}>
                                    {step.number}
                                </span>

                                <div className={`mt-4 flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
                                    <step.icon className="h-6 w-6" />
                                </div>

                                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;