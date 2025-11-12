import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { UserPlus, GraduationCap, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import "react-phone-input-2/lib/style.css";
import { API_URL } from "../config/api";
import { supabase } from "../config/supabase"; // ✅ NOVO

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    school: "",
    region: "",
  });
  const [message, setMessage] = useState("");
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // ✅ NOVO
  const regions = [
    "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra",
    "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre",
    "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu",
    "Região Autónoma da Madeira", "Região Autónoma dos Açores"
  ];
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/auth/schools`)
      .then(res => res.json())
      .then(data => setSchools(data.filter(s => s.approved).map(s => s.name)))
      .catch(console.error);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsLoading(true); // ✅ NOVO

    // Validações (mantenha as mesmas)
    if (form.password !== form.confirmPassword) {
      setMessage("❌ Password e confirmação não coincidem.");
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setMessage("❌ Password deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("❌ Email inválido.");
      setIsLoading(false);
      return;
    }

    if (!form.phone) {
      setMessage("❌ Preenche o telefone.");
      setIsLoading(false);
      return;
    }

    if (!form.region) {
      setMessage("❌ Seleciona uma região/distrito.");
      setIsLoading(false);
      return;
    }

    try {
      // ✅ NOVO: Registo com Supabase Auth
      console.log('🔄 A registar com Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            phone: form.phone,
            school: form.school,
            region: form.region
          }
        }
      });

      if (error) {
        console.error('❌ Erro Supabase:', error);
        setMessage("❌ " + error.message);
        return;
      }

      console.log('✅ Registo Supabase bem-sucedido:', data);
      
      // ✅ Criar professor na nossa base de dados
      if (data.user) {
        await createTeacherInDatabase(data.user, form);
      }

      setMessage("✅ Registo efetuado! Verifique o seu email para ativar a conta.");
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err) {
      console.error('💥 Erro:', err);
      setMessage("Erro de rede. Verifica a ligação ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ FUNÇÃO CORRIGIDA: Criar professor na nossa BD
  async function createTeacherInDatabase(user, formData) {
    try {
      console.log('🔄 A criar professor na nossa BD...', user.id);
      
      const response = await fetch(`${API_URL}/api/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUserId: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          school: formData.school,
          region: formData.region
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ Erro ao criar professor na BD:', responseData);
        throw new Error(responseData.error || 'Erro ao criar professor');
      } else {
        console.log('✅ Professor criado com sucesso na nossa BD:', responseData);
        return responseData;
      }
    } catch (err) {
      console.error('💥 Erro ao criar professor:', err);
      throw err; // Propaga o erro para tratamento superior
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
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Criar Conta</h2>
            <p className="text-muted-foreground text-center">Registe-se para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nome", name: "name", type: "text", placeholder: "Seu nome completo" },
              { label: "Email", name: "email", type: "email", placeholder: "seu@email.com" },
              { label: "Password", name: "password", type: "password", placeholder: "Mínimo 6 caracteres" },
              { label: "Confirmar Password", name: "confirmPassword", type: "password", placeholder: "Confirme a senha" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className="space-y-2">
                <label className="block text-sm font-medium">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="block text-sm font-medium">Telefone</label>
              <div className="relative">
                <PhoneInput
                  country={"pt"}
                  value={form.phone}
                  onChange={(value) => setForm({ ...form, phone: value })}
                  containerClass="!w-full phone-input-container"
                  inputClass="!w-full !rounded-xl !py-3 !pl-12 !pr-4 
                              !bg-background !border !border-input 
                              !text-foreground placeholder:!text-muted-foreground
                              focus:!outline-none focus:!ring-2 focus:ring-primary focus:!border-transparent
                              !transition-all !duration-200"
                  buttonClass="!bg-transparent !border-none !left-1 !rounded-l-xl"
                  dropdownClass="phone-input-dropdown"
                  searchClass="phone-input-search"
                  enableSearch={true}
                  specialLabel=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Escola</label>
              <input
                list="school-list"
                name="school"
                placeholder="Selecione ou digite o nome da escola"
                value={form.school}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
              <datalist id="school-list">
                {schools.map(school => <option key={school} value={school} />)}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Região/Distrito</label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="">Selecione a região</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
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
              {isLoading ? "A registar..." : "Registar"}
            </Button>
          </form>

          <p className="text-muted-foreground text-sm text-center mt-8">
            Já tens conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


