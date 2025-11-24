import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { supabase } from "../config/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage("❌ " + error.message);
        return;
      }

      setMessage("Email de recuperação enviado! Verifique a sua caixa de correio.");
    } catch (err) {
      setMessage("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="rd-header-bg text-white backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
               <Mail className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">
               Recuperar Palavra-passe
             </span>
           </div>
           <div className="flex items-center gap-4">
             <Button
               variant="outline"
               size="sm"
               onClick={() => window.history.back()}
               className="text-white border-white/30 hover:bg-white/20"
             >
               <ArrowLeft className="w-4 h-4 mr-2" />
               Voltar
             </Button>
             <ThemeToggle />
           </div>
         </div>
       </header>
 
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="bg-card text-card-foreground rounded-2xl p-4 sm:p-8 shadow-xl w-full max-w-md border border-border">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Recuperar Palavra-passe</h2>
            <p className="text-muted-foreground text-center text-sm">
              Introduza o seu e-mail e será enviado um link para redefinir a palavra-passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="o_seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>

            {message && (
              <div className={`text-center text-sm font-medium py-3 rounded-xl ${
                message.includes("✅") 
                  ? "text-green-600 bg-green-50 border border-green-200" 
                  : "text-destructive bg-destructive/10 border border-destructive/20"
              }`}>
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-xl"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? "A enviar..." : "Enviar Link de Recuperação"}
            </Button>
          </form>

          <div className="text-center space-y-4 mt-8">
            <p className="text-muted-foreground text-sm">
              Já tem a palavra-passe?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Iniciar sessão
              </Link>
            </p>
            <p className="text-muted-foreground text-sm">
              Ainda não tem conta?{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Registar-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}