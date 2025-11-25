import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, GraduationCap, Home, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { API_URL } from "../config/api";
import { supabase } from "../config/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    console.log('🔍 A iniciar o LOGIN...');

    try {
      // Verificação especial para admin
      if (email === "admin@rd.pt") {
        console.log('👨‍💼 Tentando login como admin...');
        
        if (password === "admin123") {
          console.log('✅ Login admin bem-sucedido');
          localStorage.setItem("loggedInAdmin", "true");
          localStorage.setItem("adminEmail", "admin@rd.pt");
          navigate("/admin");
          return;
        } else {
          setError("Credenciais de administrador inválidas");
          return;
        }
      }

      // Login normal para professores
      console.log('🔄 Step 1: Fazendo login com Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('❌ Erro no Supabase Auth:', error);
        
        if (error.message.includes('Email not confirmed')) {
          setError("Por favor, verifique o seu email antes de fazer login.");
          return;
        }
        
        setError("❌ " + error.message);
        return;
      }

      console.log('✅ Step 1: Login Supabase bem-sucedido:', data.user.id);
      
      // Login bem-sucedido
      const user = data.user;
      
      console.log('👨‍🏫 Step 2: Buscando dados do professor...');
      
      // Buscar dados do professor da nossa tabela
      try {
        const teacherResponse = await fetch(`${API_URL}/api/teachers/email/${user.email}`);
        console.log('📡 Status da resposta teacher:', teacherResponse.status);
        
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          console.log('✅ Dados do professor:', teacherData);
          
          // ✅ VERIFICAÇÃO DE PROFESSOR ARQUIVADO
          if (teacherData.archived) {
            console.log('🚫 Professor arquivado, bloqueando login...');
            setError("Esta conta foi arquivada. Contacte o administrador.");
            
            // Fazer logout do Supabase para limpar sessão
            await supabase.auth.signOut();
            return;
          }
          
          localStorage.setItem("teacherData", JSON.stringify(teacherData));
          localStorage.setItem("loggedInTeacher", user.email);
          
          console.log('💾 Dados salvos no localStorage');
        } else {
          console.warn('⚠️ Professor não encontrado na nossa BD, mas continuando...');
          
          // Criar dados básicos no localStorage
          localStorage.setItem("teacherData", JSON.stringify({
            id: user.id,
            name: user.user_metadata?.name || user.email.split('@')[0],
            email: user.email,
            school: { name: "Escola não definida" }
          }));
          localStorage.setItem("loggedInTeacher", user.email);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar dados do professor:', err);
        
        // Criar dados básicos mesmo com erro
        localStorage.setItem("teacherData", JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || user.email.split('@')[0],
          email: user.email,
          school: { name: "Escola não definida" }
        }));
        localStorage.setItem("loggedInTeacher", user.email);
      }

      console.log('🔄 Step 3: Redirecionando para teacher-dashboard...');
      
      // Forçar redirecionamento
      setTimeout(() => {
        console.log('🎯 Executando navigate...');
        navigate("/teacher-dashboard");
      }, 100);

    } catch (err) {
      console.error('💥 Erro fatal no login:', err);
      setError("Erro de rede. Verifique a ligação ao servidor.");
    } finally {
      console.log('🏁 Finalizando função handleSubmit');
      setIsLoading(false);
    }
  }

  // Nova função: Reenviar verificação de email
  async function handleResendVerification() {
    if (!email) {
      setError("Por favor, insira o seu email.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 A reenviar verificação...');
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('❌ Erro Supabase:', error);
        setError("❌ " + error.message);
        return;
      }

      setSuccess("Novo email de verificação enviado!");
      setError(""); // Limpa erros anteriores
    } catch (err) {
      console.error('💥 Erro:', err);
      setError("Erro de rede. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
    <header className="rd-header-bg text-white backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
            <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Informar sem Dramatizar
          </span>
        </div>

        {/* Botões - lado direito */}
        <div className="flex items-center gap-3">
          {/* Botão Voltar - apenas ícone em mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white border-white/30 hover:bg-white/20 hidden sm:flex"
            title="Voltar à Página Inicial"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          {/* Versão mobile do botão Voltar - apenas ícone */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white border-white/30 hover:bg-white/20 sm:hidden"
            title="Voltar à Página Inicial"
          >
            <Home className="w-4 h-4" />
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-xl w-full max-w-md border border-border animate-fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Bem-vindo 👋</h2>
            <p className="text-muted-foreground text-center">
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Escreva o seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Palavra-passe</label>
              <input
                type="password"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Escreva a sua palavra-passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-center space-y-2">
                <p className="text-destructive text-sm font-medium py-2 bg-destructive/10 rounded-lg">
                  {error}
                </p>
                {/* Botão para reenviar verificação */}
                {error.includes("verifique o seu email") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {isLoading ? "A enviar..." : "Reenviar email de verificação"}
                  </Button>
                )}
              </div>
            )}

            {success && (
              <p className="text-green-600 text-sm font-medium text-center py-2 bg-green-100 rounded-lg">
                {success}
              </p>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-2 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "A processar..." : "Entrar"}
            </Button>

            {/* Link para recuperação */}
            <div className="text-center pt-4">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Esqueceu-se da palavra-passe?
              </Link>
            </div>
          </form>

          <p className="text-muted-foreground text-sm text-center mt-8">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Registe-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}