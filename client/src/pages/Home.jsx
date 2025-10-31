import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { HeroSection } from "../components/ui/hero-section";
import { FeatureCard } from "../components/ui/feature-card";
import { GraduationCap, School, Users, BookOpen, Heart } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const heroActions = (
    <>
      <Button 
        size="lg" 
        onClick={() => navigate("/login")}
        className="animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        Entrar na Plataforma
      </Button>
      <Button 
        size="lg" 
        variant="outline"
        onClick={() => navigate("/register")}
        className="animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        Criar Conta
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="rd-header-bg text-white backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Information Without Drama
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection
        title={
          <span className="rd-gradient-text animate-fade-in-up">
            Information Without Drama
          </span>
        }
        subtitle="Informar sem Dramas"
        description="Plataforma desenvolvida pela RD-Portugal para promover a sensibilização sem estigma sobre doenças raras nas escolas de língua portuguesa."
        actions={heroActions}
      />

      {/* Barra separadora */}
      <div className="w-full h-2 rd-gradient-bg shadow-md"></div>

      {/* Estatísticas */}
      <section className="py-16 bg-primary/5 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">50+</div>
              <div className="text-lg font-semibold text-muted-foreground">Escolas</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">200+</div>
              <div className="text-lg font-semibold text-muted-foreground">Professores</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">1000+</div>
              <div className="text-lg font-semibold text-muted-foreground">Alunos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 cards-section-bg">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<School className="w-10 h-10 text-white" />}
              title="Escolas"
              description="Registo e gestão de escolas participantes"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-white" />}
              title="Professores"
              description="Formação e acompanhamento de docentes"
            />
            <FeatureCard
              icon={<BookOpen className="w-10 h-10 text-white" />}
              title="Kits Pedagógicos"
              description="Material educativo gratuito para as aulas"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-2xl mx-auto px-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Pronto para fazer a diferença?</h3>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Junte-se a nós na missão de sensibilizar sem dramas e criar um impacto positivo na comunidade educativa.
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <GraduationCap className="w-6 h-6" />
            <span className="text-lg font-semibold">No Drama Information</span>
          </div>
          <p className="text-lg mb-2">Uma iniciativa da <strong>RD Portugal</strong></p>
          <p className="text-sm opacity-90">União das Associações das Doenças Raras de Portugal</p>
        </div>
      </footer>
    </div>
  );
}


