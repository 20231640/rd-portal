import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { supabase } from "../config/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ As passwords não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("❌ A password deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setMessage("❌ " + error.message);
        return;
      }

      setMessage("✅ Password alterada com sucesso! Redirecionando para login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("❌ Erro ao alterar password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="rd-header-bg text-white backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
              <Key className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Nova Password
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-white border-white/30 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-xl w-full max-w-md border border-border">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Nova Password</h2>
            <p className="text-muted-foreground text-center text-sm">
              Define uma nova password para a tua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nova Password</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Confirmar Password</label>
              <input
                type="password"
                placeholder="Confirma a nova password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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
              className="w-full mt-2 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "A alterar..." : "Alterar Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}