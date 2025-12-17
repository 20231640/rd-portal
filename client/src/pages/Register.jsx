import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { UserPlus, GraduationCap, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import "react-phone-input-2/lib/style.css";
import { API_URL } from "../config/api";
import { supabase } from "../config/supabase";

// Tente importar o pacote - pode ter diferentes formas de exportação
let municipalitiesList = [];

// Primeiro, tente importar dinamicamente para evitar erros
import('portuguese-municipalities')
  .then(module => {
    console.log('Package structure:', module);
    // Experimente diferentes formas de acesso
    if (module.municipalities) {
      municipalitiesList = module.municipalities;
    } else if (module.default && Array.isArray(module.default)) {
      municipalitiesList = module.default;
    } else if (Array.isArray(module)) {
      municipalitiesList = module;
    }
    
    // Ordenar alfabeticamente
    municipalitiesList = municipalitiesList.sort((a, b) => 
      a.localeCompare(b, 'pt')
    );
  })
  .catch(err => {
    console.warn('Erro ao carregar municípios do pacote:', err);
    // Fallback para lista estática
    municipalitiesList = getFallbackMunicipalities();
  });

function getFallbackMunicipalities() {
  return [
    "Abrantes", "Águeda", "Aguiar da Beira", "Alandroal", "Albergaria-a-Velha", "Albufeira",
    "Alcácer do Sal", "Alcanena", "Alcobaça", "Alcochete", "Alcoutim", "Alenquer", "Alfândega da Fé",
    "Alijó", "Aljezur", "Aljustrel", "Almada", "Almeida", "Almeirim", "Almodôvar", "Alpiarça",
    "Alter do Chão", "Alvaiázere", "Alvito", "Amadora", "Amarante", "Amares", "Anadia",
    "Angra do Heroísmo", "Ansião", "Arcos de Valdevez", "Arganil", "Armamar", "Arouca", "Arraiolos",
    "Arronches", "Arruda dos Vinhos", "Aveiro", "Avis", "Azambuja", "Baião", "Barcelos", "Barrancos",
    "Barreiro", "Batalha", "Beja", "Belmonte", "Benavente", "Bombarral", "Borba", "Boticas", "Braga",
    "Bragança", "Cabeceiras de Basto", "Cadaval", "Caldas da Rainha", "Calheta (Açores)",
    "Calheta (Madeira)", "Câmara de Lobos", "Caminha", "Campo Maior", "Cantanhede",
    "Carrazeda de Ansiães", "Carregal do Sal", "Cartaxo", "Cascais", "Castanheira de Pêra",
    "Castelo Branco", "Castelo de Paiva", "Castelo de Vide", "Castro Daire", "Castro Marim",
    "Castro Verde", "Celorico da Beira", "Celorico de Basto", "Chamusca", "Chaves", "Cinfães",
    "Coimbra", "Condeixa-a-Nova", "Constância", "Coruche", "Corvo", "Covilhã", "Crato", "Cuba",
    "Elvas", "Entroncamento", "Espinho", "Esposende", "Estarreja", "Estremoz", "Évora", "Fafe",
    "Faro", "Felgueiras", "Ferreira do Alentejo", "Ferreira do Zêzere", "Figueira da Foz",
    "Figueira de Castelo Rodrigo", "Figueiró dos Vinhos", "Fornos de Algodres",
    "Freixo de Espada à Cinta", "Fronteira", "Funchal", "Fundão", "Gavião", "Góis", "Golegã",
    "Gondomar", "Gouveia", "Grândola", "Guarda", "Guimarães", "Horta", "Idanha-a-Nova", "Ílhavo",
    "Lagoa", "Lagoa (Açores)", "Lagos", "Lajes das Flores", "Lajes do Pico", "Lamego", "Leiria",
    "Lisboa", "Loulé", "Loures", "Lourinhã", "Lousã", "Lousada", "Mação", "Macedo de Cavaleiros",
    "Machico", "Madalena", "Mafra", "Maia", "Mangualde", "Manteigas", "Marco de Canaveses",
    "Marinha Grande", "Marvão", "Matosinhos", "Mealhada", "Mêda", "Melgaço", "Mértola", "Mesão Frio",
    "Mira", "Miranda do Corvo", "Miranda do Douro", "Mirandela", "Mogadouro", "Moimenta da Beira",
    "Moita", "Monção", "Monchique", "Mondim de Basto", "Monforte", "Montalegre", "Montemor-o-Novo",
    "Montemor-o-Velho", "Montijo", "Mora", "Mortágua", "Moura", "Mourão", "Murça", "Murtosa",
    "Nazaré", "Nelas", "Nisa", "Nordeste", "Óbidos", "Odemira", "Odivelas", "Oeiras", "Oleiros",
    "Olhão", "Oliveira de Azeméis", "Oliveira de Frades", "Oliveira do Bairro",
    "Oliveira do Hospital", "Ourém", "Ourique", "Ovar", "Paços de Ferreira", "Palmela",
    "Pampilhosa da Serra", "Paredes", "Paredes de Coura", "Pedrógão Grande", "Penacova",
    "Penafiel", "Penalva do Castelo", "Penamacor", "Penedono", "Penela", "Peniche", "Peso da Régua",
    "Pinhel", "Pombal", "Ponta Delgada", "Ponta do Sol", "Ponte da Barca", "Ponte de Lima",
    "Ponte de Sor", "Portalegre", "Portel", "Portimão", "Porto", "Porto de Mós", "Porto Moniz",
    "Porto Santo", "Póvoa de Lanhoso", "Póvoa de Varzim", "Povoação", "Proença-a-Nova", "Redondo",
    "Reguengos de Monsaraz", "Resende", "Ribeira Brava", "Ribeira de Pena", "Ribeira Grande",
    "Rio Maior", "Sabrosa", "Sabugal", "Salvaterra de Magos", "Santa Comba Dão", "Santa Cruz",
    "Santa Cruz da Graciosa", "Santa Cruz das Flores", "Santa Maria da Feira", "Santa Marta de Penaguião",
    "Santana", "Santarém", "Santiago do Cacém", "Santo Tirso", "São Brás de Alportel", "São João da Madeira",
    "São João da Pesqueira", "São Pedro do Sul", "São Roque do Pico", "São Vicente", "Sardoal", "Sátão",
    "Seia", "Seixal", "Sernancelhe", "Serpa", "Sertã", "Sesimbra", "Setúbal", "Sever do Vouga", "Silves",
    "Sines", "Sintra", "Sobral de Monte Agraço", "Soure", "Sousel", "Tábua", "Tabuaço", "Tarouca", "Tavira",
    "Terras de Bouro", "Tomar", "Tondela", "Torre de Moncorvo", "Torres Novas", "Torres Vedras", "Trancoso",
    "Trofa", "Vagos", "Vale de Cambra", "Valença", "Valongo", "Valpaços", "Vendas Novas", "Viana do Alentejo",
    "Viana do Castelo", "Vidigueira", "Vieira do Minho", "Vila de Rei", "Vila do Bispo", "Vila do Conde",
    "Vila do Porto", "Vila Flor", "Vila Franca de Xira", "Vila Franca do Campo", "Vila Nova da Barquinha",
    "Vila Nova de Cerveira", "Vila Nova de Famalicão", "Vila Nova de Foz Côa", "Vila Nova de Gaia",
    "Vila Nova de Paiva", "Vila Nova de Poiares", "Vila Pouca de Aguiar", "Vila Real", "Vila Real de Santo António",
    "Vila Velha de Ródão", "Vila Viçosa", "Vimioso", "Vinhais", "Viseu", "Vizela", "Vouzela"
  ].sort((a, b) => a.localeCompare(b, 'pt'));
}

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    school: "",
    municipality: "",
  });
  const [message, setMessage] = useState("");
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch schools
    fetch(`${API_URL}/api/auth/schools`)
      .then(res => res.json())
      .then(data => setSchools(data.filter(s => s.approved).map(s => s.name)))
      .catch(console.error);
    
    // Carregar municípios do pacote
    loadMunicipalities();
  }, []);

  async function loadMunicipalities() {
    try {
      const module = await import('portuguese-municipalities');
      console.log('Estrutura do pacote:', Object.keys(module));
      
      let munList = [];
      
      // Tentar diferentes formas de acesso
      if (module.municipalities && Array.isArray(module.municipalities)) {
        munList = module.municipalities;
      } else if (module.default && Array.isArray(module.default)) {
        munList = module.default;
      } else if (Array.isArray(module)) {
        munList = module;
      } else {
        // Se não encontrar array, usar fallback
        console.warn('Não foi possível extrair lista de municípios do pacote');
        munList = getFallbackMunicipalities();
      }
      
      // Filtrar apenas municípios (remover distritos se houver)
      const filteredMunicipalities = munList.filter(item => {
        const lower = item.toLowerCase();
        // Remover distritos se estiverem na lista
        return ![
          'aveiro', 'beja', 'braga', 'bragança', 'castelo branco', 'coimbra',
          'évora', 'faro', 'guarda', 'leiria', 'lisboa', 'portalegre',
          'porto', 'santarém', 'setúbal', 'viana do castelo', 'vila real', 'viseu',
          'madeira', 'açores', 'região autónoma da madeira', 'região autónoma dos açores'
        ].some(distrito => lower.includes(distrito));
      });
      
      // Ordenar alfabeticamente
      const sorted = filteredMunicipalities.sort((a, b) => 
        a.localeCompare(b, 'pt')
      );
      
      setMunicipalities(sorted);
      
    } catch (err) {
      console.error('Erro ao carregar municípios:', err);
      setMunicipalities(getFallbackMunicipalities());
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validações
    if (form.password !== form.confirmPassword) {
      setMessage("Palavra-passe e confirmação não coincidem.");
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setMessage("Palavra-passe deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("Email inválido.");
      setIsLoading(false);
      return;
    }

    if (!form.phone) {
      setMessage("Preencha o telefone.");
      setIsLoading(false);
      return;
    }

    if (!form.municipality) {
      setMessage("Selecione um município.");
      setIsLoading(false);
      return;
    }

    try {
      // Registo com Supabase Auth
      console.log('🔄 A registar com Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            phone: form.phone,
            school: form.school,
            municipality: form.municipality
          }
        }
      });

      if (error) {
        console.error('❌ Erro Supabase:', error);
        setMessage("❌ " + error.message);
        setIsLoading(false);
        return;
      }

      console.log('✅ Registo Supabase bem-sucedido:', data);
      
      // Criar professor na nossa base de dados
      if (data.user) {
        await createTeacherInDatabase(data.user, form);
      }

      setMessage("Registo efetuado! Verifique o seu email para ativar a conta.");
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err) {
      console.error('💥 Erro:', err);
      setMessage("Erro de rede. Verifique a ligação ao servidor.");
      setIsLoading(false);
    }
  }

  // Função corrigida: Criar professor na nossa BD
  async function createTeacherInDatabase(user, formData) {
    try {
      console.log('🔄 DADOS para criar professor:', {
        supabaseUserId: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        school: formData.school,
        municipality: formData.municipality
      });

      const response = await fetch(`${API_URL}/api/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUserId: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          school: formData.school,
          municipality: formData.municipality
        }),
      });

      console.log('📤 Response status:', response.status);
      console.log('📤 Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('📦 Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao criar professor');
      }

      console.log('✅ Professor criado com sucesso na BD');
      return responseData;
    } catch (err) {
      console.error('💥 ERRO CRÍTICO ao criar professor:', err);
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header responsiva */}
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
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Criar Conta</h2>
            <p className="text-muted-foreground text-center">Registe-se para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nome", name: "name", type: "text", placeholder: "O seu nome completo" },
              { label: "Email", name: "email", type: "email", placeholder: "o_seu@email.com" },
              { label: "Palavra-passe", name: "password", type: "password", placeholder: "Mínimo 6 caracteres" },
              { label: "Confirmar Palavra-passe", name: "confirmPassword", type: "password", placeholder: "Confirme a palavra-passe" },
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
              <label className="block text-sm font-medium">Município</label>
              <select
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                disabled={municipalities.length === 0}
              >
                <option value="">{municipalities.length === 0 ? "A carregar municípios..." : "Selecione um município"}</option>
                {municipalities.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {municipalities.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {municipalities.length} municípios disponíveis
                </p>
              )}
            </div>

            {message && (
              <div className={`text-center text-sm font-medium py-3 rounded-xl ${
                message.includes("✅") || message.includes("Registo efetuado")
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
              disabled={isLoading || municipalities.length === 0}
            >
              {isLoading ? "A registar..." : "Registar"}
            </Button>
          </form>

          <p className="text-muted-foreground text-sm text-center mt-8">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Iniciar sessão
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}