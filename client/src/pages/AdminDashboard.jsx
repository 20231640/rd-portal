import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Users, 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Plus,
  Search,
  Download,
  Archive,
  RotateCcw,
  Menu
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { API_URL } from "../config/api";

export default function AdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newMunicipality, setNewMunicipality] = useState(""); // MUDADO: region → municipality
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [tempEditValue, setTempEditValue] = useState({ name: "", municipality: "" }); // MUDADO
  const [toast, setToast] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("schools");
  const [selectedMunicipality, setSelectedMunicipality] = useState("all"); // MUDADO: district → municipality
  const [selectedTeacherSchool, setSelectedTeacherSchool] = useState("all");
  const [archivedSchools, setArchivedSchools] = useState([]);
  const [archivedTeachers, setArchivedTeachers] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // LISTA COMPLETA DE MUNICÍPIOS (em ordem alfabética)
  const municipalities = [
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
  
  const navigate = useNavigate();

  // Toast helper
  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      console.log('🔄 Buscando dados para admin...');
      
      const [schoolsRes, teachersRes, archivedSchoolsRes, archivedTeachersRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/schools`),
        fetch(`${API_URL}/api/auth/teachers`),
        fetch(`${API_URL}/api/auth/schools?includeArchived=true`),
        fetch(`${API_URL}/api/auth/teachers?includeArchived=true`)
      ]);

      if (!schoolsRes.ok || !teachersRes.ok) {
        throw new Error("Erro ao buscar dados do servidor.");
      }

      const schoolsData = await schoolsRes.json();
      const teachersData = await teachersRes.json();
      const archivedSchoolsData = await archivedSchoolsRes.json();
      const archivedTeachersData = await archivedTeachersRes.json();
      
      console.log('✅ Dados carregados:', {
        escolas: schoolsData.length,
        professores: teachersData.length,
        escolasArquivadas: archivedSchoolsData.filter(s => s.archived).length,
        professoresArquivados: archivedTeachersData.filter(t => t.archived).length
      });

      // Separa ativos de arquivados
      const activeSchools = schoolsData.filter(school => !school.archived);
      const activeTeachers = teachersData.filter(teacher => !teacher.archived);
      const archivedSchools = archivedSchoolsData.filter(school => school.archived);
      const archivedTeachers = archivedTeachersData.filter(teacher => teacher.archived);

      setSchools(activeSchools);
      setTeachers(activeTeachers);
      setArchivedSchools(archivedSchools);
      setArchivedTeachers(archivedTeachers);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados do servidor.");
      setLoading(false);
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("loggedInAdmin");
    navigate("/");
  }

  // Escolas - Criar
  async function addSchool(e) {
    e.preventDefault();
    if (!newSchool.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newSchool.trim(), 
          municipality: newMunicipality.trim(), // MUDADO: region → municipality
          address: "Morada a definir"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar escola");
      setSchools((prev) => [...prev, data]);
      setNewSchool("");
      setNewMunicipality(""); // MUDADO
      showToast("Escola criada com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar escola.", "error");
    }
  }

  // Escolas - Aprovar
  async function approveSchool(id) {
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/approve`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Erro ao aprovar escola.");
      setSchools((prev) =>
        prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
      );
      showToast("Escola aprovada!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao aprovar escola.", "error");
    }
  }

  // Escolas - Rejeitar
  async function rejectSchool(id) {
    if (!window.confirm("Rejeitar esta escola?")) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao rejeitar escola");
      setSchools((prev) => prev.filter((s) => s.id !== id));
      showToast("Escola removida.");
    } catch (err) {
      console.error(err);
      showToast("Erro ao rejeitar escola.", "error");
    }
  }

  // Escolas - Editar
  async function saveSchoolEdit(id, { name, municipality }) { // MUDADO: region → municipality
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, municipality }), // MUDADO
      });
      if (!res.ok) throw new Error("Erro ao atualizar escola.");
      setSchools(prev =>
        prev.map(s => s.id === id ? { ...s, name, municipality } : s) // MUDADO
      );
      setEditingSchoolId(null);
      showToast("Escola atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar escola.", "error");
    }
  }

  // Professores - Bloquear/Desbloquear
  async function toggleTeacherBlock(id, currentlyBlocked) {
    try {
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao atualizar professor.");
      }

      const updatedTeacher = await res.json();
      
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? updatedTeacher : t))
      );
      
      showToast(!currentlyBlocked ? "Professor desbloqueado!" : "Professor bloqueado!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // Professores - Editar
  async function saveTeacherEdit(id, field, value) {
    try {
      const updateData = { [field]: value };
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao atualizar professor.");
      }

      const updatedTeacher = await res.json();
      
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? updatedTeacher : t))
      );
      
      setEditingTeacherId(null);
      showToast("Professor atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // Arquivar Escola
  async function archiveSchool(id) {
    try {
      console.log('📤 Arquivando escola ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/archive`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao arquivar escola");
      }

      const updatedSchool = await res.json();
      console.log('✅ Escola arquivada na BD:', updatedSchool);
      
      setSchools(prev => prev.filter(s => s.id !== id));
      setArchivedSchools(prev => [...prev, updatedSchool]);
      
      showToast("Escola arquivada com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao arquivar escola:', err);
      showToast(err.message, "error");
    }
  }

  // Restaurar Escola
  async function restoreSchool(id) {
    try {
      console.log('📤 Restaurando escola ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/restore`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao restaurar escola");
      }

      const restoredSchool = await res.json();
      console.log('✅ Escola restaurada na BD:', restoredSchool);
      
      setArchivedSchools(prev => prev.filter(s => s.id !== id));
      setSchools(prev => [...prev, restoredSchool]);
      
      showToast("Escola restaurada com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao restaurar escola:', err);
      showToast(err.message, "error");
    }
  }

  // Arquivar Professor
  async function archiveTeacher(id) {
    try {
      console.log('📤 Arquivando professor ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/archive`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao arquivar professor");
      }

      const updatedTeacher = await res.json();
      console.log('✅ Professor arquivado na BD:', updatedTeacher);
      
      setTeachers(prev => prev.filter(t => t.id !== id));
      setArchivedTeachers(prev => [...prev, updatedTeacher]);
      
      showToast("Professor arquivado com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao arquivar professor:', err);
      showToast(err.message, "error");
    }
  }

  // Restaurar Professor
  async function restoreTeacher(id) {
    try {
      console.log('📤 Restaurando professor ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/restore`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao restaurar professor");
      }

      const restoredTeacher = await res.json();
      console.log('✅ Professor restaurado na BD:', restoredTeacher);
      
      setArchivedTeachers(prev => prev.filter(t => t.id !== id));
      setTeachers(prev => [...prev, restoredTeacher]);
      
      showToast("Professor restaurado com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao restaurar professor:', err);
      showToast(err.message, "error");
    }
  }

  // Professores - Eliminar
  async function handleDeleteTeacher(id) {
    if (!window.confirm("Tem a certeza que quer apagar este professor?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao apagar professor.");
      }

      setTeachers(prev => prev.filter(t => t.id !== id));
      showToast("Professor removido com sucesso!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // Filtros ativos
  const filteredSchools = schools.filter(school =>
    (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     school.municipality?.toLowerCase().includes(searchTerm.toLowerCase())) && // MUDADO
    (selectedMunicipality === "all" || school.municipality === selectedMunicipality) // MUDADO
  );

  const filteredTeachers = teachers.filter(teacher => {
    const schoolName = schools.find(s => s.id === teacher.schoolId)?.name || "";
    const schoolMunicipality = schools.find(s => s.id === teacher.schoolId)?.municipality; // MUDADO
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchoolFilter = selectedTeacherSchool === "all" || String(teacher.schoolId) === String(selectedTeacherSchool);
    const matchesMunicipalityFilter = selectedMunicipality === "all" || schoolMunicipality === selectedMunicipality; // MUDADO
    return matchesSearch && matchesSchoolFilter && matchesMunicipalityFilter;
  });

  // Filtros arquivados
  const filteredArchivedSchools = archivedSchools.filter(school =>
    (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     school.municipality?.toLowerCase().includes(searchTerm.toLowerCase())) && // MUDADO
    (selectedMunicipality === "all" || school.municipality === selectedMunicipality) // MUDADO
  );

  const filteredArchivedTeachers = archivedTeachers.filter(teacher => {
    const allSchools = [...schools, ...archivedSchools];
    const schoolName = allSchools.find(s => s.id === teacher.schoolId)?.name || "";
    const schoolMunicipality = allSchools.find(s => s.id === teacher.schoolId)?.municipality; // MUDADO
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchoolFilter = selectedTeacherSchool === "all" || String(teacher.schoolId) === String(selectedTeacherSchool);
    const matchesMunicipalityFilter = selectedMunicipality === "all" || schoolMunicipality === selectedMunicipality; // MUDADO
    return matchesSearch && matchesSchoolFilter && matchesMunicipalityFilter;
  });

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          <Card className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Erro</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Tentar novamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      
      {/* Overlay para mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar mobile */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:hidden
      `}>
        <AdminSidebar />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Header mobile */}
        <div className="flex justify-between items-center mb-6 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Admin</h1>
          <div className="w-10"></div> {/* Espaçador para centralizar */}
        </div>

        {/* Header desktop */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground mt-2">
              Gestão das escolas e dos professores do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar escolas ou professores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={selectedMunicipality} // MUDADO
              onChange={(e) => setSelectedMunicipality(e.target.value)} // MUDADO
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filtrar por município" // MUDADO
            >
              <option value="all">Todos os municípios</option> {/* MUDADO */}
              {municipalities.map((m) => ( // MUDADO: districts → municipalities
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              {showArchived ? "Mostrar Ativos" : "Mostrar Arquivados"}
            </Button>
          </div>
        </div>

        {/* Filtros mobile */}
        <div className="sm:hidden flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedMunicipality} // MUDADO
              onChange={(e) => setSelectedMunicipality(e.target.value)} // MUDADO
              className="flex-1 h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos municípios</option> {/* MUDADO */}
              {municipalities.map((m) => ( // MUDADO: districts → municipalities
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="h-12 px-4"
            >
              <Archive className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`
            fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border
            ${toast.type === "error" 
              ? "bg-destructive text-destructive-foreground border-destructive" 
              : "bg-primary text-primary-foreground border-primary"
            }
            animate-slide-in-right
          `}>
            {toast.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-full sm:w-fit overflow-x-auto">
          <Button
            variant={activeTab === "schools" ? "default" : "ghost"}
            onClick={() => setActiveTab("schools")}
            className="rounded-lg flex-1 sm:flex-none"
          >
            <Building className="w-4 h-4 mr-2" />
            Escolas ({showArchived ? archivedSchools.length : schools.length})
          </Button>
          <Button
            variant={activeTab === "teachers" ? "default" : "ghost"}
            onClick={() => setActiveTab("teachers")}
            className="rounded-lg flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4 mr-2" />
            Professores ({showArchived ? archivedTeachers.length : teachers.length})
          </Button>
        </div>

        {/* Schools Tab */}
        {activeTab === "schools" && (
          <div className="space-y-6">
            {!showArchived ? (
              <>
                {/* Add School Card - só mostra para ativos */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Adicionar Nova Escola
                  </h2>
                  <form onSubmit={addSchool} className="flex flex-col gap-3">
                    <input
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      placeholder="Nome da Escola"
                      required
                      className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <select
                      value={newMunicipality} // MUDADO
                      onChange={(e) => setNewMunicipality(e.target.value)} // MUDADO
                      required
                      className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecionar Município</option> {/* MUDADO */}
                      {municipalities.map((m) => ( // MUDADO: districts → municipalities
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <Button type="submit" className="w-full h-12 text-base">
                      <Plus className="w-5 h-5 mr-2" />
                      Criar escola
                    </Button>
                  </form>
                </Card>

                {/* Schools List Ativas */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Escolas Ativas</h2>
                  
                  {filteredSchools.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma escola ativa encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSchools.map((school) => (
                        <div key={school.id} className="border border-border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Building className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                {editingSchoolId === school.id ? (
                                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                    <input
                                      value={tempEditValue.name}
                                      onChange={(e) => setTempEditValue(prev => ({ ...prev, name: e.target.value }))}
                                      className="w-full sm:w-64 h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    
                                    <select
                                      value={tempEditValue.municipality} // MUDADO
                                      onChange={(e) => setTempEditValue(prev => ({ ...prev, municipality: e.target.value }))} // MUDADO
                                      className="w-full sm:w-auto h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      <option value="">Selecionar Município</option> {/* MUDADO */}
                                      {municipalities.map((m) => ( // MUDADO: districts → municipalities
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveSchoolEdit(school.id, tempEditValue)}
                                      >
                                        <Save className="w-4 h-4 mr-1" />
                                        Guardar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingSchoolId(null)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h3 
                                      className="font-semibold cursor-pointer hover:text-primary transition-colors text-lg sm:text-base"
                                      onClick={() => {
                                        setEditingSchoolId(school.id);
                                        setTempEditValue({ name: school.name, municipality: school.municipality || "" }); // MUDADO
                                      }}
                                    >
                                      {school.name}
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                                      <p>{teachers.filter(t => t.schoolId === school.id).length} professores</p>
                                      {school.municipality && ( // MUDADO
                                        <p>📍 {school.municipality}</p> // MUDADO
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {!school.approved ? (
                                <Button
                                  size="sm"
                                  onClick={() => approveSchool(school.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  Aprovada
                                </span>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
                              >
                                {expandedSchool === school.id ? "Fechar" : "Ver professores"}
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => archiveSchool(school.id)}
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Arquivar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectSchool(school.id)}
                                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Teachers List */}
                          {expandedSchool === school.id && (
                            <div className="mt-4 pl-4 sm:pl-8 border-l-2 border-border">
                              <h4 className="font-medium mb-2">Professores desta escola:</h4>
                              {teachers.filter(t => t.schoolId === school.id).length > 0 ? (
                                <div className="space-y-2">
                                  {teachers
                                    .filter(t => t.schoolId === school.id)
                                    .map(teacher => (
                                      <div key={teacher.id} className="flex items-center justify-between py-2 px-3 bg-muted rounded">
                                        <div>
                                          <p className="font-medium">{teacher.name}</p>
                                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                        </div>
                                        {teacher.blocked && (
                                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                                            BLOQUEADO
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  }
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-sm">Nenhum professor registado.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              /* Schools Arquivadas */
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Escolas Arquivadas</h2>
                {filteredArchivedSchools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma escola arquivada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArchivedSchools.map((school) => (
                      <div key={school.id} className="border border-amber-200 dark:border-amber-700 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <div>
                              <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                                {school.name}
                              </h3>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-amber-600 dark:text-amber-400 mt-1">
                                {school.municipality && <p>📍 {school.municipality}</p>} {/* MUDADO */}
                                <p>Arquivada em: {new Date(school.archivedAt).toLocaleDateString('pt-PT')}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreSchool(school.id)}
                              className="bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setArchivedSchools(prev => prev.filter(s => s.id !== school.id));
                                showToast("Escola removida permanentemente.");
                              }}
                              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {showArchived ? "Professores Arquivados" : "Professores Ativos"}
            </h2>
            
            {/* Filtrar por Escola */}
            <div className="flex gap-3 items-center mb-4">
              <label className="text-sm text-muted-foreground">Filtrar por Escola:</label>
              <select
                value={selectedTeacherSchool}
                onChange={(e) => setSelectedTeacherSchool(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas as Escolas</option>
                {(showArchived ? archivedSchools : schools).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="sm:hidden space-y-4">
              {!showArchived ? (
                filteredTeachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum professor ativo encontrado</p>
                  </div>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <Card key={teacher.id} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-lg">{teacher.name}</p>
                          <p className="text-muted-foreground">{teacher.email}</p>
                          <p className="text-sm">{teacher.phone || "—"}</p>
                          <p className="text-sm text-primary">
                            {schools.find(s => s.id === teacher.schoolId)?.name || "—"}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Button
                            variant={teacher.blocked ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTeacherBlock(teacher.id, teacher.blocked)}
                            className={teacher.blocked ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {teacher.blocked ? "Desbloquear" : "Bloquear"}
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => archiveTeacher(teacher.id)}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )
              ) : (
                /* Professores Arquivados Mobile */
                filteredArchivedTeachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum professor arquivado</p>
                  </div>
                ) : (
                  filteredArchivedTeachers.map((teacher) => (
                    <Card key={teacher.id} className="p-4 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-lg text-amber-800 dark:text-amber-300">{teacher.name}</p>
                          <p className="text-amber-700 dark:text-amber-400">{teacher.email}</p>
                          <p className="text-sm text-amber-600 dark:text-amber-500">{teacher.phone || "—"}</p>
                          <p className="text-sm text-amber-600 dark:text-amber-500">
                            Arquivado em: {new Date(teacher.archivedAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreTeacher(teacher.id)}
                            className="bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restaurar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                            onClick={() => {
                              setArchivedTeachers(prev => prev.filter(t => t.id !== teacher.id));
                              showToast("Professor removido permanentemente.");
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )
              )}
            </div>

            {/* Vista Desktop - Tabela */}
            <div className="hidden sm:block">
              {!showArchived ? (
                filteredTeachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum professor ativo encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium">Nome</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Telefone</th>
                          <th className="text-left p-3 font-medium">Escola</th>
                          <th className="text-left p-3 font-medium">Estado</th>
                          <th className="text-left p-3 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="p-3">
                              {editingTeacherId === `name-${teacher.id}` ? (
                                <input
                                  value={tempEditValue}
                                  onChange={(e) => setTempEditValue(e.target.value)}
                                  onBlur={() => saveTeacherEdit(teacher.id, "name", tempEditValue)}
                                  autoFocus
                                  className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span
                                  className="cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => {
                                    setEditingTeacherId(`name-${teacher.id}`);
                                    setTempEditValue(teacher.name);
                                  }}
                                >
                                  {teacher.name}
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              {editingTeacherId === `email-${teacher.id}` ? (
                                <input
                                  value={tempEditValue}
                                  onChange={(e) => setTempEditValue(e.target.value)}
                                  onBlur={() => saveTeacherEdit(teacher.id, "email", tempEditValue)}
                                  autoFocus
                                  className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span
                                  className="cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => {
                                    setEditingTeacherId(`email-${teacher.id}`);
                                    setTempEditValue(teacher.email);
                                  }}
                                >
                                  {teacher.email}
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              {editingTeacherId === `phone-${teacher.id}` ? (
                                <input
                                  value={tempEditValue}
                                  onChange={(e) => setTempEditValue(e.target.value)}
                                  onBlur={() => saveTeacherEdit(teacher.id, "phone", tempEditValue)}
                                  autoFocus
                                  className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span
                                  className="cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => {
                                    setEditingTeacherId(`phone-${teacher.id}`);
                                    setTempEditValue(teacher.phone || "");
                                  }}
                                >
                                  {teacher.phone || "—"}
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              {schools.find(s => s.id === teacher.schoolId)?.name || "—"}
                            </td>

                            <td className="p-3">
                              <Button
                                variant={teacher.blocked ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTeacherBlock(teacher.id, teacher.blocked)}
                                className={teacher.blocked ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                {teacher.blocked ? "Desbloquear" : "Bloquear"}
                              </Button>
                            </td>

                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => archiveTeacher(teacher.id)}
                                >
                                  <Archive className="w-4 h-4 mr-1" />
                                  Arquivar
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Professores Arquivados Desktop */
                filteredArchivedTeachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum professor arquivado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-amber-200 dark:border-amber-700">
                          <th className="text-left p-3 font-medium">Nome</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Telefone</th>
                          <th className="text-left p-3 font-medium">Escola</th>
                          <th className="text-left p-3 font-medium">Arquivado em</th>
                          <th className="text-left p-3 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredArchivedTeachers.map((teacher) => (
                          <tr key={teacher.id} className="border-b border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors">
                            <td className="p-3 text-amber-800 dark:text-amber-300 font-medium">{teacher.name}</td>
                            <td className="p-3 text-amber-700 dark:text-amber-400">{teacher.email}</td>
                            <td className="p-3 text-amber-700 dark:text-amber-400">{teacher.phone || "—"}</td>
                            <td className="p-3 text-amber-700 dark:text-amber-400">
                              {schools.find(s => s.id === teacher.schoolId)?.name || "—"}
                            </td>
                            <td className="p-3 text-amber-600 dark:text-amber-500 text-sm">
                              {new Date(teacher.archivedAt).toLocaleDateString('pt-PT')}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => restoreTeacher(teacher.id)}
                                  className="bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600"
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Restaurar
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setArchivedTeachers(prev => prev.filter(t => t.id !== teacher.id));
                                    showToast("Professor removido permanentemente.");
                                  }}
                                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}