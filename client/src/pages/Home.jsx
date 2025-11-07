import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { HeroSection } from "../components/ui/hero-section";
import { FeatureCard } from "../components/ui/feature-card";
import { GraduationCap, School, Users, BookOpen, Heart } from "lucide-react";
import logoImage from "../assets/logo.png"; 
import { API_URL } from "../config/api";

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
      {/* Cabeçalho */}
      <header className="rd-header-bg text-white backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Informar Sem Dramatizar
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Seção Principal */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-fade-in-up flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Doenças Raras Portugal" 
              className="w-full max-w-xs h-auto object-contain transition-opacity duration-300"
              onLoad={(e) => e.target.classList.add('opacity-100')}
              onError={(e) => {
                e.target.style.display = 'none';
                // Mostrar fallback se a imagem não carregar
              }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight animate-fade-in-up mb-4">
            <span className="rd-gradient-text">
              Informar Sem Dramatizar
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium animate-fade-in-up mb-4">
            Sensibilização sobre doenças raras no contexto educativo
          </p>
          <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in-up max-w-2xl mx-auto mb-8">
            Plataforma educativa desenvolvida pela RD Portugal para escolas de língua portuguesa, com recursos pedagógicos sobre doenças raras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            {heroActions}
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="w-full h-2 rd-gradient-bg shadow-md"></div>

      {/* Estatísticas */}
      <section className="py-16 bg-primary/5 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">50+</div>
              <div className="text-lg font-semibold text-muted-foreground">Escolas Participantes</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">200+</div>
              <div className="text-lg font-semibold text-muted-foreground">Educadores Formados</div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary bg-white/50 rounded-2xl py-4 shadow-sm">1000+</div>
              <div className="text-lg font-semibold text-muted-foreground">Estudantes Alcançados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20 cards-section-bg">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<School className="w-10 h-10 text-white" />}
              title="Instituições de Ensino"
              description="Registo e gestão de escolas e outras instituições educativas participantes no programa"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-white" />}
              title="Corpo Docente"
              description="Formação contínua e acompanhamento para professores e educadores"
            />
            <FeatureCard
              icon={<BookOpen className="w-10 h-10 text-white" />}
              title="Materiais Educativos"
              description="Recursos pedagógicos adaptados a diferentes níveis de ensino"
            />
          </div>
        </div>
      </section>

      {/* Chamada para Ação */}
      <section className="py-20 text-center bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-2xl mx-auto px-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Participe nesta iniciativa</h3>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Junte-se a educadores e instituições que já estão a fazer a diferença na sensibilização sobre doenças raras.
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            Aderir à Plataforma
          </Button>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="rd-header-bg text-white py-12" role="contentinfo">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-7 h-7" aria-hidden="true" />
            <span className="text-xl font-semibold">Informar Sem Dramatizar</span>
          </div>
          <p className="text-lg mb-3">Projeto da <strong>RD Portugal</strong></p>
          <p className="text-base opacity-90 mb-2">União das Associações das Doenças Raras de Portugal</p>
          <p className="text-sm opacity-80">Recursos educativos para a comunidade escolar</p>
          
          {/* Adicionar links úteis */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm opacity-70">
              &copy; {new Date().getFullYear()} RD Portugal. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}