import { GraduationCap } from "lucide-react";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  actions: React.ReactNode;
};

export function HeroSection({ title, subtitle, description, actions }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        </div>
        {/* Título com gradiente e efeito */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {title}
        </h1>
        
        {/* Subtítulo mais destacado */}
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 tracking-wide">
          {subtitle}
        </h2>
        
        {/* Descrição com melhor legibilidade */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
        
        {/* Container dos botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {actions}
        </div>
      </div>
    </section>
  );
}