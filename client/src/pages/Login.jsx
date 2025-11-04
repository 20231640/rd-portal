import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, GraduationCap, Home, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao iniciar sessão.");
        return;
      }

      if (data.role === "admin") {
        localStorage.setItem("loggedInAdmin", "true");
        navigate("/admin");
      } else if (data.role === "teacher") {
        localStorage.setItem("loggedInTeacher", data.teacher.email);
        navigate("/teacher-dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de rede. Verifica a ligação ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email) {
      setError("Por favor, insira o seu email para redefinir a password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Erro ao enviar email de recuperação.");
        return;
      }

      setSuccess("Email de recuperação enviado! Verifique a sua caixa de entrada.");
      setShowForgotPassword(false);
    } catch (err) {
      console.error(err);
      setError("Erro de rede. Verifica a ligação ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header consistente */}
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white border-white/30 hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar à Home
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-xl w-full max-w-md border border-border animate-fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              {showForgotPassword ? (
                <Mail className="w-8 h-8 text-primary" />
              ) : (
                <LogIn className="w-8 h-8 text-primary" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">
              {showForgotPassword ? "Recuperar Password" : "Bem-vindo 👋"}
            </h2>
            <p className="text-muted-foreground text-center">
              {showForgotPassword 
                ? "Enviaremos um link para redefinir a sua password" 
                : "Entre na sua conta para continuar"}
            </p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm font-medium text-center py-2 bg-destructive/10 rounded-lg">
                  {error}
                </p>
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

              {/* 🔥 AGORA O "ESQUECEU-SE DA PASSWORD?" ESTÁ AQUI - ABAIXO DO BOTÃO E CENTRADO */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Esqueceu-se da password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm font-medium text-center py-2 bg-destructive/10 rounded-lg">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-green-600 text-sm font-medium text-center py-2 bg-green-100 rounded-lg">
                  {success}
                </p>
              )}

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "A enviar..." : "Enviar"}
                </Button>
              </div>
            </form>
          )}

          {!showForgotPassword && (
            <p className="text-muted-foreground text-sm text-center mt-8">
              Não tens conta?{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Regista-te
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}