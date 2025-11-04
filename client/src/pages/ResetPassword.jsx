import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (newPassword.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As passwords não coincidem.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Erro ao redefinir password.");
        return;
      }

      setMessage("✅ Password redefinida com sucesso! Será redirecionado para o login...");
      setTimeout(() => navigate("/login"), 5173);
    } catch (err) {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="bg-card rounded-2xl p-8 shadow-xl w-full max-w-md border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Nova Password</h2>
            <p className="text-muted-foreground text-sm">Crie uma nova password para a sua conta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nova Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Repita a password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "A processar..." : "Redefinir Password"}
          </Button>
        </form>

        <p className="text-muted-foreground text-sm text-center mt-6">
          Lembrou-se da password?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Voltar ao Login
          </Link>
        </p>
      </div>
    </div>
  );
}