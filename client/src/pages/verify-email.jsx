import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MailCheck, MailX, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { API_URL } from "../config/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }

    verifyEmail();
  }, [token]);

  async function verifyEmail() {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Erro ao verificar email.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Email verificado com sucesso!");
      
      // Redireciona para login após 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Erro de rede. Tente novamente.");
    }
  }

  async function resendVerification() {
    try {
      // Precisa do email - pode pedir ao user ou guardar no localStorage durante o registo
      const email = localStorage.getItem("pendingVerificationEmail");
      
      if (!email) {
        setMessage("Email não encontrado. Por favor, faça o registo novamente.");
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setMessage(data.message || "Erro ao reenviar email.");
        return;
      }

      setMessage("✅ Novo email de verificação enviado!");
    } catch (err) {
      console.error(err);
      setMessage("Erro de rede. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-xl w-full max-w-md border border-border text-center">
        
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            status === "loading" ? "bg-blue-100" :
            status === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
            {status === "loading" && (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === "success" && <MailCheck className="w-10 h-10 text-green-600" />}
            {status === "error" && <MailX className="w-10 h-10 text-red-600" />}
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold mb-4">
          {status === "loading" && "A verificar..."}
          {status === "success" && "Email Verificado!"}
          {status === "error" && "Erro na Verificação"}
        </h1>

        {/* Mensagem */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {message || "A processar a verificação do seu email..."}
        </p>

        {/* Ações */}
        <div className="space-y-3">
          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-green-600 animate-pulse">
                A redirecionar para o login...
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button 
                onClick={resendVerification}
                variant="outline"
                className="w-full"
              >
                Reenviar Email de Verificação
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar à Home
            </Button>
          )}
        </div>

        {/* Link para suporte */}
        <p className="text-sm text-muted-foreground mt-6">
          Problemas?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contacte o suporte
          </Link>
        </p>
      </div>
    </div>
  );
}